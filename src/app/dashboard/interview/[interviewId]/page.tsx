
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getAssemblyAiToken } from '@/app/actions/assemblyai';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import type RecordRTC from 'recordrtc';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Bot, PhoneOff, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { textToSpeechWithGoogle } from '@/ai/flows/google-tts';
import { generateInterviewFeedback } from '@/ai/flows/generate-interview-feedback';


type InterviewStatus = 'initializing' | 'generating_questions' | 'ready' | 'listening' | 'speaking' | 'processing' | 'finished' | 'error';

const statusInfo: { [key in InterviewStatus]: { text: string; showMic?: boolean } } = {
  initializing: { text: "Initializing Session..." },
  generating_questions: { text: "AI is preparing questions..." },
  ready: { text: "Ready to Start. The AI will speak first." },
  listening: { text: "Listening... (Hold Spacebar to Talk)", showMic: true },
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
  
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);
  const audioQueueRef = useRef<HTMLAudioElement[]>([]);
  const isPlayingRef = useRef(false);

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const stopInterview = useCallback(async (save: boolean) => {
    setStatus('finished');
    if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
            const stream = recorderRef.current?.getMediaStream();
            if (stream) {
                stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            }
            recorderRef.current = null;
        });
    }
    if (socketRef.current) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
        socketRef.current.close();
        socketRef.current = null;
    }

    if (save && user && transcript.length > 1) {
        try {
            const feedback = await generateInterviewFeedback({ transcript, topic, role, company });
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcript,
                feedback: "Feedback generated.",
                analysis: feedback,
                details: { topic, role, level, company }
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
      const response = await textToSpeechWithGoogle({ text });
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
            setQuestions(result.questions.slice(0, 4));
            setStatus('ready');
        } catch (error) {
            console.error("Failed to generate questions:", error);
            setStatus('error');
        }
    };
    generateQuestions();
  }, [user, router, role, level, topic]);

  useEffect(() => {
    if (status === 'ready' && questions.length > 0 && transcript.length === 0) {
      const intro = `Welcome to your mock interview for a ${level} ${role} role, focusing on ${topic}. Let's start with your first question.`;
      setTranscript([{ speaker: 'ai', text: intro }]);
      speak(intro);
      setTimeout(() => {
        askNextQuestion();
      }, 5000);
    }
  }, [status, questions, transcript, askNextQuestion, speak, role, level, topic]);
  

  const startRecording = useCallback(async () => {
    if (isRecording || status !== 'listening') return;
    setIsRecording(true);
    
    try {
      const token = await getAssemblyAiToken();
      socketRef.current = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
    } catch (e) {
      console.error("Failed to get AssemblyAI token:", e);
      setStatus('error');
      setIsRecording(false);
      return;
    }

    const socket = socketRef.current;

    socket.onmessage = (message) => {
        const res = JSON.parse(message.data);
        if (res.message_type === 'FinalTranscript' && res.text) {
             setTranscript(prev => [...prev, { speaker: 'user', text: res.text }]);
        }
    };

    socket.onerror = (event) => {
      console.error(event);
      socket.close();
      setStatus('error');
    };
    
    socket.onclose = () => {
      socketRef.current = null;
    };

    socket.onopen = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const RecordRTC = (await import('recordrtc')).default;
        recorderRef.current = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/webm;codecs=pcm',
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 250,
            desiredSampRate: 16000,
            numberOfAudioChannels: 1,
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob: Blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (socket.readyState === WebSocket.OPEN) {
                  const base64data = (reader.result as string).split(',')[1];
                  socket.send(JSON.stringify({ audio_data: base64data }));
                }
              };
              reader.readAsDataURL(blob);
            },
        });
        recorderRef.current.startRecording();
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
  }, [isRecording, status]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recorderRef.current) {
        recorderRef.current.stopRecording(() => {
             const stream = recorderRef.current?.getMediaStream();
             if (stream) {
                stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            }
            recorderRef.current = null;
        });
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
    }
    socketRef.current = null;

    setStatus('processing');
    
    setTimeout(() => {
        const ack = "Okay, thank you for your answer.";
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
    };
  }, [startRecording, stopRecording, isRecording, status]);
  
  const currentStatusInfo = statusInfo[status];
  const lastTranscriptEntry = transcript.slice(-1)[0];

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
            <header className="p-4 border-b flex items-center justify-between">
                <h1 className="text-lg font-semibold">{topic} Interview</h1>
                <Badge variant={status === 'error' ? 'destructive' : 'secondary'} className={cn(
                    status === 'listening' ? 'bg-green-500/10 text-green-600' : 
                    status === 'speaking' ? 'bg-blue-500/10 text-blue-600' : '', 'capitalize'
                )}>{currentStatusInfo.text}</Badge>
            </header>
            <CardContent className="p-6 flex-grow flex flex-col items-center justify-center gap-8 text-center bg-muted/30 m-4 rounded-lg">
                {status === 'error' ? (
                     <div className="text-center text-destructive">
                        <AlertTriangle className="w-24 h-24 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Connection Failed</h2>
                        <p>Could not connect. Please check your microphone permissions and try again.</p>
                    </div>
                ) : (status === 'generating_questions' || status === 'initializing') ? (
                    <>
                        <Loader2 className="h-20 w-20 animate-spin text-primary"/>
                        <p className="text-lg text-muted-foreground">{currentStatusInfo.text}</p>
                    </>
                ) : (
                <>
                    <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                        isRecording ? 'border-red-500/50' :
                        status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                    )}>
                        {status === 'listening' ? <Mic className={cn("h-20 w-20 text-green-500", isRecording && "text-red-500")}/> : <Bot className="w-24 h-24 text-primary" />}
                        <div className={cn("absolute inset-0 rounded-full animate-pulse",
                        isRecording ? 'bg-red-500/20' : 
                        status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                        )}></div>
                    </div>

                    <div className="h-24 px-8 text-lg text-foreground font-medium flex items-center justify-center">
                        <p>{lastTranscriptEntry ? lastTranscriptEntry.text : 'The interview will begin shortly...'}</p>
                    </div>
                 </>
                )}
            </CardContent>
            
            <div className="flex items-center justify-center gap-4 p-6 border-t">
                 <Button variant="destructive" size="lg" onClick={() => stopInterview(true)} disabled={status === 'initializing' || status === 'finished'}>
                    <PhoneOff className="mr-2" />
                    End Interview
                 </Button>
            </div>
        </Card>
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
