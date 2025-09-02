
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Mic,
  PhoneOff,
  Bot,
  User,
  Loader2,
  MicOff,
  AlertTriangle
} from "lucide-react";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type ConnectionState = "connecting" | "open" | "closing" | "closed" | "error";

export default function DemoPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("closed");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: 'ai' | 'user'; text: string }[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueue = useRef<ArrayBuffer[]>([]);
  const isPlaying = useRef(false);

  const { toast } = useToast();

  const processAudioQueue = useCallback(async () => {
    if (isPlaying.current || audioQueue.current.length === 0 || !audioContextRef.current) return;

    isPlaying.current = true;
    setIsSpeaking(true);

    const audioData = audioQueue.current.shift();

    if (audioData && audioContextRef.current) {
        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                isPlaying.current = false;
                processAudioQueue(); 
            };
            source.start();
        } catch (error) {
            console.error("Error playing audio:", error);
            isPlaying.current = false;
            setIsSpeaking(false);
        }
    } else {
        isPlaying.current = false;
        setIsSpeaking(false);
    }
  }, []);

  const connectToAgent = useCallback(async () => {
    setConnectionState("connecting");
    
    // Initialize AudioContext
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("AudioContext not supported", e);
            setConnectionState("error");
            toast({ title: "Audio Error", description: "Your browser does not support the Web Audio API.", variant: "destructive"});
            return;
        }
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

        const wsUrl = new URL('/api/deepgram', window.location.href);
        wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
        webSocketRef.current = new WebSocket(wsUrl.toString());

        webSocketRef.current.onopen = () => {
            setConnectionState("open");
            mediaRecorderRef.current?.start(500); // Start recording and send data every 500ms
        };

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
                webSocketRef.current.send(event.data);
            }
        };

        webSocketRef.current.onmessage = async (event) => {
            if (typeof event.data === 'string') {
                const message = JSON.parse(event.data);
                if (message.type === 'transcript') {
                    setTranscript(prev => [...prev, { speaker: message.speaker, text: message.text }]);
                } else if (message.type === 'listening') {
                    setIsListening(message.value);
                } else if (message.type === 'speaking') {
                    setIsSpeaking(message.value);
                }
            } else if (event.data instanceof Blob) {
                const arrayBuffer = await event.data.arrayBuffer();
                audioQueue.current.push(arrayBuffer);
                if (!isPlaying.current) {
                    processAudioQueue();
                }
            }
        };

        webSocketRef.current.onclose = () => setConnectionState("closed");
        webSocketRef.current.onerror = () => {
            setConnectionState("error");
            toast({ title: "Connection Error", description: "Could not connect to the voice agent.", variant: "destructive" });
        };

    } catch (err) {
        console.error("Microphone access denied:", err);
        setConnectionState("error");
        toast({ title: "Microphone Required", description: "Please grant microphone access to start the interview.", variant: "destructive"});
    }
  }, [toast, processAudioQueue]);

  const disconnectAgent = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
    }
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    mediaRecorderRef.current = null;
    webSocketRef.current = null;
    setConnectionState("closed");
    setTranscript([]);
  }, []);

  useEffect(() => {
    return () => {
        disconnectAgent();
    };
  }, [disconnectAgent]);
  
  const getStatusBadge = () => {
    switch(connectionState) {
        case 'connecting': return <Badge variant="secondary">Connecting...</Badge>;
        case 'open':
            if (isSpeaking) return <Badge className="bg-blue-500 text-primary-foreground">AI Speaking...</Badge>;
            if (isListening) return <Badge className="bg-green-500 text-primary-foreground">Listening...</Badge>;
            return <Badge variant="default">Connected</Badge>;
        case 'error': return <Badge variant="destructive">Error</Badge>;
        case 'closed':
        default:
            return <Badge variant="secondary">Not Connected</Badge>;
    }
  }

  return (
    <main className="flex h-full w-full items-center justify-center bg-muted/30 p-4">
      <div className="flex h-full max-h-[90vh] w-full max-w-7xl">
        <div className="flex-1 flex flex-col gap-4">
            <header className="flex-shrink-0 flex items-center justify-between bg-card p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-primary"/>
                    <div>
                        <h1 className="font-bold text-lg">AI Mock Interview</h1>
                        <p className="text-sm text-muted-foreground">Voice Agent Demo</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    {connectionState !== 'open' ? (
                         <Button onClick={connectToAgent} disabled={connectionState === 'connecting'}>
                             {connectionState === 'connecting' ? <Loader2 className="mr-2 animate-spin"/> : <Mic className="mr-2" />}
                             Start Interview
                         </Button>
                    ) : (
                         <Button variant="destructive" onClick={disconnectAgent}>
                             <PhoneOff className="mr-2"/>
                             End Interview
                         </Button>
                    )}
                </div>
            </header>

            <div className="flex-grow bg-card rounded-lg border flex flex-col overflow-hidden relative items-center justify-center p-8">
               {connectionState === 'closed' && (
                    <div className="text-center">
                        <Bot className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Ready to Start?</h2>
                        <p className="text-muted-foreground">Click "Start Interview" to connect to the AI agent.</p>
                    </div>
               )}
               {connectionState === 'connecting' && (
                     <div className="text-center">
                        <Loader2 className="w-24 h-24 text-primary animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Connecting...</h2>
                        <p className="text-muted-foreground">Please allow microphone access if prompted.</p>
                    </div>
               )}
                {connectionState === 'error' && (
                     <div className="text-center text-destructive">
                        <AlertTriangle className="w-24 h-24 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Connection Failed</h2>
                        <p>Could not connect to the voice agent. Please check your connection and microphone permissions.</p>
                    </div>
               )}
               {connectionState === 'open' && (
                    <div className="w-full max-w-2xl h-full flex flex-col items-center justify-center">
                        <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                            isListening ? 'border-green-500/50' : 
                            isSpeaking ? 'border-blue-500/50' : 'border-border'
                        )}>
                            {isListening ? <Mic className="h-20 w-20 text-green-500"/> : <Bot className="w-24 h-24 text-primary" />}
                            <div className={cn("absolute inset-0 rounded-full animate-pulse",
                            isListening ? 'bg-green-500/20' : 
                            isSpeaking ? 'bg-blue-500/20' : 'bg-transparent'
                            )}></div>
                        </div>
                        <div className="mt-6">
                            {getStatusBadge()}
                        </div>
                    </div>
               )}
            </div>
        </div>
      
        <aside className="w-full max-w-sm ml-4 bg-card rounded-lg border flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Transcript</h2>
            </div>
            <div className="flex-grow flex flex-col-reverse overflow-y-auto px-4 py-4 space-y-4 space-y-reverse">
                {transcript.map((item, index) => (
                    <div key={index} className={cn("flex items-start gap-3", item.speaker === 'user' ? "justify-end" : "justify-start")}>
                        {item.speaker === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Bot className="w-5 h-5"/></div>}
                        <div className={cn("p-3 rounded-lg max-w-xs", item.speaker === 'user' ? 'bg-muted' : 'bg-primary/10')}>
                           <p className="text-sm">{item.text}</p>
                        </div>
                         {item.speaker === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center"><User className="w-5 h-5"/></div>}
                    </div>
                ))}
            </div>
        </aside>
      </div>
    </main>
  );
}
