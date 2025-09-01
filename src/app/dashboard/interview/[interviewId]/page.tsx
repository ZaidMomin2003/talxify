
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { InterviewState } from '@/lib/interview-types';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, AlertTriangle, Square, Bot, MicOff, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type AgentStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'initializing' | 'error' | 'finished';
type TranscriptEntry = { speaker: 'user' | 'ai'; text: string };

function InterviewComponent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [status, setStatus] = useState<AgentStatus>('initializing');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioPlayerRef = useRef(new Audio());
  const connectionRef = useRef<WebSocket | null>(null);

  const interviewStateRef = useRef<InterviewState>({
    interviewId: params.interviewId as string,
    topic: searchParams.get('topic') || 'General Software Engineering',
    role: searchParams.get('role') || 'Software Engineer',
    level: searchParams.get('level') || 'Entry-level',
    company: searchParams.get('company') || '',
    history: [],
    isComplete: false,
  });

  const setupAndStartInterview = useCallback(async () => {
    if (!user) return;
    setStatus('initializing');

    const state = interviewStateRef.current;
    
    // Construct the WebSocket URL for our backend agent
    const wsUrl = new URL('/api/deepgram-agent', window.location.origin);
    wsUrl.protocol = wsUrl.protocol.replace('http', 'ws');
    
    // Pass initial state as query parameters
    wsUrl.searchParams.set('topic', state.topic);
    wsUrl.searchParams.set('role', state.role);
    wsUrl.searchParams.set('level', state.level);
    if(state.company) wsUrl.searchParams.set('company', state.company);
    if(user.displayName) wsUrl.searchParams.set('userName', user.displayName);

    const ws = new WebSocket(wsUrl);
    connectionRef.current = ws;

    ws.onopen = async () => {
      console.log("Connected to agent.");
      setStatus('listening');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };
      mediaRecorderRef.current.start(250);
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
            const speaker = data.is_final ? 'user' : 'interim';
            if (data.is_final) {
                setTranscript(prev => [...prev, { speaker: 'user', text: data.text }]);
                setStatus('processing');
            }
        } else if (data.type === 'audio') {
            setStatus('speaking');
            const audioChunk = new Uint8Array(data.audio.data);
            const blob = new Blob([audioChunk], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            audioPlayerRef.current.src = url;
            audioPlayerRef.current.play();
            audioPlayerRef.current.onended = () => {
                setStatus('listening');
            };
        } else if(data.type === 'ai_transcript') {
            setTranscript(prev => [...prev, { speaker: 'ai', text: data.text }]);
        } else if (data.type === 'finished') {
             handleEndInterview();
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus('error');
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed.");
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
  }, [user]);

  useEffect(() => {
    if (user) {
        setupAndStartInterview();
    }
    return () => {
        if (connectionRef.current) {
            connectionRef.current.close();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEndInterview = async () => {
    setStatus('finished');
    if (connectionRef.current) {
        connectionRef.current.close();
    }
    interviewStateRef.current.isComplete = true;

    if (!user) return;
    const finalActivity: InterviewActivity = {
      id: interviewStateRef.current.interviewId,
      type: 'interview',
      timestamp: new Date().toISOString(),
      transcript: transcript,
      feedback: "Feedback will be generated on the results page.",
      details: interviewStateRef.current
    };
    await addActivity(user.uid, finalActivity);
    router.push(`/dashboard/interview/${finalActivity.id}/results`);
  }

  const toggleMute = () => {
    if (mediaRecorderRef.current) {
        const isCurrentlyMuted = mediaRecorderRef.current.stream.getAudioTracks().every(track => !track.enabled);
        mediaRecorderRef.current.stream.getAudioTracks().forEach(track => {
            track.enabled = isCurrentlyMuted;
        });
        setIsMuted(!isCurrentlyMuted);
    }
  }


  const statusInfo = {
    initializing: { text: "Initializing Session...", color: "bg-gray-500" },
    listening: { text: "Listening...", color: "bg-green-500" },
    speaking: { text: "AI is Speaking...", color: "bg-blue-500" },
    processing: { text: "Thinking...", color: "bg-yellow-500" },
    idle: { text: "Ready for you to speak", color: "bg-gray-500" },
    finished: { text: "Interview Finished", color: "bg-gray-500" },
    error: { text: "Connection Error", color: "bg-destructive" },
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
            <Card className="p-6 flex-grow flex flex-col items-center justify-center gap-8 text-center bg-muted/50 m-4 rounded-lg">
                <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                    status === 'listening' ? 'border-green-500/50' : 
                    status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                 )}>
                    <div className={cn("absolute inset-0 rounded-full animate-pulse",
                        status === 'listening' ? 'bg-green-500/20' : 
                        status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                    )}></div>
                    <Bot className="w-24 h-24 text-primary" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-headline">{interviewStateRef.current.topic}</h1>
                    <Badge variant={status === 'error' ? 'destructive' : 'secondary'}>{statusInfo[status].text}</Badge>
                </div>

                <div className="h-20 text-xl text-muted-foreground px-8">
                    <p>{transcript.slice(-1)[0]?.text || 'The interview will begin shortly...'}</p>
                </div>
            </Card>
            
            <div className="flex items-center justify-center gap-4 p-6 border-t">
                <Button variant="outline" size="icon" onClick={toggleMute} className="h-14 w-14 rounded-full">
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
                 <Button variant="destructive" size="icon" onClick={handleEndInterview} disabled={status === 'initializing'} className="h-14 w-14 rounded-full">
                    <PhoneOff />
                 </Button>
            </div>
        </Card>
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
