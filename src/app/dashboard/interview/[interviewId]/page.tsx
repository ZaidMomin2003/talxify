
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
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '@/lib/utils';

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

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [currentAiTranscription, setCurrentAiTranscription] = useState('');
  const [currentUserTranscription, setCurrentUserTranscription] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userVideoEl = useRef<HTMLVideoElement>(null);
  
  const clientRef = useRef<GoogleGenAI | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const nextAudioStartTimeRef = useRef(0);
  const audioBufferSources = useRef(new Set<AudioBufferSourceNode>());

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopAllPlayback = useCallback(() => {
    if (!outputAudioContextRef.current) return;
    for (const source of audioBufferSources.current.values()) {
        source.stop();
    }
    audioBufferSources.current.clear();
    nextAudioStartTimeRef.current = 0;
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!outputAudioContextRef.current) return;
    const audioContext = outputAudioContextRef.current;
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const nextStartTime = Math.max(nextAudioStartTimeRef.current, audioContext.currentTime);

    try {
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioContext,
            24000,
            1
        );

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.onended = () => {
            audioBufferSources.current.delete(source);
        };
        source.start(nextStartTime);
        nextAudioStartTimeRef.current = nextStartTime + audioBuffer.duration;
        audioBufferSources.current.add(source);

    } catch (e) {
      console.error("Error playing audio:", e);
    }
  }, []);

  const handleAIMessage = useCallback(async (message: LiveServerMessage) => {
    const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
    if (audio) {
      playAudio(audio.data);
    }
    if (message.serverContent?.interrupted) {
      stopAllPlayback();
    }
    if (message.serverContent?.outputTranscription) {
      setCurrentAiTranscription(prev => prev + message.serverContent.outputTranscription.text);
      setStatus("Kathy is speaking...");
    }
    if (message.serverContent?.inputTranscription) {
      setCurrentUserTranscription(prev => prev + message.serverContent.inputTranscription.text);
    }
    if (message.serverContent?.turnComplete) {
       if (currentAiTranscription.trim()) {
           transcriptRef.current.push({ speaker: 'ai', text: currentAiTranscription.trim() });
       }
       if (currentUserTranscription.trim()) {
           transcriptRef.current.push({ speaker: 'user', text: currentUserTranscription.trim() });
       }
       setCurrentUserTranscription('');
       setCurrentAiTranscription('');
       setStatus("🔴 Your turn... Speak now.");
    }
  }, [playAudio, stopAllPlayback, currentAiTranscription, currentUserTranscription]);

  const endSession = useCallback(async (shouldNavigate = true) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    setIsInterviewing(false);
    if(shouldNavigate) setStatus('Interview ended. Navigating to results...');

    sessionRef.current?.close();
    sessionRef.current = null;

    scriptProcessorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    
    if (userVideoEl.current) userVideoEl.current.srcObject = null;

    if (shouldNavigate && user) {
        const interviewId = params.interviewId as string;
        
        if (transcriptRef.current.length === 0) {
            transcriptRef.current.push({ speaker: 'ai', text: 'Interview session ended before any exchange.' });
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
        
        try {
            await addActivity(user.uid, activity);
        } catch (error) {
            console.error("Failed to save activity:", error);
            toast({ title: "Could not save interview results", variant: "destructive" });
        } finally {
            router.push(`/dashboard/interview/${interviewId}/results`);
        }
    }
  }, [user, params.interviewId, searchParams, router, toast]);
  

  useEffect(() => {
    async function init() {
        // @ts-ignore
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            setStatus("Error: Gemini API Key not configured.");
            return;
        }
        clientRef.current = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        
        const topic = searchParams.get('topic') || 'general software engineering';
        const role = searchParams.get('role') || 'Software Engineer';
        const company = searchParams.get('company') || undefined;

        let systemInstruction = `You are Kathy, an expert technical interviewer at Talxify. You are interviewing a candidate for the role of "${role}" on the topic of "${topic}". Start with a friendly introduction, then ask your first question. Always wait for the user to finish speaking. Your speech should be concise.`;
        if (company) {
            systemInstruction += ` The candidate is interested in ${company}, so you can tailor behavioral questions to their leadership principles if applicable.`;
        }

        try {
            const session = await clientRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => setStatus('Waiting for Kathy to start...'),
                    onmessage: handleAIMessage,
                    onerror: (e) => setStatus(`Error: ${e.message}`),
                    onclose: (e) => {
                        if (isInterviewing) {
                            setStatus('Session Closed: ' + e.reason);
                            endSession();
                        }
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } } },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: systemInstruction,
                },
            });
            sessionRef.current = session;
        } catch (e: any) {
            console.error("Connection to Gemini failed:", e);
            setStatus(`Error: ${e.message}`);
        }
    }

    init();

    return () => {
        endSession(false);
    }
  }, [searchParams, handleAIMessage, endSession, isInterviewing]);

  const startInterview = useCallback(async () => {
    if (isInterviewing) return;
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

    await inputAudioContextRef.current?.resume();
    await outputAudioContextRef.current?.resume();

    setStatus('Requesting device access...');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mediaStreamRef.current = stream;
        
        if (userVideoEl.current) {
            userVideoEl.current.srcObject = stream;
            userVideoEl.current.play();
        }
        
        setIsInterviewing(true);
        setElapsedTime(0);
        timerIntervalRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        
        const inputCtx = inputAudioContextRef.current!;
        sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);

        const bufferSize = 4096;
        scriptProcessorNodeRef.current = inputCtx.createScriptProcessor(bufferSize, 1, 1);

        scriptProcessorNodeRef.current.onaudioprocess = (event) => {
            if (!sessionRef.current || isMuted) return;
            const pcmData = event.inputBuffer.getChannelData(0);
            sessionRef.current.sendRealtimeInput({ media: createBlob(pcmData) });
        };
        
        sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
        scriptProcessorNodeRef.current.connect(inputCtx.destination);
        
        if (sessionRef.current) {
            sessionRef.current.sendRealtimeInput({});
        } else {
             throw new Error("Session is not available to start the interview.");
        }


    } catch (err: any) {
        setStatus(`Error starting interview: ${err.message}`);
        console.error('Error starting interview:', err);
        endSession(false);
    }
  }, [user, toast, router, endSession, isMuted, isInterviewing]);
  
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
            <AIPanel isInterviewing={isInterviewing} />
             {!isInterviewing && (status.toLowerCase().includes('kathy') || status.toLowerCase().includes('ready')) && (
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
        {isInterviewing && (
          <ControlBar 
              onMuteToggle={toggleMute}
              onVideoToggle={toggleVideo}
              onEndCall={() => endSession()}
              isMuted={isMuted}
              isVideoOn={isVideoOn}
              isSessionLive={isInterviewing}
          />
        )}
    </div>
  );
}
