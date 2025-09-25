
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Mic, Bot, PhoneOff, AlertTriangle, User, BrainCircuit, Maximize, Video, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'finished' | 'error';

const statusInfo: { [key in AgentStatus]: { text: string; showMic?: boolean } } = {
  idle: { text: "Connecting to agent..." },
  listening: { text: "Listening...", showMic: true },
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
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const connection = useRef<WebSocket | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const stopInterview = useCallback(async (save: boolean) => {
    if (status === 'finished') return;
    setStatus('finished');
    
    if (connection.current) {
        connection.current.close();
        connection.current = null;
    }

    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    if (save && user && transcript.length > 1) {
        toast({ title: "Interview Complete", description: "Generating your feedback report..." });
        const finalActivity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcript,
            feedback: "Feedback will be generated on the results page.",
            details: { topic, role, level, company }
        };
        await addActivity(user.uid, finalActivity);
        router.push(`/dashboard/interview/${finalActivity.id}/results`);
    } else {
        router.push('/dashboard/arena');
    }
  }, [status, user, transcript, interviewId, topic, role, level, company, router, toast]);

  const startInterview = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/deepgram-key', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to get temporary API key.');
      const { key } = await response.json();
      
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2-general&smart_format=true&encoding=webm&talk=true&interim_results=false`,
        ['token', key]
      );

      ws.onopen = async () => {
        setStatus('listening');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorder.current.ondataavailable = (event) => {
            if (event.data.size > 0 && ws.readyState === 1) {
                ws.send(event.data);
            }
        };
        mediaRecorder.current.start(250);
        
        // Send a message to Deepgram's Talk endpoint to start the conversation
        ws.send(JSON.stringify({
            type: "Talk",
            text: `Hello, I'm Kathy, your interviewer from Talxify. We'll be discussing ${topic} for a ${level} ${role} position. Let's begin.`
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'TalkStarted') {
            setStatus('speaking');
        } else if (data.type === 'TalkEnded') {
            setStatus('listening');
             if (data.transcript && data.transcript.includes("feedback report will be generated shortly")) {
                stopInterview(true);
            }
        } else if (data.type === 'Results') {
             const text = data.channel.alternatives[0].transcript;
             if (text) {
                 setTranscript(prev => [...prev, { speaker: 'user', text }]);
             }
        } else if (data.type === 'Metadata') {
            const text = data.request_id; // Using request_id as a placeholder for AI text for now.
            // In a real scenario, you'd get this from a different source.
            // This is a limitation of the current simplified approach.
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed.');
        if (status !== 'finished') {
           setStatus('finished');
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };

      connection.current = ws;

    } catch (error) {
      console.error("Failed to start interview:", error);
      setStatus('error');
      toast({ title: 'Connection Failed', description: (error as Error).message, variant: 'destructive' });
    }
  }, [topic, level, role, status, stopInterview, toast]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    startInterview();
    
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();

    return () => {
      stopInterview(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
                  status === 'listening' ? 'border-red-500/50' :
                  status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                )}>
                  <Image src="/robot.png" alt="Kathy" width={192} height={192} className="rounded-full" data-ai-hint="robot face" />
                  <div className={cn("absolute inset-0 rounded-full animate-pulse",
                    status === 'listening' ? 'bg-red-500/20' :
                    status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                  )}></div>
                </div>
                <h2 className="text-2xl font-bold font-headline">Kathy</h2>
                <Badge variant={status === 'listening' ? 'destructive' : 'secondary'} className="capitalize">{currentStatusInfo.text}</Badge>
              </div>

              <div className="absolute bottom-4 right-4 border rounded-lg bg-background shadow-lg h-32 w-48 overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {!hasCameraPermission && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center text-white">
                    <AlertTriangle className="w-6 h-6 mb-2" />
                    <p className="text-xs">Enable camera permissions to see yourself.</p>
                  </div>
                )}
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
                   {(status === 'thinking' || status === 'speaking') && (
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
