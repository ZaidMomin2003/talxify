
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, Bot, User, MessageSquare, ChevronLeft, Loader2, Sparkles, AlertTriangle, Keyboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getAssemblyAiToken } from '@/app/actions/assemblyai';
import { AssemblyAI } from 'assemblyai';


type SessionStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'error';
type TranscriptEntry = {
    speaker: 'user' | 'ai' | 'system';
    text: string;
};


export default function InterviewV2Page() {
    const router = useRouter();
    const { toast } = useToast();

    const [status, setStatus] = useState<SessionStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    
    const socketRef = useRef<WebSocket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    
    const startTranscription = async () => {
        if (socketRef.current) return;
        
        setStatus('connecting');
        try {
            console.log("Requesting temporary token from server...");
            const token = await getAssemblyAiToken();

            if (!token) {
              throw new Error("Received an empty or null token from the server.");
            }
            console.log("Token received from server.");
            
            // Correctly form the WebSocket URL for the V3 streaming API
            const wsUrl = `wss://streaming.assemblyai.com/v3/ws?token=${token}`;
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                setStatus('connected');
                toast({ title: "Connected!", description: "You are now connected to the transcription service." });
                socketRef.current?.send(JSON.stringify({
                    audio_format: "pcm_s16le",
                    sample_rate: 16000,
                    model: "Conformer-2"
                }));
            };

            socket.onmessage = (message) => {
                const res = JSON.parse(message.data);
                if (res.message_type === 'FinalTranscript' && res.text) {
                     setTranscript(prev => [...prev, { speaker: 'user', text: res.text }]);
                }
            };

            socket.onerror = (event) => {
                console.error("WebSocket error:", event);
                setStatus('error');
                toast({ title: "Connection Error", description: "Could not connect to transcription service.", variant: "destructive" });
            };

            socket.onclose = () => {
                // Connection closed
            };

        } catch (error: any) {
            console.error("Failed to start transcription session:", error);
            setStatus('error');
            toast({ title: "Initialization Failed", description: error.message, variant: "destructive" });
        }
    };
    
    const startRecording = async () => {
        if (recorderRef.current) return;

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            await startTranscription();
        }
        
        // Wait for connection to be ready before starting recorder
        const waitForConnection = (callback: () => void, retries = 10) => {
            if (retries <= 0) {
                setStatus('error');
                toast({ title: "Connection Timeout", description: "Could not establish connection in time.", variant: "destructive"});
                return;
            }
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                callback();
            } else {
                setTimeout(() => waitForConnection(callback, retries - 1), 500);
            }
        };

        waitForConnection(async () => {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                recorderRef.current = recorder;

                recorder.addEventListener('dataavailable', (event) => {
                    if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const base64AudioData = (reader.result as string).split(',')[1];
                             socketRef.current?.send(JSON.stringify({ audio: base64AudioData }));
                        };
                        reader.readAsDataURL(event.data);
                    }
                });
                
                recorder.start(250); // Send data every 250ms
                setStatus('listening');
            } catch(err) {
                console.error("Microphone access error:", err);
                toast({title: "Microphone Error", description: "Could not access your microphone.", variant: "destructive"});
                setStatus('error');
            }
        });
    };

    const stopRecording = () => {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
            recorderRef.current.stop();
            
             // Gently stop the microphone track
            const stream = recorderRef.current.stream;
            stream.getTracks().forEach(track => track.stop());
        }
        if(socketRef.current?.readyState === WebSocket.OPEN) {
             socketRef.current.send(JSON.stringify({ terminate_session: true }));
             socketRef.current.close();
             socketRef.current = null;
        }
        recorderRef.current = null;
        setStatus('connected');
    };
    
    // Push-to-talk handlers
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space' && !event.repeat && (status === 'connected' || status === 'idle')) {
          event.preventDefault();
          startRecording();
        }
    }, [status]);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space' && status === 'listening') {
            event.preventDefault();
            setStatus('processing');
            stopRecording();
        }
    }, [status]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);


    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ terminate_session: true }));
                socketRef.current.close();
            }
        };
    }, []);

    const getStatusIndicator = () => {
        switch (status) {
            case 'idle': return <div className="flex items-center gap-2 text-blue-400"><Sparkles className="w-4 h-4"/>Ready to Connect</div>;
            case 'connecting': return <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin"/>Connecting...</div>;
            case 'connected': return <div className="flex items-center gap-2 text-green-400"><Keyboard className="w-4 h-4"/>Hold <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Space</kbd> to speak</div>;
            case 'listening': return <div className="flex items-center gap-2 text-green-400 animate-pulse"><Mic className="w-4 h-4"/>Listening...</div>;
            case 'processing': return <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin"/>Processing...</div>;
            case 'error': return <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4"/>Error</div>;
            default: return null;
        }
    }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="text-center">
                <h1 className="text-lg font-semibold">System Design Interview</h1>
                <p className="text-sm text-muted-foreground">AI Interviewer: Alex</p>
            </div>
            <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 min-h-0">
            {/* Video Feed */}
            <div className="lg:col-span-2 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center border">
                {/* AI Interviewer Placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <Bot className="w-24 h-24 text-primary animate-pulse"/>
                    <p className="text-muted-foreground mt-4 text-lg">AI Interviewer is speaking...</p>
                </div>

                {/* User Video Placeholder */}
                <div className="absolute bottom-6 right-6 w-1/4 max-w-[200px] aspect-video bg-black/80 rounded-lg border-2 border-primary shadow-lg flex items-center justify-center">
                    <div className="text-center text-white">
                        <User className="w-8 h-8 mx-auto" />
                        <p className="text-sm mt-1">You</p>
                    </div>
                </div>
            </div>

            {/* Transcript & Controls */}
            <div className="flex flex-col gap-4 min-h-0">
                <Card className="flex-grow flex flex-col min-h-0">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                           <CardTitle className="flex items-center gap-2"><MessageSquare/> Transcript</CardTitle>
                           <div className="text-xs font-mono">{getStatusIndicator()}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto pr-2 space-y-4">
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="w-8 h-8 border-2 border-primary">
                                <AvatarFallback><Bot className="w-4 h-4"/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-secondary">
                                <p className="text-sm font-semibold text-primary">Alex (AI)</p>
                                <p className="text-sm">Good morning! Today, we're going to discuss system design. Can you walk me through how you would design a URL shortening service like TinyURL?</p>
                            </div>
                        </div>
                         {transcript.map((entry, index) => (
                            <div key={index} className="flex items-start gap-3 justify-end">
                                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-blue-600 text-white">
                                    <p className="text-sm font-semibold">You</p>
                                    <p className="text-sm">{entry.text}</p>
                                </div>
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </main>

        {/* Footer Controls */}
        <footer className="flex-shrink-0 flex justify-center items-center gap-4 py-4 border-t">
            <Button variant={status === 'listening' ? 'destructive' : 'secondary'} size="icon" className="rounded-full h-14 w-14">
                {status === 'listening' ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
             <Button variant="secondary" size="icon" className="rounded-full h-14 w-14">
                <Video className="h-6 w-6" />
            </Button>
            <Button variant="destructive" size="icon" className="rounded-full h-16 w-16">
                <Phone className="h-7 w-7" />
            </Button>
        </footer>
    </div>
  );
}
