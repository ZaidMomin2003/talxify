
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, AlertCircle, Loader2, Bot, User, PhoneOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type AgentStatus = 'connecting' | 'listening' | 'speaking' | 'thinking' | 'finished' | 'error';
type TranscriptEntry = {
    speaker: 'ai' | 'user';
    text: string;
}

export default function DemoPage() {
    const [status, setStatus] = useState<AgentStatus>('connecting');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    
    const socketRef = useRef<WebSocket | null>(null);
    const recorderRef = useRef<any>(null); // For MediaRecorder
    const audioQueueRef = useRef<AudioBuffer[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const isPlayingRef = useRef(false);
    
    const { toast } = useToast();

    // Function to play audio from the queue
    const playAudioFromQueue = useCallback(() => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;

        isPlayingRef.current = true;
        const audioBuffer = audioQueueRef.current.shift();
        if (audioBuffer) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
            source.onended = () => {
                isPlayingRef.current = false;
                playAudioFromQueue();
            };
        } else {
            isPlayingRef.current = false;
        }
    }, []);

    const connectToAgent = useCallback(() => {
        const wsUrl = `wss://${window.location.host}/api/deepgram`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
             console.log("WebSocket connection established.");
        };

        socket.onmessage = async (event: MessageEvent) => {
            if (typeof event.data === 'string') {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'status':
                        setStatus(data.status as AgentStatus);
                        break;
                    case 'transcript':
                        setTranscript(prev => [...prev, { speaker: data.speaker, text: data.text }]);
                        break;
                    case 'error':
                        toast({ title: "Agent Error", description: data.message, variant: "destructive" });
                        setStatus('error');
                        break;
                }
            } else if (event.data instanceof Blob) {
                // Handle incoming audio data
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                }
                const arrayBuffer = await event.data.arrayBuffer();
                // Deepgram sends raw LINEAR16, we need to wrap it in a WAV header to be decodable
                const wavBuffer = createWavFile(arrayBuffer);
                const audioBuffer = await audioContextRef.current.decodeAudioData(wavBuffer);
                audioQueueRef.current.push(audioBuffer);
                playAudioFromQueue();
            }
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
            setStatus('finished');
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            setStatus('error');
            toast({ title: "Connection Error", description: "Could not connect to the voice agent.", variant: "destructive" });
        };
        
        socketRef.current = socket;
    }, [toast, playAudioFromQueue]);

    useEffect(() => {
        connectToAgent();
        return () => {
            socketRef.current?.close();
            recorderRef.current?.stop();
        };
    }, [connectToAgent]);
    

    const startRecording = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast({ title: "Media Error", description: "Your browser does not support audio recording.", variant: "destructive" });
            return;
        }

        setIsRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(event.data);
                }
            };
            recorder.start(250); // Send data every 250ms
            recorderRef.current = recorder;
        } catch (err) {
            toast({ title: "Microphone Access Denied", description: "Please allow microphone access to use the voice agent.", variant: "destructive" });
            setIsRecording(false);
        }
    };
    
    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stop();
            recorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            recorderRef.current = null;
        }
        setIsRecording(false);
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const endInterview = () => {
        socketRef.current?.close();
        if(recorderRef.current) {
            stopRecording();
        }
    }
    
    // Function to create a WAV file from raw PCM data (as Deepgram sends LINEAR16)
    function createWavFile(rawPcmData: ArrayBuffer): ArrayBuffer {
        const sampleRate = 24000; // Aura sample rate
        const numChannels = 1;
        const bytesPerSample = 2; // 16-bit
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataSize = rawPcmData.byteLength;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        // RIFF header
        view.setUint32(0, 0x52494646, false); // "RIFF"
        view.setUint32(4, 36 + dataSize, true);
        view.setUint32(8, 0x57415645, false); // "WAVE"
        // "fmt " sub-chunk
        view.setUint32(12, 0x666d7420, false); // "fmt "
        view.setUint32(16, 16, true); // Sub-chunk size
        view.setUint16(20, 1, true); // Audio format (1 for PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bytesPerSample * 8, true); // Bits per sample
        // "data" sub-chunk
        view.setUint32(36, 0x64617461, false); // "data"
        view.setUint32(40, dataSize, true);

        // Copy PCM data
        new Uint8Array(buffer, 44).set(new Uint8Array(rawPcmData));

        return buffer;
    }


    const statusText: { [key in AgentStatus]: string } = {
        connecting: 'Connecting...',
        listening: 'Listening...',
        speaking: 'AI is Speaking...',
        thinking: 'Thinking...',
        finished: 'Interview Finished',
        error: 'Connection Error',
    };

    return (
        <main className="flex h-screen w-full flex-col items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-6 w-6" /> AI Mock Interview
                    </CardTitle>
                    <Badge variant="outline" className={cn(
                        status === 'listening' ? "text-green-500 border-green-500" :
                        status === 'speaking' || status === 'thinking' ? "text-blue-500 border-blue-500" :
                        status === 'error' ? "text-destructive border-destructive" : ""
                    )}>
                        {statusText[status]}
                    </Badge>
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col items-center justify-center gap-6">
                    {status === 'connecting' && <Loader2 className="w-16 h-16 animate-spin text-primary" />}
                    
                    {status === 'error' && (
                        <div className="text-center text-destructive">
                            <AlertCircle className="w-24 h-24 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold">Connection Failed</h2>
                            <p>Could not connect to the voice agent. Please try again later.</p>
                        </div>
                    )}

                    {(status !== 'connecting' && status !== 'error' && status !== 'finished') && (
                        <>
                             <div className="relative">
                                <Bot className={cn("w-48 h-48 text-primary transition-all", status === 'speaking' && "scale-110", status === 'thinking' && "animate-pulse")} />
                                 <div className={cn("absolute inset-0 rounded-full",
                                    status === 'speaking' ? 'bg-blue-500/10 animate-pulse' : 
                                    status === 'thinking' ? 'bg-yellow-500/10 animate-pulse' : ''
                                )}></div>
                             </div>
                             <div className="h-40 w-full overflow-y-auto p-4 rounded-lg bg-background border text-left text-sm space-y-4">
                                {transcript.map((t, i) => (
                                    <div key={i} className={cn("flex items-start gap-3", t.speaker === 'ai' ? 'justify-start' : 'justify-end')}>
                                        {t.speaker === 'ai' && <Bot className="w-5 h-5 shrink-0 text-primary mt-0.5" />}
                                        <p className={cn("p-2 rounded-lg max-w-[80%]", t.speaker === 'ai' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>{t.text}</p>
                                        {t.speaker === 'user' && <User className="w-5 h-5 shrink-0 text-blue-500 mt-0.5" />}
                                    </div>
                                ))}
                             </div>
                        </>
                    )}

                    {status === 'finished' && (
                        <div className="text-center">
                             <h2 className="text-2xl font-bold mb-4">Interview Complete!</h2>
                             <p className="text-muted-foreground mb-6">You can now close this window or go back to your dashboard.</p>
                             <Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button>
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t flex justify-center items-center gap-4">
                     <Button
                        onClick={handleToggleRecording}
                        size="icon"
                        className={cn("h-16 w-16 rounded-full transition-all", isRecording && "bg-red-500 hover:bg-red-600")}
                        disabled={status !== 'listening' && !isRecording}
                    >
                        {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                    <Button variant="destructive" onClick={endInterview} disabled={status === 'finished'}>
                        <PhoneOff className="mr-2 h-4 w-4"/>
                        End Interview
                    </Button>
                </div>
            </Card>
        </main>
    );
}
