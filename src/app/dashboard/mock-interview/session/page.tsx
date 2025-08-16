
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Video, Bot, User, Keyboard, StopCircle, RefreshCw } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { conductInterviewTurn } from '@/ai/flows/analyze-interview-response';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity } from '@/lib/types';
import { addActivity } from '@/lib/firebase-service';


type Message = {
  role: 'user' | 'model';
  content: string;
};

type InterviewState = 'idle' | 'generating_response' | 'speaking_response' | 'listening' | 'finished' | 'error';

export default function MockInterviewSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { user } = useAuth();

    const [interviewState, setInterviewState] = useState<InterviewState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [finishedInterviewId, setFinishedInterviewId] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramConnectionRef = useRef<LiveClient | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const company = searchParams.get('company') || 'a leading tech company';
    const role = searchParams.get('role') || 'Software Engineer';
    const interviewType = (searchParams.get('type') as 'technical' | 'behavioural') || 'technical';
    
    const interviewContext = { company, role, type: interviewType };

    const endInterviewAndAnalyze = useCallback(async () => {
        setInterviewState('finished');
        if (deepgramConnectionRef.current) {
            deepgramConnectionRef.current.close();
            deepgramConnectionRef.current = null;
        }

        if (!user) {
            router.push('/login');
            return;
        }

        if (messages.length === 0) {
            router.push('/dashboard');
            return;
        }

        const attemptId = `interview_attempt_${Date.now()}`;
        const interviewActivity: InterviewActivity = {
            id: attemptId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: messages,
            analysis: null,
            interviewContext: interviewContext,
            details: {
                topic: `Interview for ${interviewContext.role}`,
                role: interviewContext.role,
                company: interviewContext.company,
            }
        };

        try {
            await addActivity(user.uid, interviewActivity);
            setFinishedInterviewId(attemptId);
        } catch (error) {
            console.error("Failed to save interview results:", error);
            toast({
                title: "Save Error",
                description: "Could not save your interview session. Please try again.",
                variant: "destructive"
            });
            router.push('/dashboard'); 
        }
    }, [user, messages, interviewContext, router, toast]);

    useEffect(() => {
        if (finishedInterviewId) {
            router.push(`/dashboard/mock-interview/analysis?id=${finishedInterviewId}`);
        }
    }, [finishedInterviewId, router]);

    const speakResponse = useCallback(async (text: string) => {
        setInterviewState('speaking_response');
        try {
            const { audioDataUri } = await textToSpeech({ text, voice: "aura-asteria-en" });
            if (audioRef.current) {
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    if (messages.length >= 2) { 
                         endInterviewAndAnalyze();
                    } else {
                        setInterviewState('listening');
                    }
                };
            }
        } catch (error) {
            console.error('Text-to-speech failed:', error);
            toast({ title: 'Audio Error', description: 'Could not play the AI response.', variant: 'destructive' });
            if (messages.length >= 2) {
                endInterviewAndAnalyze();
            } else {
                setInterviewState('listening');
            }
        }
    }, [toast, messages.length, endInterviewAndAnalyze]);

    const handleUserResponse = useCallback(async (transcript: string) => {
        if (!transcript.trim()) {
            setInterviewState('listening');
            return;
        }
        
        setInterviewState('generating_response');
        const newHistory: Message[] = [...messages, { role: 'user', content: transcript }];
        setMessages(newHistory);
        setCurrentTranscript('');

        try {
            const { response } = await conductInterviewTurn({
                history: newHistory,
                interviewContext
            });
            setMessages(prev => [...prev, { role: 'model', content: response }]);
            speakResponse(response);
        } catch(error) {
            console.error("AI turn failed:", error);
            toast({ title: "AI Error", description: "The AI failed to respond. Please try again.", variant: "destructive"});
            setInterviewState('error');
        }
    }, [messages, speakResponse, interviewContext, toast]);


    const startInterview = useCallback(async () => {
        if (hasCameraPermission === false) return;
        setInterviewState('generating_response');
        try {
            const { response } = await conductInterviewTurn({ history: [], interviewContext });
            setMessages([{ role: 'model', content: response }]);
            speakResponse(response);
        } catch (error) {
            console.error("Failed to start interview:", error);
            toast({ title: "Interview Start Failed", description: "Could not generate the first question.", variant: "destructive"});
            setInterviewState('error');
        }
    }, [toast, hasCameraPermission, speakResponse, interviewContext]);

    useEffect(() => {
        async function getPermissions() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera/mic:', error);
                setHasCameraPermission(false);
            }
        }
        getPermissions();
        return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
             if (deepgramConnectionRef.current) {
                deepgramConnectionRef.current.close();
                deepgramConnectionRef.current = null;
            }
        };
    }, []);
    
    const startListening = useCallback(async () => {
        if (isRecording || interviewState !== 'listening') return;
    
        if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
            toast({ title: 'Configuration Error', description: 'Deepgram API Key not found.', variant: 'destructive' });
            return;
        }
    
        const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
        const connection = deepgram.listen.live({
            model: 'nova-2',
            smart_format: true,
            interim_results: true,
            utterance_end_ms: 1000, // End utterance after 1s of silence
        });
    
        connection.on(LiveTranscriptionEvents.Open, async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && connection.getReadyState() === 1) {
                        connection.send(event.data);
                    }
                };
                mediaRecorderRef.current = recorder;
                setIsRecording(true);
                recorder.start(250);
            } catch (error) {
                console.error('Error getting user media:', error);
                if (connection.getReadyState() === 1) connection.close();
            }
        });
    
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
               setCurrentTranscript(transcript);
            }
        });

        connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
            if (deepgramConnectionRef.current) {
                deepgramConnectionRef.current.finish();
            }
        });
    
        connection.on(LiveTranscriptionEvents.Close, () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }
            setIsRecording(false);
            if (currentTranscript) {
                handleUserResponse(currentTranscript);
            }
        });
    
        deepgramConnectionRef.current = connection;
    }, [isRecording, interviewState, toast, currentTranscript, handleUserResponse]);

    // Handle Spacebar press for push-to-talk
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat && interviewState === 'listening' && !isRecording) {
                e.preventDefault();
                setCurrentTranscript('');
                startListening();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isRecording && deepgramConnectionRef.current) {
                e.preventDefault();
                deepgramConnectionRef.current.finish();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [interviewState, isRecording, startListening]);

    const renderInterviewStatus = () => {
        switch (interviewState) {
            case 'idle':
                return <Button size="lg" onClick={startInterview} disabled={hasCameraPermission !== true}>Start Interview</Button>;
            case 'generating_response':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>AI is thinking...</p></div>;
            case 'speaking_response':
                return <div className="flex items-center space-x-2 text-primary"><Bot className="animate-pulse" /> <p>AI is speaking...</p></div>;
            case 'listening':
                 return (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Mic className={isRecording ? "text-destructive animate-pulse" : ""} />
                            <span>{isRecording ? "Listening..." : "Ready for your response"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Keyboard size={16} /> Press and hold Spacebar to talk</div>
                    </div>
                );
            case 'finished':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>Finalizing & Analyzing...</p></div>;
            case 'error':
                 return <Button variant="destructive" onClick={() => router.push('/dashboard')}>End Session</Button>;
            default: return null;
        }
    };
    
    const lastMessage = messages[messages.length - 1];

    if (hasCameraPermission === false) {
        return (
            <main className="flex h-screen items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <Video className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h2 className="text-2xl font-bold">Permissions Required</h2>
                    <p className="text-muted-foreground mt-2 mb-6">This feature requires camera and microphone access. Please enable them in your browser settings.</p>
                    <Button onClick={() => window.location.reload()}><RefreshCw className="mr-2" /> Try Again</Button>
                </Card>
            </main>
        );
    }
    
    if (hasCameraPermission === null) {
        return (
             <main className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
             </main>
        )
    }

    return (
        <main className="flex flex-col h-screen bg-black text-white p-4">
            <audio ref={audioRef} style={{ display: 'none' }} />

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="relative bg-muted/20 border-primary/20 overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        <User size={16} /> <span>You</span>
                    </div>
                </Card>
                 <Card className="relative bg-muted/20 border-primary/20 overflow-hidden">
                    <Image src="/interview.webp" alt="AI Interviewer" layout="fill" objectFit="cover" className="opacity-80" data-ai-hint="professional woman" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        <Bot size={16} /> <span>AI Interviewer</span>
                    </div>
                </Card>
            </div>

            <div className="w-full mt-4">
                <Card className="bg-background/80 backdrop-blur-sm border-border/30">
                    <CardContent className="p-4">
                       <div className="min-h-[6rem] text-center flex flex-col justify-center">
                           {currentTranscript ? (
                                <p className="text-xl text-foreground">{currentTranscript}</p>
                           ) : lastMessage ? (
                                <div>
                                    <p className="text-sm font-semibold text-primary mb-1">{lastMessage.role === 'model' ? 'AI Interviewer:' : 'You said:'}</p>
                                    <p className="text-xl text-foreground">{lastMessage.content}</p>
                                </div>
                            ) : (
                                <p className="text-lg text-muted-foreground">The interview will begin shortly...</p>
                            )}
                       </div>
                       <div className="h-16 flex items-center justify-center border-t border-border/30 mt-4 pt-4">
                            <div className="flex items-center gap-4">
                                {interviewState !== 'finished' && interviewState !== 'idle' && (
                                     <Button variant="destructive" onClick={endInterviewAndAnalyze}>
                                        <StopCircle className="mr-2 h-4 w-4" />
                                        End & Get Report
                                    </Button>
                                )}
                                {renderInterviewStatus()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
