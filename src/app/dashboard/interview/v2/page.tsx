
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, Bot, User, MessageSquare, ChevronLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { getAssemblyAiToken } from '@/app/actions/assemblyai';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'error';

export default function InterviewV2Page() {
    const router = useRouter();
    const { toast } = useToast();

    const [status, setStatus] = useState<SessionStatus>('idle');
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    
    const socketRef = useRef<WebSocket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);

    const startTranscription = async () => {
        setStatus('connecting');
        try {
            const token = await getAssemblyAiToken();
            const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
            socketRef.current = socket;

            socket.onopen = () => {
                setStatus('connected');
                toast({ title: "Connected!", description: "You can start speaking now." });
            };

            socket.onmessage = (message) => {
                const res = JSON.parse(message.data);
                if (res.message_type === 'FinalTranscript') {
                    setTranscript(prev => prev + res.text + ' ');
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

        } catch (error) {
            console.error(error);
            setStatus('error');
            toast({ title: "Initialization Failed", description: "Could not get an auth token for transcription service.", variant: "destructive" });
        }
    };
    
    const toggleRecording = async () => {
        if (isRecording) {
            // Stop recording
            recorderRef.current?.stop();
            recorderRef.current = null;
            setIsRecording(false);
            if(socketRef.current?.readyState === WebSocket.OPEN) {
                 socketRef.current.send(JSON.stringify({ terminate_session: true }));
            }
            socketRef.current?.close();
            socketRef.current = null;
            setStatus('idle');
        } else {
            // Start recording
            await startTranscription();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            recorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(JSON.stringify({ audio_data: event.data.toString('base64') }));
                }
            };
            
            recorder.onstart = () => {
                setIsRecording(true);
                setStatus('listening');
            };

            recorder.start(1000); // Send data every 1000ms
        }
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            socketRef.current?.close();
            recorderRef.current?.stop();
        };
    }, []);

    const getStatusIndicator = () => {
        switch (status) {
            case 'idle': return <div className="flex items-center gap-2"><MicOff className="w-4 h-4"/>Not Recording</div>;
            case 'connecting': return <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Connecting...</div>;
            case 'connected': return <div className="flex items-center gap-2 text-blue-400"><Sparkles className="w-4 h-4"/>Ready to Record</div>;
            case 'listening': return <div className="flex items-center gap-2 text-green-400 animate-pulse"><Mic className="w-4 h-4"/>Listening...</div>;
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
                         {transcript && (
                            <div className="flex items-start gap-3 justify-end">
                                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-blue-600 text-white">
                                    <p className="text-sm font-semibold">You</p>
                                    <p className="text-sm">{transcript}</p>
                                </div>
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>

        {/* Footer Controls */}
        <footer className="flex-shrink-0 flex justify-center items-center gap-4 py-4 border-t">
            <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "secondary"} size="icon" className="rounded-full h-14 w-14">
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
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
