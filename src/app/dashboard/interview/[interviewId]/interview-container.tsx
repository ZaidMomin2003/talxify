
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMeeting, usePubSub } from '@videosdk.live/react-sdk';
import { useSearchParams } from 'next/navigation';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { textToSpeech, TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { speechToText, SpeechToTextInput } from '@/ai/flows/speech-to-text';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2, MessageSquare, Bot, Power, User } from 'lucide-react';
import { MessageData } from 'genkit/model';
import type { InterviewState } from '@/lib/interview-types';

type TranscriptEntry = {
  speaker: 'user' | 'ai';
  text: string;
};

type SessionStatus = 'idle' | 'listening' | 'processing' | 'speaking';

export function InterviewContainer({ interviewId }: { interviewId: string }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [interviewState, setInterviewState] = useState<InterviewState>({
    interviewId: interviewId,
    topic: searchParams.get('topic') || 'general',
    level: searchParams.get('level') || 'entry-level',
    role: searchParams.get('role') || 'Software Engineer',
    history: [],
    questionsAsked: 0,
    isComplete: false,
  });

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState<SessionStatus>('idle');

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { join, leave, toggleWebcam, localWebcamOn } = useMeeting();

  const processUserSpeech = useCallback(async (audioBlob: Blob) => {
    setStatus('processing');
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        if (!base64Audio) {
            setStatus('idle');
            return;
        }

        try {
            const { transcript: userTranscript } = await speechToText({ audioDataUri: base64Audio });
            if (userTranscript && userTranscript.trim()) {
                setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);
                
                const newHistory: MessageData[] = [...interviewState.history, { role: 'user', content: [{ text: userTranscript }] }];
                const updatedState = { ...interviewState, history: newHistory };
                setInterviewState(updatedState);
                
                // Get AI response
                setStatus('speaking');
                const aiResult = await generateInterviewResponse(updatedState);
                
                if (aiResult.newState) {
                  setInterviewState(aiResult.newState);
                }
                
                setTranscript(prev => [...prev, { speaker: 'ai', text: aiResult.response }]);
                
                const { audioDataUri } = await textToSpeech({ text: aiResult.response });
                if (audioPlayerRef.current) {
                    audioPlayerRef.current.src = audioDataUri;
                    audioPlayerRef.current.play();
                }

                if (aiResult.newState.isComplete) {
                   if(user){
                       const finalTranscript = [...transcript, { speaker: 'user', text: userTranscript }, { speaker: 'ai', text: aiResult.response }];
                       const interviewActivity: InterviewActivity = {
                            id: interviewId,
                            type: 'interview',
                            timestamp: new Date().toISOString(),
                            transcript: finalTranscript,
                            feedback: aiResult.response,
                            details: {
                                topic: interviewState.topic,
                                role: interviewState.role,
                                level: interviewState.level,
                            }
                       }
                       await addActivity(user.uid, interviewActivity);
                   }
                   setTimeout(() => {
                      setIsSessionActive(false);
                      setStatus('idle');
                      toast({ title: "Interview Complete!", description: "Your results have been saved to your activity log."});
                      router.push('/dashboard');
                   }, 5000);
                }
            } else {
                // If transcript is empty, just go back to listening
                setStatus('listening');
            }
        } catch (error) {
            console.error("Error processing speech:", error);
            toast({ variant: "destructive", title: "Processing Error", description: "Could not process your audio. Please try again." });
            setStatus('listening');
        }
    };
  }, [interviewState, toast, user, interviewId, transcript, router]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
    }
    if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
    }
  }, []);
  
  const startRecording = useCallback(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                // Setup MediaRecorder
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    if (audioBlob.size > 1000) { // Only process if there's some audio
                        processUserSpeech(audioBlob);
                    } else {
                        // If no audio, just go back to listening
                        setStatus('listening');
                    }
                    audioChunksRef.current = [];
                };

                // Setup VAD
                audioContextRef.current = new window.AudioContext();
                analyserRef.current = audioContextRef.current.createAnalyser();
                const source = audioContextRef.current.createMediaStreamSource(stream);
                source.connect(analyserRef.current);
                analyserRef.current.fftSize = 512;
                const bufferLength = analyserRef.current.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                let isSpeaking = false;
                const speakingThreshold = 20; // Adjust as needed
                const silenceDelay = 1500; // 1.5 seconds of silence to stop

                const detectSpeech = () => {
                    if (status !== 'listening') return;

                    analyserRef.current?.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

                    if (average > speakingThreshold) {
                        if (!isSpeaking) {
                            isSpeaking = true;
                            if (mediaRecorderRef.current?.state === 'inactive') {
                                mediaRecorderRef.current.start();
                            }
                        }
                        if (silenceTimeoutRef.current) {
                            clearTimeout(silenceTimeoutRef.current);
                        }
                    } else if (isSpeaking) {
                        if (!silenceTimeoutRef.current) {
                            silenceTimeoutRef.current = setTimeout(() => {
                                isSpeaking = false;
                                stopRecording();
                            }, silenceDelay);
                        }
                    }
                    requestAnimationFrame(detectSpeech);
                };
                
                setStatus('listening');
                detectSpeech();
            })
            .catch(err => {
                console.error("Mic access error:", err);
                toast({ variant: 'destructive', title: 'Microphone Access Denied', description: 'Please enable microphone access to start the interview.' });
                setIsSessionActive(false);
            });
    }
  }, [processUserSpeech, stopRecording, status, toast]);


  useEffect(() => {
      const player = audioPlayerRef.current;
      if (!player) return;
      const handleAudioEnd = () => {
        if (!interviewState.isComplete) {
            startRecording();
        } else {
            setStatus('idle');
        }
      };
      player.addEventListener('ended', handleAudioEnd);
      return () => player.removeEventListener('ended', handleAudioEnd);
  }, [startRecording, interviewState.isComplete]);


  const startSession = async () => {
    join();
    setIsSessionActive(true);
    setStatus('speaking');
    try {
        const result = await generateInterviewResponse(interviewState);
        setInterviewState(result.newState);
        setTranscript(prev => [...prev, { speaker: 'ai', text: result.response }]);
        const { audioDataUri } = await textToSpeech({ text: result.response });
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play();
        }
    } catch (error) {
         console.error("Failed to start interview:", error);
         toast({ variant: "destructive", title: "Interview Start Error", description: "Could not start the interview session." });
         setIsSessionActive(false);
    }
  }

  const endSession = () => {
    stopRecording();
    leave();
    setIsSessionActive(false);
    router.push('/dashboard');
  }

  const getStatusIndicator = () => {
    switch (status) {
        case 'listening':
            return <div className="flex items-center justify-center gap-2 text-green-400"><Mic className="h-5 w-5 animate-pulse" /><span>Listening...</span></div>;
        case 'speaking':
            return <div className="flex items-center justify-center gap-2 text-blue-400"><Bot className="h-5 w-5" /><span>AI Speaking...</span></div>;
        case 'processing':
            return <div className="flex items-center justify-center gap-2 text-yellow-400"><Loader2 className="h-5 w-5 animate-spin" /><span>Processing...</span></div>;
        default:
            return <div className="flex items-center justify-center gap-2 text-muted-foreground"><Power className="h-5 w-5" /><span>Session Idle</span></div>;
    }
  };


  if (!isSessionActive) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Card className="max-w-lg text-center">
            <CardHeader>
              <CardTitle>Ready for your mock interview?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Click the button below to start your session. Make sure your microphone is enabled.
              </p>
              <Button onClick={startSession} size="lg">Start Session</Button>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col p-4 gap-4">
        <audio ref={audioPlayerRef} hidden />
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
                <video
                    ref={(ref) => ref && ref.setAttribute('playsinline', 'true')}
                    autoPlay
                    className="w-full h-full object-cover"
                />
                 {!localWebcamOn && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <VideoOff className="w-16 h-16 mb-4"/>
                        <p>Your camera is off</p>
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <User className="w-4 h-4"/>
                    {user?.displayName || "Interviewee"}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Card className="flex-grow flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare/> Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto">
                        <div className="space-y-4">
                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {entry.speaker === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><Bot className="w-5 h-5"/></div>}
                                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${entry.speaker === 'user' ? 'bg-secondary' : 'bg-muted'}`}>
                                        <p className="text-sm">{entry.text}</p>
                                    </div>
                                    {entry.speaker === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><User className="w-5 h-5"/></div>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                       {getStatusIndicator()}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="flex-shrink-0 flex justify-center items-center gap-4">
            <Button onClick={() => toggleWebcam()} variant={localWebcamOn ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12">
                {localWebcamOn ? <Video /> : <VideoOff />}
            </Button>
            <Button onClick={endSession} variant="destructive" size="icon" className="rounded-full h-12 w-12">
                <Phone />
            </Button>
        </div>
    </div>
  );
}
