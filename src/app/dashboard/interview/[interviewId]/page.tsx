
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, BrainCircuit, Loader2, Play } from 'lucide-react';
import { addActivity, checkAndIncrementUsage } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { interviewFlow } from '@/ai/flows/interview-flow';

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
      <p className="mt-6 text-2xl font-bold font-headline text-foreground">Mark</p>
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
            <><b>Mark:</b> {aiText}</>
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

  const [isSessionLive, setIsSessionLive] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [currentAiTranscription, setCurrentAiTranscription] = useState('');
  const [currentUserTranscription, setCurrentUserTranscription] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const finalTranscriptRef = useRef<TranscriptEntry[] | null>(null);
  const userVideoEl = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    isPlayingRef.current = true;

    const audioData = audioQueueRef.current.shift();
    if (audioData && audioContextRef.current) {
        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(
                Buffer.from(audioData, 'base64')
            );
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                isPlayingRef.current = false;
                processAudioQueue();
            };
            source.start(0);
        } catch (e) {
            console.error('Error playing audio:', e);
            isPlayingRef.current = false;
            processAudioQueue();
        }
    } else {
        isPlayingRef.current = false;
    }
  }, []);

  const startInterview = useCallback(async () => {
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

    setStatus('Requesting permissions...');
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        if (userVideoEl.current) {
            userVideoEl.current.srcObject = stream;
            userVideoEl.current.play();
        }
    } catch (err) {
        console.error('Error getting media devices.', err);
        setStatus('Error: Could not access camera or microphone.');
        toast({ title: "Permissions Denied", description: "Camera and microphone access is required for interviews.", variant: "destructive" });
        return;
    }

    setStatus('Connecting to AI...');
    setIsSessionLive(true);
    setElapsedTime(0);
    timerIntervalRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    
    // @ts-ignore
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const interviewParams = {
        topic: searchParams.get('topic') || 'general software engineering',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [], // Always start with an empty history for a new session
    };

    try {
        const flow = await interviewFlow.stream(interviewParams);
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        mediaRecorderRef.current.ondataavailable = async (event) => {
            if (event.data.size > 0) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    flow.send({ userAudio: base64Audio });
                };
                reader.readAsDataURL(event.data);
            }
        };

        mediaRecorderRef.current.start(500); // Send audio data every 500ms

        for await (const chunk of flow) {
            if (chunk.status) setStatus(chunk.status);
            if (chunk.aiText) setCurrentAiTranscription(prev => prev + chunk.aiText);
            if (chunk.userText) setCurrentUserTranscription(prev => prev + chunk.userText);
            if (chunk.aiAudio) {
                audioQueueRef.current.push(chunk.aiAudio);
                processAudioQueue();
            }
             if (chunk.transcript) {
                 // The flow now only sends the full transcript at the end, not during turns.
                 // We build it client side from text chunks.
             }
        }
        
        // This part runs after the stream has finished.
        const finalOutput = await flow.output();
        if (finalOutput?.transcript) {
            finalTranscriptRef.current = finalOutput.transcript;
        }

    } catch (err: any) {
        console.error('Error with interview flow:', err);
        setStatus('Error: Could not start interview.');
        toast({ title: 'Connection Error', description: 'Failed to connect to the interview service.', variant: 'destructive' });
        setIsSessionLive(false);
    } finally {
        endSession();
    }
  }, [isSessionLive, user, toast, router, searchParams, processAudioQueue]);

  const endSession = useCallback((shouldNavigate = true) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsSessionLive(false);
    if(shouldNavigate) setStatus('Interview ended. Navigating to results...');

    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    
    const stream = userVideoEl.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    
    if (userVideoEl.current) userVideoEl.current.srcObject = null;
    
    // Use the final transcript from the ref if available
    const finalTranscript = finalTranscriptRef.current || transcriptRef.current;

    if (shouldNavigate && user) {
        const interviewId = params.interviewId as string;
        
        if (finalTranscript.length === 0) {
            finalTranscript.push({ speaker: 'ai', text: 'Interview session ended before any exchange.' });
        }

        const activity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: finalTranscript,
            feedback: "Feedback will be generated on the results page.",
            details: {
                topic: searchParams.get('topic') || 'General',
                role: searchParams.get('role') || undefined,
                level: searchParams.get('level') || undefined,
                company: searchParams.get('company') || undefined,
            }
        };
        
        addActivity(user.uid, activity)
            .then(() => {
                router.push(`/dashboard/interview/${interviewId}/results`);
            })
            .catch((error) => {
                console.error("Failed to save activity:", error);
                toast({ title: "Could not save interview results", variant: "destructive" });
                router.push('/dashboard');
            });
    }
  }, [user, params.interviewId, searchParams, router, toast]);

  useEffect(() => {
    // When a text chunk comes in, add it to the live transcript ref
    if (currentAiTranscription.trim()) {
        transcriptRef.current.push({ speaker: 'ai', text: currentAiTranscription.trim() });
        setCurrentAiTranscription('');
    }
     if (currentUserTranscription.trim()) {
        transcriptRef.current.push({ speaker: 'user', text: currentUserTranscription.trim() });
        setCurrentUserTranscription('');
    }
  }, [currentAiTranscription, currentUserTranscription]);

  
  const toggleMute = () => {
    const stream = userVideoEl.current?.srcObject as MediaStream;
    if (stream) {
        const nextMuted = !isMuted;
        stream.getAudioTracks().forEach(track => { track.enabled = !nextMuted; });
        setIsMuted(nextMuted);
    }
  }

  const toggleVideo = () => {
     const stream = userVideoEl.current?.srcObject as MediaStream;
    if (stream) {
        const nextVideoOn = !isVideoOn;
        stream.getVideoTracks().forEach(track => { track.enabled = nextVideoOn; });
        setIsVideoOn(nextVideoOn);
    }
  }

  return (
    <div className="relative flex flex-col h-screen w-full p-4 sm:p-6 bg-background">
        <div className="absolute inset-0 thermal-gradient-bg z-0"/>
        <InterviewHeader status={status} elapsedTime={elapsedTime}/>
        <main className="flex-1 relative z-10 flex items-center justify-center">
            <AIPanel isInterviewing={isSessionLive} />
             {!isSessionLive && (
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
