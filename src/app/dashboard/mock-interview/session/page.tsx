
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, AlertTriangle, Video, Bot, User, Keyboard, LogOut } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { conductInterviewTurn } from '@/ai/flows/analyze-interview-response';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';

type Message = {
  role: 'user' | 'model';
  content: string;
};

type InterviewState = 'idle' | 'generating_response' | 'speaking_response' | 'listening' | 'processing_response' | 'finished' | 'error';

export default function MockInterviewSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [interviewState, setInterviewState] = useState<InterviewState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [currentTranscript, setCurrentTranscript] = useState('');
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramConnectionRef = useRef<LiveClient | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const topic = searchParams.get('topic') || 'general';
    const role = searchParams.get('role') || 'Software Engineer';
    const interviewContext = `This is a mock interview for a ${role} role, focusing on ${topic}.`;

    useEffect(() => {
        async function getPermissions() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera/mic:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Permissions Denied',
                    description: 'Please enable camera and microphone permissions to use this feature.',
                    duration: 5000,
                });
            }
        }
        getPermissions();

        return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
             if (deepgramConnectionRef.current) {
                deepgramConnectionRef.current.close();
                deepgramConnectionRef.current = null;
            }
        };
    }, [toast]);
    
    const speakResponse = useCallback(async (text: string) => {
        setInterviewState('speaking_response');
        try {
            const { audioDataUri } = await textToSpeech({ text });
            if (audioRef.current) {
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setInterviewState('listening');
                };
            }
        } catch (error) {
            console.error('Text-to-speech failed:', error);
            toast({ title: 'Audio Error', description: 'Could not play the AI response.', variant: 'destructive' });
            setInterviewState('listening'); // Even if TTS fails, allow user to respond
        }
    }, [toast]);

    const handleUserResponse = useCallback(async (transcript: string) => {
        if (!transcript.trim()) {
            setInterviewState('listening'); // If empty transcript, just go back to listening
            return;
        }
        
        setInterviewState('generating_response');
        const newHistory: Message[] = [...messages, { role: 'user', content: transcript }];
        setMessages(newHistory);
        setCurrentTranscript('');

        try {
            const result = await conductInterviewTurn({
                history: newHistory,
                questionContext: interviewContext,
            });
            const aiResponse = result.response;
            setMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
            speakResponse(aiResponse);
        } catch(error) {
            console.error('Error conducting interview turn:', error);
            toast({ title: 'AI Error', description: 'The AI failed to respond. Please try again.', variant: 'destructive' });
            setInterviewState('listening');
        }

    }, [messages, interviewContext, speakResponse, toast]);
    
    const startInterview = useCallback(async () => {
        if (hasCameraPermission === false) {
             toast({ title: 'Cannot Start Interview', description: 'Permissions for camera and microphone are required.', variant: 'destructive' });
             return;
        }
        setInterviewState('generating_response');
        const initialMessage = `Hello! Thank you for joining me. I'll be interviewing you for a ${role} position focused on ${topic}. Are you ready to begin?`;
        setMessages([{ role: 'model', content: initialMessage }]);
        speakResponse(initialMessage);
    }, [role, topic, toast, hasCameraPermission, speakResponse]);

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
                toast({ title: 'Microphone Error', description: 'Could not access your microphone.', variant: 'destructive' });
                if (connection.getReadyState() === 1) connection.close();
            }
        });
    
        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
               setCurrentTranscript(transcript);
            }
        });
    
        connection.on(LiveTranscriptionEvents.Close, () => {
            console.log('Deepgram connection closed.');
        });
    
        connection.on(LiveTranscriptionEvents.Error, (e) => {
            console.error("Deepgram Error: ", e);
            toast({ title: 'Real-time Error', description: 'A transcription error occurred.', variant: 'destructive' });
        });
    
        deepgramConnectionRef.current = connection;
    }, [isRecording, interviewState, toast]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            // Do not stop tracks here, as it kills the camera stream
            // mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current = null;
        }
        if (deepgramConnectionRef.current) {
            deepgramConnectionRef.current.finish();
            deepgramConnectionRef.current = null;
        }
        setIsRecording(false);
        if(currentTranscript){
            handleUserResponse(currentTranscript);
        } else {
            setInterviewState('listening');
        }
    }, [currentTranscript, handleUserResponse]);

    // Handle Spacebar press for push-to-talk
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat && interviewState === 'listening' && !isRecording) {
                e.preventDefault();
                startListening();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isRecording) {
                e.preventDefault();
                stopListening();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [interviewState, isRecording, startListening, stopListening]);

    const renderInterviewStatus = () => {
        switch (interviewState) {
            case 'idle':
                return <Button size="lg" onClick={startInterview} disabled={hasCameraPermission === false}>Start Interview</Button>;
            case 'generating_response':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>AI is thinking...</p></div>;
            case 'speaking_response':
                return <div className="flex items-center space-x-2 text-primary"><Bot className="animate-pulse" /> <p>AI is speaking...</p></div>;
            case 'listening':
                 return (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Mic className={isRecording ? "text-destructive animate-pulse" : ""} />
                            <span>{isRecording ? "Recording..." : "Ready to listen"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Keyboard size={16} /> Press and hold Spacebar to talk</div>
                    </div>
                );
            case 'processing_response':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>Processing your response...</p></div>;
            case 'finished':
                return <Button size="lg" onClick={() => router.push('/dashboard')}>Interview Complete! Back to Dashboard</Button>;
             case 'error':
                 return (
                    <div className="text-center text-destructive flex flex-col items-center gap-2">
                         <AlertTriangle className="h-8 w-8" />
                         <p>An error occurred. Please refresh or go back.</p>
                         <Button variant="secondary" className="mt-2" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </div>
                 );
            default: return null;
        }
    };
    
    const lastMessage = messages[messages.length - 1];

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
                    <Image src="https://placehold.co/1280x720.png" alt="AI Interviewer" layout="fill" objectFit="cover" className="opacity-80" data-ai-hint="abstract background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        <Bot size={16} /> <span>AI Interviewer</span>
                    </div>
                </Card>
            </div>
            
            {hasCameraPermission === false && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                     <Alert variant="destructive" className="max-w-md">
                        <Video className="h-4 w-4" />
                        <AlertTitle>Camera and Microphone Required</AlertTitle>
                        <AlertDescription>
                            Talxify needs access to your camera and microphone for the mock interview. Please enable permissions in your browser settings and refresh the page.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="w-full mt-4">
                <Card className="bg-background/80 backdrop-blur-sm border-border/30">
                    <CardContent className="p-4">
                       <div className="min-h-[6rem] text-center flex flex-col justify-center">
                           {isRecording && currentTranscript ? (
                                <div>
                                    <p className="text-sm font-semibold text-primary mb-1">Listening...</p>
                                    <p className="text-xl text-foreground">{currentTranscript}</p>
                                </div>
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
                                {interviewState !== 'idle' && interviewState !== 'finished' && (
                                     <Button variant="destructive" onClick={() => router.push('/dashboard')}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Quit
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
