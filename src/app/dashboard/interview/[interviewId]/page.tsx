
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Bot, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ListChecks } from 'lucide-react';

type AgentStatus = 'initializing' | 'generating_questions' | 'connected' | 'speaking' | 'listening' | 'finished' | 'error' | 'questions_ready';

const statusInfo: { [key in AgentStatus]: { text: string; showMic?: boolean } } = {
  initializing: { text: "Initializing Session..." },
  generating_questions: { text: "Generating Questions..." },
  connected: { text: "Connected. The AI is ready." },
  questions_ready: { text: "Ready to Start" },
  listening: { text: "Listening...", showMic: true },
  speaking: { text: "AI is Speaking..." },
  finished: { text: "Interview Finished" },
  error: { text: "Connection Error" },
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
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const responseReaderRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const stopInterviewRef = useRef<boolean>(false);

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current || audioContextRef.current.state === 'closed') {
      return;
    }
    
    isPlayingRef.current = true;
    setStatus('speaking');

    const audioBuffer = audioQueueRef.current.shift();
    if (audioBuffer) {
      try {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          isPlayingRef.current = false;
          if (audioQueueRef.current.length === 0 && !stopInterviewRef.current) {
            setStatus('listening');
          }
          processAudioQueue();
        };
        source.start();
      } catch (e) {
        console.error("Error playing audio:", e);
        isPlayingRef.current = false;
        if (!stopInterviewRef.current) setStatus('listening');
      }
    } else {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length === 0 && !stopInterviewRef.current) {
        setStatus('listening');
      }
    }
  }, []);

  const stopInterview = useCallback(async (save: boolean = false) => {
    if (stopInterviewRef.current) return;
    stopInterviewRef.current = true;
    setStatus('finished');

    if(responseReaderRef.current) {
        await responseReaderRef.current.cancel();
        responseReaderRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
    }

    if (save && user && transcript.length > 0) {
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
    } else if (!save) {
        router.push('/dashboard/arena');
    }
  }, [user, interviewId, transcript, topic, role, level, company, router]);

  const startInterview = useCallback(async () => {
    if (!user) return;
    
    stopInterviewRef.current = false;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } else if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    setStatus('initializing');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const apiUrl = new URL('/api/deepgram-agent', window.location.origin);
      apiUrl.searchParams.set('topic', topic);
      apiUrl.searchParams.set('role', role);
      apiUrl.searchParams.set('level', level);
      if(company) apiUrl.searchParams.set('company', company);
      if(user.displayName) apiUrl.searchParams.set('userName', user.displayName);

      const response = await fetch(apiUrl, {
          method: 'POST',
          body: mediaRecorderRef.current.stream,
      });

      if (!response.ok || !response.body) {
          throw new Error('Failed to connect to the agent.');
      }
      
      mediaRecorderRef.current.start(250);

      responseReaderRef.current = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!stopInterviewRef.current) {
          const { done, value } = await responseReaderRef.current.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // Keep the last, possibly incomplete part

          for (const part of parts) {
            try {
              const message = JSON.parse(part);
              switch (message.type) {
                case 'status':
                  setStatus(message.status);
                  break;
                case 'user_transcript':
                case 'ai_transcript':
                  setTranscript(prev => {
                    const newTranscript = [...prev];
                    const lastEntry = newTranscript[newTranscript.length - 1];
                    if (lastEntry && lastEntry.speaker === message.type.split('_')[0]) {
                      lastEntry.text = message.text;
                      return newTranscript;
                    } else {
                      return [...newTranscript, { speaker: message.type.split('_')[0], text: message.text }];
                    }
                  });
                  break;
                case 'question':
                  setCurrentQuestion({ text: message.text, index: message.index, total: message.total });
                  break;
                case 'finished':
                  await stopInterview(true);
                  break;
              }
            } catch (e) {
                // This might be an audio chunk if we don't have a clear separator
                 if (value instanceof Uint8Array) {
                     const audioArrayBuffer = value.buffer;
                     if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                       try {
                         const audioBuffer = await audioContextRef.current.decodeAudioData(audioArrayBuffer);
                         audioQueueRef.current.push(audioBuffer);
                         processAudioQueue();
                       } catch (decodeError) {
                         console.error("Error decoding audio data:", decodeError);
                       }
                     }
                 }
            }
          }
      }
    } catch (error) {
      console.error("Interview failed:", error);
      setStatus('error');
    }
  }, [user, topic, role, level, company, processAudioQueue, stopInterview]);

  useEffect(() => {
    if (user) {
        startInterview();
    }
    return () => {
        stopInterview(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
                     <div className={cn("absolute inset-0 rounded-full animate-pulse",
                       status === 'listening' ? 'bg-green-500/20' : 
                       status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                     )}></div>
                </div>

                <div className="space-y-2">
                    <Badge variant={status === 'error' ? 'destructive' : 'secondary'} className={cn(
                        status === 'listening' ? 'bg-green-500' :
                        status === 'speaking' ? 'bg-blue-500' :
                        'bg-gray-500',
                        'text-primary-foreground'
                    )}>{statusInfo[status].text}</Badge>
                </div>

                <div className="h-24 px-8 text-lg text-foreground font-medium">
                    <p>{currentQuestion?.text || (transcript.length > 0 ? transcript.slice(-1)[0].text : 'The interview will begin shortly...')}</p>
                </div>
            </CardContent>
            
            <div className="flex items-center justify-center gap-4 p-6 border-t">
                 <Button variant="destructive" size="lg" onClick={() => stopInterview(true)} disabled={status === 'initializing' || status === 'finished'}>
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
