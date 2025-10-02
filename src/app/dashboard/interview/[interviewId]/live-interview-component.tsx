'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertTriangle, Loader2, Play, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addActivity } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity } from '@/lib/types';
import LiveAudioVisuals3D from './live-audio-visuals-3d';
import { Analyser } from '@/lib/live-audio/utils';

type InterviewStatus = 'idle' | 'requesting_mic' | 'ready' | 'recording' | 'processing' | 'error' | 'finished';

const LiveInterviewComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<InterviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const inputAnalyserRef = useRef<Analyser | null>(null);
  const outputAnalyserRef = useRef<Analyser | null>(null);
  const transcriptRef = useRef<{ speaker: 'user' | 'ai'; text: string; }[]>([]);

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'entry-level';
  const company = searchParams.get('company') || '';

  const queryParams = new URLSearchParams({ topic, role, level, company }).toString();

  const cleanupAudio = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    mediaRecorderRef.current = null;
    audioContextRef.current = null;
    inputNodeRef.current = null;
    outputNodeRef.current = null;
    inputAnalyserRef.current = null;
    outputAnalyserRef.current = null;
  }, []);

  const requestMicPermission = useCallback(async () => {
    setStatus('requesting_mic');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Close this initial stream, we'll create a new one for recording
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
      setStatus('ready');
    } catch (err) {
      console.error('Microphone access denied:', err);
      setError('Microphone access is required to start the interview.');
      setStatus('error');
    }
  }, []);

  const startInterview = useCallback(async () => {
    if (status !== 'ready' && status !== 'finished') return;
    setStatus('processing');
    cleanupAudio();

    try {
      const liveStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // --- Setup for Input Visualization ---
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const inputSourceNode = inputAudioContext.createMediaStreamSource(liveStream);
      const inputGainNode = inputAudioContext.createGain();
      inputSourceNode.connect(inputGainNode);
      inputNodeRef.current = inputGainNode;
      inputAnalyserRef.current = new Analyser(inputGainNode);
      
      // --- Setup for Output Visualization ---
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const outputGainNode = outputAudioContext.createGain();
      outputGainNode.connect(outputAudioContext.destination);
      outputNodeRef.current = outputGainNode;
      outputAnalyserRef.current = new Analyser(outputGainNode);

      // --- Setup MediaRecorder ---
      mediaRecorderRef.current = new MediaRecorder(liveStream, { mimeType: 'audio/webm' });

      const response = await fetch(`/api/gemini-live?${queryParams}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: new ReadableStream({
          start(controller) {
            if (!mediaRecorderRef.current) return;
            mediaRecorderRef.current.ondataavailable = (event) => {
              if (event.data.size > 0) {
                controller.enqueue(event.data);
              }
            };
            mediaRecorderRef.current.onstop = () => {
               try { controller.close(); } catch(e) {}
            };
            mediaRecorderRef.current.onerror = (err) => {
                try { controller.error(err); } catch(e) {}
            }
          },
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start the live session.');
      }
      
      setStatus('recording');
      mediaRecorderRef.current.start(250); // Send data every 250ms

      const reader = response.body.getReader();
      let nextStartTime = outputAudioContext.currentTime;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setStatus('finished');
          break;
        }

        const audioBuffer = await outputAudioContext.decodeAudioData(value.buffer);
        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputGainNode);
        
        const scheduledTime = Math.max(nextStartTime, outputAudioContext.currentTime);
        source.start(scheduledTime);
        nextStartTime = scheduledTime + audioBuffer.duration;
      }
    } catch (err: any) {
      console.error('Interview Error:', err);
      setError(err.message || 'An unknown error occurred during the interview.');
      setStatus('error');
      cleanupAudio();
    }
  }, [status, cleanupAudio, queryParams]);
  
  const finishInterviewAndSave = useCallback(async () => {
    setStatus('processing');
    cleanupAudio();

    if (user && interviewId) {
        try {
            const activity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcriptRef.current, // Assuming transcript is captured elsewhere for now
                feedback: 'Feedback will be generated on the results page.',
                details: { topic, role, level, company }
            };
            await addActivity(user.uid, activity);
            toast({
                title: "Interview Complete!",
                description: "Your session has been saved. Generating feedback now...",
            });
            router.push(`/dashboard/interview/${interviewId}/results`);
        } catch (error) {
            console.error('Failed to save interview activity:', error);
            toast({
                title: "Save Error",
                description: "Could not save your interview session. Please view results to try again.",
                variant: "destructive"
            });
            router.push(`/dashboard/interview/${interviewId}/results`);
        }
    } else {
        // Fallback for user not logged in (should not happen in prod)
        router.push('/dashboard');
    }
  }, [cleanupAudio, user, interviewId, topic, role, level, company, router, toast]);

  useEffect(() => {
    return () => {
      cleanupAudio(); // Cleanup on component unmount
    };
  }, [cleanupAudio]);
  

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Interview Setup</h1>
            <p className="text-muted-foreground mb-8">Click below to grant microphone access and start your interview.</p>
            <Button size="lg" onClick={requestMicPermission}>
              <Play className="mr-2" /> Grant Mic Access
            </Button>
          </div>
        );
      case 'requesting_mic':
        return (
             <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">Requesting Microphone...</h2>
                <p className="text-muted-foreground mt-2">Please allow microphone access in your browser.</p>
            </div>
        )
      case 'ready':
         return (
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Ready to Start</h1>
                <p className="text-muted-foreground mb-8">Microphone is ready. Click the button below to begin your interview.</p>
                <Button size="lg" onClick={startInterview}>
                    <Play className="mr-2" /> Start Interview
                </Button>
            </div>
        );
      case 'recording':
        return (
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-red-500 flex items-center justify-center gap-2 mb-4">
                    <Mic className="animate-pulse" /> LIVE
                </h2>
                <p className="text-muted-foreground mb-8">The interview is in progress. Speak clearly.</p>
                <Button size="lg" variant="destructive" onClick={finishInterviewAndSave}>
                    End Interview
                </Button>
            </div>
        );
      case 'finished':
          return (
             <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Interview Complete</h1>
                <p className="text-muted-foreground mb-8">Your session has ended. Proceed to view your results and feedback.</p>
                <div className="flex gap-4 justify-center">
                    <Button size="lg" variant="outline" onClick={startInterview}>
                        <RefreshCw className="mr-2" /> Start New Interview
                    </Button>
                    <Button size="lg" onClick={finishInterviewAndSave}>
                        View Results
                    </Button>
                </div>
            </div>
          );
       case 'error':
         return (
            <div className="text-center p-8 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold">An Error Occurred</h2>
                <p className="text-destructive mt-2 mb-6">{error}</p>
                <Button size="lg" onClick={() => setStatus('idle')}>
                    Try Again
                </Button>
            </div>
         );
      default:
        return (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
             <h2 className="text-2xl font-semibold mt-4">Connecting...</h2>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
        <LiveAudioVisuals3D inputNode={inputNodeRef.current} outputNode={outputNodeRef.current} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="z-10 p-8 rounded-lg max-w-lg w-full text-white bg-black/30 backdrop-blur-md border border-white/10">
                {renderContent()}
            </div>
        </div>
    </div>
  );
};
