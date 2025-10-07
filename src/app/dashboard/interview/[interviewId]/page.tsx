
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, BrainCircuit, Loader2, Play } from 'lucide-react';
import { addActivity, updateUserFromIcebreaker, checkAndIncrementUsage } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry, IcebreakerData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// --- Sub-components for better structure ---

const InterviewHeader = ({ status, elapsedTime }: { status: string; elapsedTime: number }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className={cn("flex items-center gap-4 bg-background/50 border rounded-full px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm", status.toLowerCase().includes('error') && 'bg-destructive/20 border-destructive text-destructive-foreground')}>
            <span className={cn("w-2 h-2 rounded-full", status.toLowerCase().includes('your turn') ? 'bg-red-500 animate-pulse' : (status.toLowerCase().includes('error') ? 'bg-destructive' : 'bg-yellow-500'))}/>
            <span>{status}</span>
            {elapsedTime > 0 && <span className="font-mono">{formatTime(elapsedTime)}</span>}
        </div>
    </div>
  );
};

const AIPanel = ({ isInterviewing }: { isInterviewing: boolean; }) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-muted/20 rounded-2xl overflow-hidden border">
       <div className="absolute inset-0 bg-dot-pattern opacity-10"/>
      <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-500", isInterviewing ? 'scale-100' : 'scale-90')}>
         <div className={cn("absolute inset-0 rounded-full bg-primary/10", isInterviewing && 'animate-pulse duration-1000')}/>
         <div className={cn("absolute inset-2 rounded-full bg-primary/20", isInterviewing && 'animate-pulse duration-1500')}/>
        <Avatar className="w-32 h-32 border-4 border-background">
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <BrainCircuit className="w-16 h-16" />
          </div>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      </div>
      <p className="mt-6 text-2xl font-bold font-headline text-foreground">Kathy</p>
      <p className="text-muted-foreground">AI Interviewer</p>
    </div>
  );
};

const UserVideo = ({ videoRef, isVideoOn }: { videoRef: React.RefObject<HTMLVideoElement>; isVideoOn: boolean; }) => {
  return (
    <div className={cn(
        "absolute bottom-6 right-6 w-56 h-56 rounded-full overflow-hidden border-2 border-border bg-black shadow-lg transition-all duration-300",
        !isVideoOn && "flex items-center justify-center"
    )}>
      <video
        ref={videoRef}
        muted
        playsInline
        className={cn(
            "w-full h-full object-cover transform -scale-x-100",
            !isVideoOn && "hidden"
        )}
      ></video>
      {!isVideoOn && (
        <div className="flex flex-col items-center text-muted-foreground">
          <VideoOff className="w-8 h-8"/>
          <p className="text-sm mt-2">Camera is off</p>
        </div>
      )}
    </div>
  );
};

const CaptionDisplay = ({ userText, aiText }: { userText: string; aiText: string; }) => {
  const text = aiText || userText;
  if (!text) return null;
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
      <div className="bg-background/60 backdrop-blur-md rounded-lg p-4 text-center text-lg shadow-lg border">
         {aiText ? (
            <><b>Kathy:</b> {aiText}</>
          ) : (
            <><b>You:</b> {userText}</>
          )}
      </div>
    </div>
  );
};

const ControlBar = ({ onMuteToggle, onVideoToggle, onEndCall, isMuted, isVideoOn, isSessionLive }: {
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOn: boolean;
  isSessionLive: boolean;
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 rounded-full bg-background/50 border p-3 backdrop-blur-md">
      <Button onClick={onMuteToggle} size="icon" className="w-14 h-14 rounded-full" variant={isMuted ? 'destructive' : 'secondary'}>
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      <Button onClick={onVideoToggle} size="icon" className="w-14 h-14 rounded-full" variant={!isVideoOn ? 'destructive' : 'secondary'}>
        {isVideoOn ? <Video /> : <VideoOff />}
      </Button>
      <Button onClick={onEndCall} size="icon" className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white" disabled={!isSessionLive}>
        <Phone />
      </Button>
    </div>
  );
};


export default function LiveInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState('Ready to Start');
  const [isRecording, setIsRecording] = useState(false);
  const [isSessionLive, setIsSessionLive] = useState(false);
  const [currentAiTranscription, setCurrentAiTranscription] = useState('');
  const [currentUserTranscription, setCurrentUserTranscription] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userVideoEl = useRef<HTMLVideoElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterview = async () => {
    if (isSessionLive) return;

    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to start an interview.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    const usage = await checkAndIncrementUsage(user.uid);
    if (!usage.success) {
      toast({ title: 'Usage Limit Reached', description: usage.message, variant: 'destructive' });
      router.push('/dashboard/pricing');
      return;
    }
    
    setStatus('Requesting device access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      if (userVideoEl.current) {
        userVideoEl.current.srcObject = stream;
        userVideoEl.current.play();
      }

      setStatus('Microphone access granted. Connecting...');

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/gemini-live`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsSessionLive(true);
        setElapsedTime(0);
        timerIntervalRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        setStatus('Waiting for Kathy to start...');
        
        const topic = searchParams.get('topic') || 'general software engineering';
        const role = searchParams.get('role') || 'Software Engineer';
        const company = searchParams.get('company') || 'Google';

        wsRef.current?.send(JSON.stringify({
          type: 'start_session',
          topic,
          role,
          company,
        }));
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'ai_audio' && message.data) {
          const audio = new Audio("data:audio/wav;base64," + message.data);
          audio.play();
        }
        
        if(message.type === 'user_transcript') {
            setCurrentUserTranscription(prev => prev + message.text);
        }
        
        if(message.type === 'ai_transcript') {
            setIsRecording(false);
            setStatus("Kathy is speaking...");
            setCurrentAiTranscription(prev => prev + message.text);
        }

        if (message.type === 'turn_complete') {
            const finalUserText = currentUserTranscription;
            const finalAiText = currentAiTranscription;

            if (finalUserText.trim()) {
                transcriptRef.current.push({ speaker: 'user', text: finalUserText.trim() });
            }
            if (finalAiText.trim()) {
                transcriptRef.current.push({ speaker: 'ai', text: finalAiText.trim() });
            }

            setCurrentUserTranscription('');
            setCurrentAiTranscription('');

            if (message.isModelTurn) {
                setStatus("🔴 Your turn... Speak now.");
                setIsRecording(true);
            }
        }
        
        if (message.type === 'error') {
          setStatus(`Error: ${message.error}`);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setStatus('Connection error. Please refresh.');
      };

      wsRef.current.onclose = () => {
        if (isSessionLive) { // Prevent showing on initial failed connections if possible
          endSession();
        }
        setIsSessionLive(false);
        setStatus('Session Closed');
      };

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      scriptProcessorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      scriptProcessorNodeRef.current.onaudioprocess = (e) => {
        if (isRecording && !isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
          const pcmData = e.inputBuffer.getChannelData(0);
          wsRef.current.send(pcmData.buffer);
        }
      };
      
      source.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(audioContextRef.current.destination);

    } catch (err: any) {
      setStatus(`Error starting interview: ${err.message}`);
      endSession();
    }
  };

  const endSession = useCallback(async (shouldNavigate = true) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsSessionLive(false);
    setIsRecording(false);
    if(shouldNavigate) setStatus('Interview ended. Navigating to results...');

    wsRef.current?.close();

    scriptProcessorNodeRef.current?.disconnect();
    audioContextRef.current?.close();
    
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    
    if (userVideoEl.current) userVideoEl.current.srcObject = null;

    if (shouldNavigate && user) {
        const interviewId = params.interviewId as string;
        router.push(`/dashboard/interview/${interviewId}/results`);

        if (transcriptRef.current.length === 0) {
            transcriptRef.current.push({ speaker: 'ai', text: 'Interview ended prematurely.' });
        }
        const activity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcriptRef.current,
            feedback: "Feedback will be generated on the results page.",
            details: {
                topic: searchParams.get('topic') || 'General',
                role: searchParams.get('role') || undefined,
                level: searchParams.get('level') || undefined,
                company: searchParams.get('company') || undefined,
            }
        };
        
        await addActivity(user.uid, activity).catch(error => {
            console.error("Failed to save activity:", error);
            toast({ title: "Could not save interview results", variant: "destructive" });
        });
    }
  }, [user, params, searchParams, router, toast]);

  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleVideo = () => {
    const nextVideoOn = !isVideoOn;
    setIsVideoOn(nextVideoOn);
     if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(track => { track.enabled = nextVideoOn; });
    }
  }

  return (
    <div className="relative flex flex-col h-screen w-full p-4 sm:p-6 bg-background">
        <div className="absolute inset-0 thermal-gradient-bg z-0"/>
        <InterviewHeader status={status} elapsedTime={elapsedTime}/>
        <main className="flex-1 relative z-10 flex items-center justify-center">
            <AIPanel isInterviewing={isSessionLive} />
             {!isSessionLive && status !== 'Ready to Start' && !status.toLowerCase().includes('error') && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                        <p className="text-muted-foreground capitalize">{status}...</p>
                    </div>
                 </div>
             )}
             {!isSessionLive && status === 'Ready to Start' && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                    <Button onClick={startInterview} size="lg" className="h-16 rounded-full px-8">
                    <Play className="mr-3 h-6 w-6"/>
                    Start Interview
                    </Button>
                </div>
            )}
        </main>
        <UserVideo videoRef={userVideoEl} isVideoOn={isVideoOn} />
        <CaptionDisplay userText={currentUserTranscription} aiText={currentAiTranscription}/>
        {isSessionLive && (
          <ControlBar 
              onMuteToggle={toggleMute}
              onVideoToggle={toggleVideo}
              onEndCall={() => endSession()}
              isMuted={isMuted}
              isVideoOn={isVideoOn}
              isSessionLive={isSessionLive}
          />
        )}
    </div>
  );
}
