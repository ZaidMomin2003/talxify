
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Bot, PhoneOff, AlertTriangle, User, BrainCircuit, MessageSquare, Maximize, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { generateInterviewFeedback } from '@/ai/flows/generate-interview-feedback';
import { textToSpeechWithDeepgram } from '@/ai/flows/deepgram-tts';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import Image from 'next/image';

type InterviewStatus = 'initializing' | 'generating_questions' | 'ready' | 'listening' | 'speaking' | 'processing' | 'finished' | 'error';

const statusInfo: { [key in InterviewStatus]: { text: string; showMic?: boolean } } = {
  initializing: { text: "Initializing Session..." },
  generating_questions: { text: "AI is preparing questions..." },
  ready: { text: "Ready to Start. The AI will speak first." },
  listening: { text: "Hold Space to Talk", showMic: true },
  speaking: { text: "AI is Speaking..." },
  processing: { text: "Processing your answer..." },
  finished: { text: "Interview Finished" },
  error: { text: "Connection Error" },
};


function InterviewComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [status, setStatus] = useState<InterviewStatus>('initializing');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const deepgramConnection = useRef<LiveClient | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const isPlayingRef = useRef(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const finalTranscriptRef = useRef<string>('');

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';
  const isIcebreaker = topic === 'Icebreaker Introduction';

  useEffect(() => {
    if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);


  const stopInterview = useCallback(async (save: boolean) => {
    setStatus('finished');
    if (recorder.current && recorder.current.state === 'recording') {
        recorder.current.stop();
    }
    if (deepgramConnection.current) {
        deepgramConnection.current.finish();
        deepgramConnection.current = null;
    }

    if (save && user && transcript.length > 1) {
        try {
            const feedback = await generateInterviewFeedback({ transcript, topic, role, company });
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcript,
                feedback: "Feedback generated.", // This is a placeholder
                analysis: feedback,
                details: { topic, role, level, company, score: feedback.overallScore }
            };
            await addActivity(user.uid, finalActivity);
            router.push(`/dashboard/interview/${finalActivity.id}/results`);
        } catch(e) {
            console.error("Failed to generate and save feedback:", e);
             router.push('/dashboard/arena');
        }
    } else {
        router.push('/dashboard/arena');
    }
  }, [user, interviewId, topic, role, level, company, router, transcript]);


  const playAudio = useCallback(() => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    
    isPlayingRef.current = true;
    setStatus('speaking');
    const audio = audioQueueRef.current.shift();
    if (audio) {
      audio.onended = () => {
        isPlayingRef.current = false;
        if (currentQuestionIndex >= questions.length && audioQueueRef.current.length === 0) {
            stopInterview(true);
        } else {
            setStatus('listening');
        }
        playAudio();
      };
      audio.play().catch(e => {
        console.error("Audio play failed:", e);
        isPlayingRef.current = false;
        setStatus('listening');
      });
    } else {
      isPlayingRef.current = false;
    }
  }, [currentQuestionIndex, questions.length, stopInterview]);

  const speak = useCallback(async (text: string) => {
    try {
      const response = await textToSpeechWithDeepgram({ text });
      const audio = new Audio(response.audioDataUri);
      audioQueueRef.current.push(audio);
      if (!isPlayingRef.current) {
        playAudio();
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setStatus('listening');
    }
  }, [playAudio]);

  const askNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length) {
        const questionText = questions[currentQuestionIndex];
        setTranscript(prev => [...prev, { speaker: 'ai', text: questionText }]);
        speak(questionText);
        setCurrentQuestionIndex(prev => prev + 1);
    } else {
        speak("That's all the questions I have. Thank you for your time.");
    }
  }, [currentQuestionIndex, questions, speak]);


  useEffect(() => {
    if (!user) {
        router.push('/login');
        return;
    }

    const generateQuestions = async () => {
        setStatus('generating_questions');
        try {
            const result = await generateInterviewQuestions({ role, level, technologies: topic });
            setQuestions(result.questions.slice(0, isIcebreaker ? 2 : 4));
            setStatus('ready');
        } catch (error) {
            console.error("Failed to generate questions:", error);
            setStatus('error');
        }
    };
    generateQuestions();
  }, [user, router, role, level, topic, isIcebreaker]);

  useEffect(() => {
    if (status === 'ready' && questions.length > 0 && transcript.length === 0) {
      const intro = isIcebreaker 
        ? "Hello, welcome to Talxify. Let's start with a quick icebreaker. Can you please tell me about yourself?"
        : `Welcome to your mock interview for a ${level} ${role} role, focusing on ${topic}. Let's start with your first question.`;
      
      setTranscript([{ speaker: 'ai', text: intro }]);
      speak(intro);
      
      setTimeout(() => {
        if(!isIcebreaker) {
            askNextQuestion();
        } else {
            setStatus('listening');
        }
      }, isIcebreaker ? 4000 : 5000);
    }
  }, [status, questions, transcript, askNextQuestion, speak, role, level, topic, isIcebreaker]);
  

  const startRecording = useCallback(async () => {
    if (isRecording || status !== 'listening') return;
    setIsRecording(true);
    finalTranscriptRef.current = '';

    try {
        const response = await fetch('/api/auth/deepgram-key', { method: 'POST' });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        const { key } = data;

        const deepgram = createClient(key);
        const connection = deepgram.listen.live({
            model: "nova-2",
            interim_results: true,
            smart_format: true,
        });

        connection.on(LiveTranscriptionEvents.Open, async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            
            recorder.current.ondataavailable = (event) => {
                if (event.data.size > 0 && connection.getReadyState() === 1) {
                    connection.send(event.data);
                }
            };
            
            recorder.current.start(250); // Start recording and send data every 250ms
        });
        
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            if (data.is_final && data.channel.alternatives[0].transcript) {
                 finalTranscriptRef.current += data.channel.alternatives[0].transcript + ' ';
            }
        });

        connection.on(LiveTranscriptionEvents.Close, () => {
            console.log("Deepgram connection closed.");
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
            console.error(err);
            setStatus('error');
        });

        deepgramConnection.current = connection;
    } catch(e) {
        console.error("Failed to start Deepgram:", e);
        setStatus('error');
        setIsRecording(false);
    }
  }, [isRecording, status]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (recorder.current && recorder.current.state === 'recording') {
        recorder.current.stop();
        recorder.current = null;
    }
    if (deepgramConnection.current) {
        deepgramConnection.current.finish();
        deepgramConnection.current = null;
    }

    setStatus('processing');

    // Wait a moment for the final transcript to come in
    setTimeout(() => {
        if (finalTranscriptRef.current.trim()) {
            setTranscript(prev => [...prev, { speaker: 'user', text: finalTranscriptRef.current.trim() }]);
        }
        
        const ack = "Okay, thank you.";
        setTranscript(prev => [...prev, { speaker: 'ai', text: ack }]);
        speak(ack);
        setTimeout(() => askNextQuestion(), 3000);
    }, 1500);

  }, [isRecording, askNextQuestion, speak]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat && status === 'listening') {
        event.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isRecording) {
        event.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      // Cleanup connections on component unmount
      if (recorder.current && recorder.current.state === 'recording') recorder.current.stop();
      if (deepgramConnection.current) deepgramConnection.current.finish();
    };
  }, [startRecording, stopRecording, isRecording, status]);

  const toggleFullScreen = () => {
    if (!mainContainerRef.current) return;
    if (!document.fullscreenElement) {
        mainContainerRef.current.requestFullscreen();
        setIsFullScreen(true);
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    }
  }

  const currentStatusInfo = statusInfo[status];

  return (
    <div ref={mainContainerRef} className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        {status === 'error' || status === 'generating_questions' || status === 'initializing' ? (
             <Card className="w-full max-w-lg text-center p-8">
                {status === 'error' ? (
                     <div className="text-destructive">
                        <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-xl font-bold">Connection Failed</h2>
                        <p>Could not connect. Please check microphone permissions and try again.</p>
                    </div>
                ) : (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4"/>
                        <p className="text-lg text-muted-foreground">{currentStatusInfo.text}</p>
                    </>
                )}
             </Card>
        ) : (
        <div className="w-full h-full flex flex-col">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-0">
                <div className="md:col-span-3 h-full bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden p-8 bg-[url('/popup.png')] bg-cover">
                     <div className="absolute inset-0 bg-black/50"></div>
                     <div className="relative flex flex-col items-center gap-4 text-center z-10">
                        <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                            isRecording ? 'border-red-500/50' :
                            status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                        )}>
                            <Image src="/robot.png" alt="AI Interviewer" width={192} height={192} className="rounded-full" data-ai-hint="robot face" />
                             <div className={cn("absolute inset-0 rounded-full animate-pulse",
                                isRecording ? 'bg-red-500/20' : 
                                status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                            )}></div>
                        </div>
                        <h2 className="text-2xl font-bold font-headline">AI Interviewer</h2>
                    </div>

                    <div className="absolute bottom-4 right-4 p-4 border rounded-lg bg-background shadow-lg h-32 w-48 flex flex-col items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground" />
                        <p className="font-semibold mt-2">You</p>
                    </div>

                    <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-green-900/50 text-green-300 border border-green-700">
                        <div className="flex items-center gap-2">
                             <Mic className={cn("transition-colors", isRecording ? "text-red-500" : "text-green-500")} />
                            <span className="font-semibold text-sm">Hold <Badge variant="secondary">Space</Badge> to Speak</span>
                        </div>
                    </div>
                </div>

                <div ref={transcriptContainerRef} className="md:col-span-1 h-full flex flex-col gap-4 min-h-0 bg-muted rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 shrink-0"><MessageSquare className="w-5 h-5"/> Transcript</h3>
                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 text-sm">
                        {transcript.map((entry, index) => (
                            <div key={index} className={cn("flex flex-col", entry.speaker === 'user' ? 'items-end' : 'items-start')}>
                                <div className={cn("max-w-[90%] p-3 rounded-lg", entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                    <p className="font-bold mb-1 capitalize">{entry.speaker}</p>
                                    <p>{entry.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="p-4 border-t flex items-center justify-center gap-4">
                 <Button variant="outline" size="icon" className="rounded-full h-14 w-14">
                    <Mic className="w-6 h-6"/>
                 </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-14 w-14">
                    <Video className="w-6 h-6"/>
                 </Button>
                 <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={() => stopInterview(true)} disabled={status === 'initializing' || status === 'finished'}>
                    <PhoneOff className="w-6 h-6" />
                 </Button>
                 <Button variant="outline" size="icon" className="rounded-full h-14 w-14" onClick={toggleFullScreen}>
                    <Maximize className="w-6 h-6"/>
                 </Button>
            </footer>
        </div>
        )}
    </div>
  );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <InterviewComponent />
        </Suspense>
    )
}

    