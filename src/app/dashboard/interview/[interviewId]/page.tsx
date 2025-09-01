
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { InterviewState } from '@/lib/interview-types';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, AlertTriangle, Square, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { speechToTextWithDeepgram } from '@/ai/flows/deepgram-stt';
import { textToSpeechWithDeepgram } from '@/ai/flows/deepgram-tts';

type AgentStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'initializing' | 'error';
type TranscriptEntry = { speaker: 'user' | 'ai'; text: string };

function InterviewComponent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [status, setStatus] = useState<AgentStatus>('initializing');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(new Audio());

  const interviewStateRef = useRef<InterviewState>({
    interviewId: params.interviewId as string,
    topic: searchParams.get('topic') || 'General Software Engineering',
    role: searchParams.get('role') || 'Software Engineer',
    level: searchParams.get('level') || 'Entry-level',
    company: searchParams.get('company') || '',
    history: [],
    isComplete: false,
  });

  const processAIResponse = useCallback(async (userText?: string) => {
    setStatus('processing');
    try {
      const res = await fetch('/api/deepgram-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: interviewStateRef.current, message: userText || '' }),
      });

      if (!res.ok) throw new Error('Failed to get AI response');

      const { text: aiText, newState } = await res.json();
      interviewStateRef.current = newState;
      setTranscript(prev => [...prev, { speaker: 'ai', text: aiText }]);
      
      setStatus('speaking');
      const ttsResult = await textToSpeechWithDeepgram({ text: aiText });
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = ttsResult.audioDataUri;
        audioPlayerRef.current.play();
        audioPlayerRef.current.onended = () => {
          if (newState.isComplete) {
            handleEndInterview();
          } else {
            setStatus('idle');
          }
        };
      }
    } catch (error) {
      console.error("Error processing AI response:", error);
      toast({ title: "Agent Error", description: "An error occurred with the agent.", variant: "destructive" });
      setStatus('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);
  
  const handleStartInterview = useCallback(() => {
    if (!user) return;
    setStatus('initializing');
    processAIResponse(); // Get the initial greeting
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    handleStartInterview();
  }, [handleStartInterview]);

  const startRecording = async () => {
    if (status !== 'idle') return;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = async () => {
            setStatus('processing');
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Convert Blob to Base64 Data URI
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                try {
                    const { transcript: transcribedText } = await speechToTextWithDeepgram({ audioDataUri: base64Audio });
                    if(transcribedText) {
                        setTranscript(prev => [...prev, { speaker: 'user', text: transcribedText }]);
                        processAIResponse(transcribedText);
                    } else {
                        // Handle no transcription
                        setStatus('idle');
                        toast({title: "Couldn't hear you", description: "No speech was detected. Please try again.", variant: "destructive"})
                    }
                } catch (error) {
                    console.error("Transcription error:", error);
                    setStatus('idle');
                }
            };
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setStatus('listening');
    } catch (error) {
        console.error("Microphone access denied:", error);
        toast({ title: "Microphone Access Denied", description: "Please allow microphone access in your browser settings.", variant: "destructive" });
        setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Processing status is set in the onstop handler
    }
  };

  const handleEndInterview = async () => {
    if (!user) return;
    setStatus('initializing'); // Show a generic loading state
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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && !event.repeat && !isRecording && status === 'idle') {
      event.preventDefault();
      startRecording();
    }
  }, [isRecording, status]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && isRecording) {
      event.preventDefault();
      stopRecording();
    }
  }, [isRecording]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);


  const statusInfo = {
    initializing: { text: "Initializing Session...", color: "bg-gray-500", icon: <Loader2 className="animate-spin" /> },
    idle: { text: "Ready", color: "bg-blue-500", icon: <Mic /> },
    listening: { text: "Listening...", color: "bg-red-500", icon: <Mic /> },
    processing: { text: "Processing...", color: "bg-yellow-500", icon: <Loader2 className="animate-spin" /> },
    speaking: { text: "AI is Speaking...", color: "bg-green-500", icon: <Bot /> },
    error: { text: "Error", color: "bg-destructive", icon: <AlertTriangle /> },
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
            <CardContent className="p-6 flex-grow flex flex-col items-center justify-center gap-8 text-center">
                 <div className={cn("flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                    isRecording ? 'border-red-500/50' : 'border-border'
                 )}>
                    <div className={cn("flex items-center justify-center w-full h-full rounded-full transition-all duration-300",
                        isRecording ? 'bg-red-500/20' : 'bg-muted'
                    )}>
                        <Bot className="w-24 h-24 text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-headline">{interviewStateRef.current.topic} Interview</h1>
                    <Badge variant={status === 'error' ? 'destructive' : 'secondary'}>{statusInfo[status].text}</Badge>
                </div>

                <div className="h-20 text-xl text-muted-foreground">
                    <p>{transcript.slice(-1)[0]?.text || 'Press and hold spacebar to speak'}</p>
                </div>
            </CardContent>
            
            <div className="flex flex-col items-center gap-4 p-6 border-t">
                 <Button
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={cn("h-16 w-32", isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary")}
                    disabled={status !== 'idle'}
                 >
                    {isRecording ? <Square /> : <Mic />}
                 </Button>
                 <p className="text-sm text-muted-foreground">Or hold the spacebar to talk</p>
                 <Button variant="link" onClick={handleEndInterview} disabled={status === 'initializing'}>
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
