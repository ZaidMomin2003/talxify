
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Mic, Bot, PhoneOff, AlertTriangle, User, Maximize, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'finished' | 'error';

const statusInfo: { [key in AgentStatus]: { text: string; showMic?: boolean } } = {
  idle: { text: "Connecting..." },
  listening: { text: "Hold to Speak" },
  thinking: { text: "Kathy is Thinking..." },
  speaking: { text: "Kathy is Speaking..." },
  finished: { text: "Interview Finished" },
  error: { text: "Connection Error" },
};


function InterviewComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { toast } = useToast();

  const [status, setStatus] = useState<AgentStatus>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioQueue = useRef<Blob[]>([]);
  const isPlaying = useRef(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);


  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const processAudioQueue = useCallback(() => {
    if (isPlaying.current || audioQueue.current.length === 0) {
      return;
    }
    isPlaying.current = true;
    setStatus('speaking');

    const audioBlob = audioQueue.current.shift();
    if (!audioBlob) {
        isPlaying.current = false;
        return;
    }
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      isPlaying.current = false;
      URL.revokeObjectURL(audioUrl);
      if (audioQueue.current.length > 0) {
        processAudioQueue();
      } else {
        setStatus('listening');
      }
    };
    audio.play();
  }, []);

  const disconnect = useCallback(() => {
    if (socket.current) {
        socket.current.close();
        socket.current = null;
    }
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
    }
    setIsConnected(false);
  }, []);

   const connect = useCallback(async () => {
        setIsConnecting(true);

        try {
            const newSocket = new WebSocket('/api/socket');

            newSocket.onopen = async () => {
                setIsConnecting(false);
                setIsConnected(true);
                setStatus('listening');
            };

            newSocket.onmessage = (event) => {
                if (typeof event.data === "string") {
                    const message = JSON.parse(event.data);
                    if (message.type === 'transcript') {
                        setTranscript(prev => [...prev, { speaker: message.speaker, text: message.text }]);
                    } else if (message.type === 'status') {
                        setStatus(message.status);
                    }
                } else if (event.data instanceof Blob) {
                    audioQueue.current.push(event.data);
                    processAudioQueue();
                }
            };

            newSocket.onerror = (error) => {
                console.error("WebSocket error:", error);
                setStatus('error');
                disconnect();
            };

            newSocket.onclose = () => {
                console.log("WebSocket closed");
                setIsConnected(false);
                if (status !== 'finished') {
                    setStatus('error');
                }
            };

            socket.current = newSocket;
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setStatus('error');
            setIsConnecting(false);
        }
    }, [disconnect, processAudioQueue, status]);


  const stopInterview = useCallback(async (save: boolean) => {
      if (status === 'finished') return;
      console.log('Stopping interview...');
      setStatus('finished');
      disconnect();
      
      if (save && user && transcript.length > 0) {
        try {
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcript,
                feedback: "Feedback will be generated on the results page.",
                details: { topic, role, level, company }
            };
            await addActivity(user.uid, finalActivity);
            toast({ title: "Interview Complete", description: "Generating your feedback report..." });
            router.push(`/dashboard/interview/${finalActivity.id}/results`);
        } catch(e) {
            console.error("Failed to save activity", e);
            router.push('/dashboard/arena');
        }
    } else if (!save) {
        router.push('/dashboard/arena');
    }
  }, [user, transcript, interviewId, topic, role, level, company, router, toast, status, disconnect]);


  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    connect();

    return () => {
        stopInterview(false);
    };
  }, [user, connect]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const startRecording = async () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording' || !socket.current) return;
      
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if(videoRef.current) videoRef.current.srcObject = stream;
          
          mediaRecorder.current = new MediaRecorder(stream);

          mediaRecorder.current.ondataavailable = (event) => {
              if (event.data.size > 0 && socket.current && socket.current.readyState === 1) {
                  socket.current.send(event.data);
              }
          };
          mediaRecorder.current.start(500); // Send data every 500ms
          setIsRecording(true);
      } catch (error) {
          console.error("Microphone access denied:", error);
          toast({ title: "Microphone Error", description: "Could not access microphone.", variant: "destructive" });
      }
  };

  const stopRecording = () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
          mediaRecorder.current.stop();
          // Stop all tracks on the stream to turn off mic indicator
          const stream = mediaRecorder.current.stream;
          stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
  };


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

  const currentStatusInfo = statusInfo[status];

  return (
    <div ref={mainContainerRef} className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
      {status === 'error' ? (
        <Card className="w-full max-w-lg text-center p-8">
          <div className="text-destructive">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Connection Failed</h2>
            <p>Could not connect. Please check microphone permissions and try again.</p>
             <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
          </div>
        </Card>
      ) : (
        <div className="w-full h-full flex flex-col">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-0">
            <div className="md:col-span-3 h-full bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden p-8">
              <div className="relative flex flex-col items-center gap-4 text-center z-10">
                <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300",
                  isRecording ? 'border-red-500/50' :
                  status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                )}>
                  <Image src="/robot.png" alt="Kathy" width={192} height={192} className="rounded-full" data-ai-hint="robot face" />
                  <div className={cn("absolute inset-0 rounded-full animate-pulse",
                    isRecording ? 'bg-red-500/20' :
                    status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                  )}></div>
                </div>
                <h2 className="text-2xl font-bold font-headline">Kathy</h2>
                <Badge variant={isRecording ? 'destructive' : 'secondary'} className="capitalize">{isRecording ? "Listening..." : currentStatusInfo.text}</Badge>
              </div>

              <div className="absolute bottom-4 right-4 border rounded-lg bg-background shadow-lg h-32 w-48 overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
              </div>
            </div>

            <div id="transcript-container" className="md:col-span-1 h-full flex flex-col gap-4 min-h-0">
              <h3 className="font-semibold mb-2 flex items-center gap-2 shrink-0"><MessageSquare className="w-5 h-5" /> Transcript</h3>
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
                   {(status === 'thinking' || status === 'speaking' || isConnecting) && (
                     <div className="flex flex-col items-start">
                         <div className="max-w-[90%] p-3 rounded-lg bg-background">
                            <p className="font-bold mb-1 capitalize">Kathy</p>
                            <Loader2 className="w-5 h-5 animate-spin"/>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          <footer className="p-4 border-t flex items-center justify-center gap-4">
             <Button 
                variant="outline"
                size="icon" 
                className={cn(
                    "rounded-full h-16 w-16 transition-all duration-200 transform",
                    isRecording ? "bg-red-500/20 text-red-500 scale-110" : "bg-background",
                    "disabled:opacity-50"
                )}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                disabled={status !== 'listening'}
            >
              <Mic className="w-7 h-7" />
            </Button>
            <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={() => stopInterview(true)} disabled={status === 'finished'}>
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-14 w-14" onClick={toggleFullScreen}>
              <Maximize className="w-6 h-6" />
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
