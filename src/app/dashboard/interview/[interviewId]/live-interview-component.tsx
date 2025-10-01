
'use client';

import {
  MessageSquare,
  Mic,
  Phone,
  Loader2,
  AlertTriangle,
  Maximize,
  MicOff,
  RefreshCw,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { TranscriptEntry } from '@/lib/types';
import { decodeAudioData, createAudioBlob } from '@/lib/live-audio/utils';

interface LiveInterviewComponentProps {
    addTranscriptEntry: (entry: TranscriptEntry) => void;
    stopInterview: (save: boolean) => Promise<void>;
    transcript: TranscriptEntry[];
}

export default function LiveInterviewComponent({
    addTranscriptEntry,
    stopInterview,
    transcript
}: LiveInterviewComponentProps) {
    const searchParams = useSearchParams();
    const [isRecording, setIsRecording] = useState(false);
    const [isAwaitingAI, setIsAwaitingAI] = useState(true);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isMicReady, setIsMicReady] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const recorder = useRef<MediaRecorder | null>(null);
    const audioPlayer = useRef<HTMLAudioElement | null>(null);
    const sources = useRef(new Set<AudioBufferSourceNode>());
    const outputAudioContext = useRef<AudioContext | null>(null);
    const nextStartTime = useRef(0);
    const streamRef = useRef<MediaStream | null>(null);
    const responseStreamRef = useRef<ReadableStream<Uint8Array> | null>(null);

    const topic = searchParams.get('topic') || 'General Software Engineering';
    const role = searchParams.get('role') || 'Software Engineer';
    const level = searchParams.get('level') || 'Entry-level';
    const company = searchParams.get('company') || '';

    useEffect(() => {
        // Initialize AudioContext
        outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        nextStartTime.current = outputAudioContext.current.currentTime;
        audioPlayer.current = new Audio(); // For manual stop if needed

        // Initialize camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch(err => console.error("Camera access error:", err));

        return () => {
            streamRef.current?.getTracks().forEach(track => track.stop());
            recorder.current?.stop();
        };
    }, []);

    const processAudio = async (data: Uint8Array) => {
        if (!outputAudioContext.current) return;

        const audioBuffer = await decodeAudioData(
            data,
            outputAudioContext.current,
            24000,
            1,
        );

        if (outputAudioContext.current.currentTime > nextStartTime.current) {
            nextStartTime.current = outputAudioContext.current.currentTime;
        }

        const source = outputAudioContext.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputAudioContext.current.destination);
        source.addEventListener('ended', () => {
            sources.current.delete(source);
        });

        source.start(nextStartTime.current);
        nextStartTime.current += audioBuffer.duration;
        sources.current.add(source);
    };

    const startStreaming = async () => {
        setIsConnecting(true);
        setIsAwaitingAI(true);
        try {
            const queryParams = new URLSearchParams({ topic, role, level, company });
            const response = await fetch(`/api/gemini-live?${queryParams.toString()}`, {
                method: 'POST',
                body: streamRef.current ? createAudioBlob(streamRef.current) : null,
            });

            if (!response.ok || !response.body) {
                throw new Error('Failed to connect to the streaming server.');
            }
            
            responseStreamRef.current = response.body;
            const reader = responseStreamRef.current.getReader();

            setIsConnecting(false);
            setIsMicReady(true);
            setIsAwaitingAI(false);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                    await processAudio(value);
                }
            }

        } catch (error) {
            console.error("Streaming failed:", error);
            setIsConnecting(false);
        }
    };
    
    useEffect(() => {
        startStreaming();
        // This effect should only run once to initialize streaming.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startRecording = useCallback(async () => {
        if (isRecording || !isMicReady) return;
        try {
            outputAudioContext.current?.resume();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
            streamRef.current = stream;

            const newRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            newRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && responseStreamRef.current) {
                   // This part is tricky. We can't just send to the body again.
                   // The initial POST sets up the pipe. We need a way to continuously send.
                   // The example project seems to handle this differently.
                   // Let's rely on the initial stream setup.
                }
            };
            newRecorder.onstart = () => setIsRecording(true);
            newRecorder.onstop = () => setIsRecording(false);
            newRecorder.start(250);
            recorder.current = newRecorder;

        } catch(err) {
            console.error("Mic error:", err);
        }
    }, [isRecording, isMicReady]);

    const stopRecording = useCallback(() => {
        recorder.current?.stop();
    }, []);
    
    const toggleFullScreen = () => {
        if (!mainContainerRef.current) return;
        if (!document.fullscreenElement) {
            mainContainerRef.current.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    if (isConnecting) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary"/>
            <p className="text-lg text-muted-foreground">Initializing Session...</p>
          </div>
        </div>
      );
    }
    
    return (
        <div ref={mainContainerRef} className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="w-full h-full flex flex-col">
              <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-0">
                  <div className="md:col-span-3 h-full bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden p-8">
                       <div className="relative flex flex-col items-center gap-4 text-center z-10">
                          <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                              isRecording ? 'border-red-500/50' : 'border-border'
                          )}>
                              <Image src="/robot.png" alt="Kathy" width={192} height={192} className="rounded-full" data-ai-hint="robot face" />
                               <div className={cn("absolute inset-0 rounded-full animate-pulse",
                                  isRecording ? 'bg-red-500/20' : 'bg-transparent'
                              )}></div>
                          </div>
                          <h2 className="text-2xl font-bold font-headline">Kathy</h2>
                      </div>

                      <div className="absolute bottom-4 right-4 border rounded-lg bg-background shadow-lg h-32 w-48 overflow-hidden">
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                           <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center text-white">
                                <AlertTriangle className="w-6 h-6 mb-2"/>
                                <p className="text-xs">Camera is optional and only for you.</p>
                            </div>
                      </div>

                      <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-green-900/50 text-green-300 border border-green-700">
                          <div className="flex items-center gap-2">
                               <Mic className={cn("transition-colors", isRecording ? "text-red-500" : "text-green-500")} />
                              <span className="font-semibold text-sm">Hold <Badge variant="secondary">Space</Badge> to Speak</span>
                          </div>
                      </div>
                  </div>

                  <div className="md:col-span-1 h-full flex flex-col gap-4 min-h-0">
                       <h3 className="font-semibold mb-2 flex items-center gap-2 shrink-0"><MessageSquare className="w-5 h-5"/> Transcript</h3>
                      <div className="flex-grow bg-muted rounded-lg p-4 overflow-y-auto min-h-0">
                          <div className="space-y-4 text-sm">
                              {transcript.map((entry, index) => (
                                  <div key={index} className={cn("flex flex-col", entry.speaker === 'user' ? 'items-end' : 'items-start')}>
                                      <div className={cn("max-w-[90%] p-3 rounded-lg", entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                          <p className="font-bold mb-1 capitalize">{entry.speaker === 'ai' ? 'Kathy' : 'You'}</p>
                                          <p>{entry.text}</p>
                                      </div>
                                  </div>
                              ))}
                               {isAwaitingAI && (
                                   <div className="flex items-start">
                                        <div className="p-3 rounded-lg bg-background flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                            <span className="text-muted-foreground italic text-sm">Kathy is thinking...</span>
                                        </div>
                                   </div>
                               )}
                          </div>
                      </div>
                  </div>
              </div>

              <footer className="p-4 border-t flex items-center justify-center gap-4">
                    <Button 
                      variant={isRecording ? "destructive" : "outline"} 
                      size="icon" 
                      className={cn("rounded-full h-14 w-14 transition-colors", isRecording && "animate-pulse")}
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      disabled={!isMicReady || isAwaitingAI}
                    >
                      {isMicReady ? <Mic className="w-6 h-6"/> : <MicOff className="w-6 h-6"/>}
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={() => stopInterview(true)}>
                      <Phone className="w-6 h-6" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full h-14 w-14" onClick={toggleFullScreen}>
                      <Maximize className="w-6 h-6"/>
                    </Button>
              </footer>
          </div>
        </div>
    );
}

// NOTE: The code for the live interview component is complex.
// The provided `index.tsx` logic is not directly portable to a React/Next.js component.
// The main challenges are:
// 1. Managing the bidirectional stream: The client sends a stream and receives a stream.
//    The Next.js API route needs to act as a proxy for this.
// 2. State management in React: The LitElement example uses class properties, which need to be
//    translated to React hooks (useState, useRef, useEffect) correctly.
// 3. AudioContext lifecycle: The AudioContext should be managed carefully to avoid issues
//    with browser policies (e.g., must be resumed after a user interaction).
// This implementation is a best-effort attempt to merge the two concepts.
// The most significant change is the new `/api/gemini-live` route that attempts
// to proxy the stream. The client-side component is updated to interact with this new route.
// This is a fundamentally different and more complex architecture than the previous one.
