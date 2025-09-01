
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
import { LiveClient, LiveConnectionState, LiveTranscriptionEvents } from '@deepgram/sdk';

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
  const deepgramConnectionRef = useRef<LiveClient | null>(null);

  const interviewStateRef = useRef<InterviewState>({
    interviewId: params.interviewId as string,
    topic: searchParams.get('topic') || 'General Software Engineering',
    role: searchParams.get('role') || 'Software Engineer',
    level: searchParams.get('level') || 'Entry-level',
    company: searchParams.get('company') || '',
    history: [],
    isComplete: false,
  });

  const getAgentResponse = useCallback(async () => {
    try {
        const response = await fetch("/api/deepgram-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: interviewStateRef.current }),
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const audioQueue: Uint8Array[] = [];
        let isPlaying = false;

        const playNextAudioChunk = () => {
            if (audioQueue.length > 0 && !isPlaying) {
                isPlaying = true;
                const audioChunk = audioQueue.shift();
                if (audioChunk) {
                    const blob = new Blob([audioChunk], { type: 'audio/mp3' });
                    const url = URL.createObjectURL(blob);
                    audioPlayerRef.current.src = url;
                    audioPlayerRef.current.play();
                    audioPlayerRef.current.onended = () => {
                        isPlaying = false;
                        playNextAudioChunk();
                    };
                }
            }
        };

        const processStream = async () => {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                audioQueue.push(value);
                playNextAudioChunk();
            }
        };

        processStream();

    } catch(err) {
        console.error("Error fetching or playing agent response:", err);
        setStatus('error');
    }
  }, []);

  const startDeepgramConnection = useCallback(async () => {
    setStatus('initializing');
    try {
        const response = await fetch("/api/auth/deepgram-key");
        const { key } = await response.json();

        const deepgram = createClient(key);
        const connection = deepgram.listen.live({
            model: "nova-2",
            interim_results: true,
            smart_format: true,
            endpointing: 200, // Milliseconds of silence to detect end of speech
            no_delay: true,
        });

        connection.on(LiveTranscriptionEvents.Open, () => {
            console.log("Deepgram connection opened.");
            setStatus('listening');
        });

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
            const text = data.channel.alternatives[0].transcript;
            if (text && data.is_final) {
                setTranscript(prev => [...prev, { speaker: 'user', text }]);
                interviewStateRef.current.history.push({ role: 'user', parts: [{ text }]});
                getAgentResponse(); // Get AI response after user speaks
            }
        });
        
        connection.on(LiveTranscriptionEvents.Close, () => {
            console.log("Deepgram connection closed.");
            if (!interviewStateRef.current.isComplete) {
                setStatus('idle');
            }
        });

        connection.on(LiveTranscriptionEvents.Error, (err) => {
            console.error("Deepgram error:", err);
            setStatus('error');
        });
        
        deepgramConnectionRef.current = connection;
        
        // Start microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0 && connection.getReadyState() === LiveConnectionState.OPEN) {
                connection.send(event.data);
            }
        };
        mediaRecorderRef.current.start(250); // Send data every 250ms

    } catch (err) {
        console.error("Failed to initialize Deepgram:", err);
        setStatus('error');
    }
  }, [getAgentResponse]);
  
  
   useEffect(() => {
    if (user) {
        startDeepgramConnection();
    }
    return () => {
        if (deepgramConnectionRef.current) {
            deepgramConnectionRef.current.finish();
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEndInterview = async () => {
    setStatus('finished');
    if (deepgramConnectionRef.current) {
        deepgramConnectionRef.current.finish();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
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
        if (isMuted) {
            mediaRecorderRef.current.resume();
        } else {
            mediaRecorderRef.current.pause();
        }
        setIsMuted(!isMuted);
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
