
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, Bot, PhoneOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ListChecks } from 'lucide-react';

type AgentStatus = 'initializing' | 'generating_questions' | 'connected' | 'speaking' | 'listening' | 'finished' | 'error' | 'questions_ready';

const statusInfo: { [key in AgentStatus]: { text: string; showMic?: boolean } } = {
  initializing: { text: "Initializing Session..." },
  generating_questions: { text: "AI is preparing questions..." },
  connected: { text: "Connected. The AI is ready." },
  questions_ready: { text: "Ready to Start. The AI will speak first." },
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
  const responseStreamController = useRef<AbortController | null>(null);
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
    if (status !== 'speaking') setStatus('speaking');

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
  }, [status]);
  
  const stopInterview = useCallback(async (save: boolean = false) => {
    if (stopInterviewRef.current) return;
    stopInterviewRef.current = true;
    setStatus('finished');

    responseStreamController.current?.abort();
    responseStreamController.current = null;
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
    }
    audioContextRef.current = null;

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
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("AudioContext is not supported.", e);
            setStatus('error');
            return;
        }
    }
    
    setStatus('initializing');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      const apiUrl = new URL('/api/deepgram-agent', window.location.origin);
      apiUrl.searchParams.set('topic', topic);
      apiUrl.searchParams.set('role', role);
      apiUrl.searchParams.set('level', level);
      if(company) apiUrl.searchParams.set('company', company);
      if(user.displayName) apiUrl.searchParams.set('userName', user.displayName);

      responseStreamController.current = new AbortController();

      const response = await fetch(apiUrl, {
          method: 'POST',
          body: mediaRecorderRef.current.stream,
          signal: responseStreamController.current.signal,
      });

      if (!response.ok || !response.body) {
          throw new Error('Failed to connect to the agent.');
      }
      
      mediaRecorderRef.current.start(250);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!stopInterviewRef.current) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const message = JSON.parse(line.substring(6));

              switch (message.type) {
                case 'status':
                  setStatus(message.status);
                  break;
                case 'user_transcript':
                case 'ai_transcript':
                  setTranscript(prev => {
                      const newTranscript = [...prev];
                      const speaker = message.type.startsWith('ai') ? 'ai' : 'user';
                      const lastEntry = newTranscript[newTranscript.length - 1];

                      if (lastEntry && lastEntry.speaker === speaker) {
                          lastEntry.text = message.text;
                          return newTranscript;
                      } else {
                          return [...newTranscript, { speaker, text: message.text }];
                      }
                  });
                  break;
                case 'question':
                  setCurrentQuestion({ text: message.text, index: message.index, total: message.total });
                  break;
                case 'audio':
                  const audioData = atob(message.data);
                  const audioBytes = new Uint8Array(audioData.length);
                  for (let i = 0; i < audioData.length; i++) {
                      audioBytes[i] = audioData.charCodeAt(i);
                  }
                  if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                      try {
                          const decodedBuffer = await audioContextRef.current.decodeAudioData(audioBytes.buffer);
                          audioQueueRef.current.push(decodedBuffer);
                          processAudioQueue();
                      } catch (decodeError) {
                         console.error("Error decoding audio data:", decodeError);
                      }
                  }
                  break;
                case 'finished':
                  await stopInterview(true);
                  break;
              }
            } catch (e) {
                console.error("Error processing message:", e, "Line:", line);
            }
          }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error("Interview failed:", error);
        setStatus('error');
      }
    }
  }, [user, topic, role, level, company, processAudioQueue, stopInterview]);

  useEffect(() => {
    if (user) {
      startInterview();
    }
    
    return () => {
      // This cleanup function will be called when the component unmounts.
      stopInterview(false);
    };
  }, [user, startInterview]);

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
                {status === 'error' ? (
                     <div className="text-center text-destructive">
                        <AlertTriangle className="w-24 h-24 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold">Connection Failed</h2>
                        <p>Could not connect to the voice agent. Please check your microphone permissions and try again.</p>
                    </div>
                ) : (
                <>
                    <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                        status === 'listening' ? 'border-green-500/50' : 
                        status === 'speaking' ? 'border-blue-500/50' : 'border-border'
                    )}>
                        {status === 'listening' ? <Mic className="h-20 w-20 text-green-500"/> : <Bot className="w-24 h-24 text-primary" />}
                        <div className={cn("absolute inset-0 rounded-full animate-pulse",
                        status === 'listening' ? 'bg-green-500/20' : 
                        status === 'speaking' ? 'bg-blue-500/20' : 'bg-transparent'
                        )}></div>
                    </div>

                    <div className="space-y-2">
                        <Badge variant={status === 'error' ? 'destructive' : 'secondary'} className={cn(
                            (status === 'listening' || status ==='speaking') ?
                            (status === 'listening' ? 'bg-green-500' : 'bg-blue-500') :
                            'bg-gray-500',
                            'text-primary-foreground text-sm px-4 py-1'
                        )}>{statusInfo[status].text}</Badge>
                    </div>

                    <div className="h-24 px-8 text-lg text-foreground font-medium">
                        <p>{currentQuestion?.text || (transcript.length > 0 ? transcript.slice(-1)[0].text : 'The interview will begin shortly...')}</p>
                    </div>
                 </>
                )}
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
