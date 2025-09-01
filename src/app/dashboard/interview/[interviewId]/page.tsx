
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Bot, PhoneOff, AlertTriangle, MessageSquare, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type AgentStatus = 'initializing' | 'generating_questions' | 'connected' | 'speaking' | 'listening' | 'finished' | 'error' | 'questions_ready';

const statusInfo: { [key in AgentStatus]: { text: string; color: string; showMic?: boolean } } = {
  initializing: { text: "Initializing Session...", color: "bg-gray-500" },
  generating_questions: { text: "Generating Questions...", color: "bg-yellow-500" },
  connected: { text: "Connected, AI is preparing...", color: "bg-blue-500" },
  questions_ready: { text: "Ready to Start", color: "bg-blue-500" },
  listening: { text: "Listening...", color: "bg-green-500", showMic: true },
  speaking: { text: "AI is Speaking...", color: "bg-blue-500" },
  finished: { text: "Interview Finished", color: "bg-gray-500" },
  error: { text: "Connection Error", color: "bg-destructive" },
};

function InterviewComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [status, setStatus] = useState<AgentStatus>('initializing');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<{ text: string, index: number, total: number } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const connectionRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const responseStreamRef = useRef<Response | null>(null);


  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const processAudioQueue = useCallback(async () => {
      if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) {
          return;
      }
      
      isPlayingRef.current = true;
      setStatus('speaking');

      const audioBuffer = audioQueueRef.current.shift();
      if (audioBuffer) {
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => {
              isPlayingRef.current = false;
              processAudioQueue(); // Process next item in queue
          };
          source.start();
      } else {
          isPlayingRef.current = false;
          // If queue is empty, transition to listening
          if (audioQueueRef.current.length === 0) {
            setStatus('listening');
          }
      }
  }, []);

  const stopInterview = useCallback(async () => {
    setStatus('finished');
    
    // Stop microphone
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    // Cancel the readable stream
    if (connectionRef.current) {
        await connectionRef.current.cancel();
        connectionRef.current = null;
    }
    if (responseStreamRef.current && responseStreamRef.current.body) {
        await responseStreamRef.current.body.cancel();
    }

  }, []);

  const handleEndInterview = useCallback(async () => {
    await stopInterview();

    if (!user) return;
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
  }, [stopInterview, user, interviewId, transcript, topic, role, level, company, router]);
  

  const startInterview = useCallback(async () => {
    if (!user) return;
    
    // Initialize AudioContext
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000
        });
    }
    
    setStatus('initializing');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const wsUrl = new URL('/api/deepgram-agent', window.location.origin);
    wsUrl.searchParams.set('topic', topic);
    wsUrl.searchParams.set('role', role);
    wsUrl.searchParams.set('level', level);
    if(company) wsUrl.searchParams.set('company', company);
    if(user.displayName) wsUrl.searchParams.set('userName', user.displayName);

    const response = await fetch(wsUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: stream as any, // Pass the stream as the body
      duplex: 'half'
    } as RequestInit);
    
    responseStreamRef.current = response;
    
    if (!response.body) {
      setStatus('error');
      return;
    }
    
    const reader = response.body.getReader();
    connectionRef.current = reader;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      const message = JSON.parse(new TextDecoder().decode(value));
      
      switch (message.type) {
        case 'status':
          setStatus(message.status);
          break;
        case 'user_transcript':
          setTranscript(prev => [...prev, { speaker: 'user', text: message.text }]);
          break;
        case 'ai_transcript':
          setTranscript(prev => [...prev, { speaker: 'ai', text: message.text }]);
          break;
        case 'question':
            setCurrentQuestion({ text: message.text, index: message.index, total: message.total });
            break;
        case 'audio':
          const audioData = atob(message.audio);
          const audioBytes = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioBytes[i] = audioData.charCodeAt(i);
          }
          const audioBuffer = await audioContextRef.current.decodeAudioData(audioBytes.buffer);
          audioQueueRef.current.push(audioBuffer);
          processAudioQueue();
          break;
        case 'finished':
          handleEndInterview();
          break;
      }
    }
  }, [user, topic, role, level, company, processAudioQueue, handleEndInterview]);


  useEffect(() => {
    if (user) {
        startInterview();
    }
    return () => {
        stopInterview();
    };
  }, [user, startInterview, stopInterview]);


  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
            <header className="p-4 border-b flex items-center justify-between">
                 <div className='flex items-center gap-3'>
                    <ListChecks className="h-6 w-6 text-primary" />
                    <h1 className="text-lg font-semibold">{topic} Interview</h1>
                 </div>
                 {currentQuestion && (
                    <div className='flex items-center gap-3 w-48'>
                         <Progress value={(currentQuestion.index / currentQuestion.total) * 100} className="h-2" />
                         <span className='text-sm text-muted-foreground font-medium'>{currentQuestion.index}/{currentQuestion.total}</span>
                    </div>
                 )}
            </header>
            <CardContent className="p-6 flex-grow flex flex-col items-center justify-center gap-8 text-center bg-muted/30 m-4 rounded-lg">
                <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                    status === 'listening' ? 'border-green-500/50' : 
                    status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                 )}>
                    {statusInfo[status].showMic ? <Mic className="h-20 w-20 text-green-500"/> : <Bot className="w-24 h-24 text-primary" />}
                     <div className={cn("absolute inset-0 rounded-full animate-pulse", statusInfo[status].color,
                       status === 'listening' ? 'bg-green-500/20' : 
                       status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                     )}></div>
                </div>

                <div className="space-y-2">
                    <Badge variant={status === 'error' ? 'destructive' : 'secondary'} className={cn(statusInfo[status].color, 'text-primary-foreground')}>{statusInfo[status].text}</Badge>
                </div>

                <div className="h-24 px-8 text-lg text-foreground font-medium">
                    <p>{currentQuestion?.text || transcript.slice(-1)[0]?.text || 'The interview will begin shortly...'}</p>
                </div>
            </CardContent>
            
            <div className="flex items-center justify-center gap-4 p-6 border-t">
                 <Button variant="destructive" size="lg" onClick={handleEndInterview} disabled={status === 'initializing' || status === 'finished'}>
                    <PhoneOff className="mr-2" />
                    End Interview
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
