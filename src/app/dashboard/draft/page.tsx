

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, BrainCircuit, Loader2, Play } from 'lucide-react';
import { addActivity, checkAndIncrementUsage } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry, UsageType } from '@/lib/types';
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
        <span className={cn("w-2 h-2 rounded-full", status.toLowerCase().includes('your turn') ? 'bg-red-500 animate-pulse' : (status.toLowerCase().includes('error') ? 'bg-destructive' : 'bg-yellow-500'))} />
        <span>{status}</span>
        {elapsedTime > 0 && <span className="font-mono">{formatTime(elapsedTime)}</span>}
      </div>
    </div>
  );
};

const AIPanel = ({ isInterviewing }: { isInterviewing: boolean; }) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-muted/20 rounded-2xl overflow-hidden border">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-500", isInterviewing ? 'scale-100' : 'scale-90')}>
        <div className={cn("absolute inset-0 rounded-full bg-primary/10", isInterviewing && 'animate-pulse duration-1000')} />
        <div className={cn("absolute inset-2 rounded-full bg-primary/20", isInterviewing && 'animate-pulse duration-1500')} />
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
          <VideoOff className="w-8 h-8" />
          <p className="text-sm mt-2">Camera is off</p>
        </div>
      )}
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


export default function DraftPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [session, setSession] = useState<Session | null>(null);

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userVideoEl = useRef<HTMLVideoElement>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);

  const nextAudioStartTimeRef = useRef(0);
  const audioBufferSources = useRef(new Set<AudioBufferSourceNode>());
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // This effect runs only ONCE on component mount to initialize everything.

    // 1. Initialize Audio Contexts
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
    outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
    if (outputAudioContextRef.current) {
      outputGainNodeRef.current = outputAudioContextRef.current.createGain();
      outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);
    }

    // 2. Define session functions
    const playAudio = async (base64Audio: string) => {
      const audioContext = outputAudioContextRef.current;
      const gainNode = outputGainNodeRef.current;
      if (!audioContext || !gainNode) return;

      if (audioContext.state === 'suspended') await audioContext.resume();

      const nextStartTime = Math.max(nextAudioStartTimeRef.current, audioContext.currentTime);

      try {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.onended = () => audioBufferSources.current.delete(source);
        source.start(nextStartTime);
        nextAudioStartTimeRef.current = nextStartTime + audioBuffer.duration;
        audioBufferSources.current.add(source);
      } catch (e) {
        console.error("Error playing audio:", e);
      }
    };

    const stopAllPlayback = () => {
      for (const source of audioBufferSources.current.values()) {
        source.stop();
      }
      audioBufferSources.current.clear();
      nextAudioStartTimeRef.current = 0;
    };

    const initSession = async () => {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        setStatus("Error: Gemini API Key not configured.");
        return;
      }
      const client = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const topic = 'general software engineering';
      const role = 'Software Engineer';
      const company = undefined;

      let systemInstruction = `You are Mark, an expert technical interviewer at Talxify. You are interviewing a candidate for the role of "${role}" on the topic of "${topic}". Start with a friendly introduction, then ask your first question. Always wait for the user to finish speaking. Your speech should be concise.`;
      if (company) {
        systemInstruction += ` The candidate is interested in ${company}, so you can tailor behavioral questions to their leadership principles if applicable.`;
      }

      setStatus('Connecting to AI...');

      try {
        const newSession = await client.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => setStatus('Ready to start'),
            onmessage: (message: LiveServerMessage) => {
              if (message.serverContent?.interrupted) stopAllPlayback();

              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData;
              if (audio?.data) playAudio(audio.data as string);

              if (message.serverContent?.outputTranscription) {
                const newText = message.serverContent.outputTranscription.text;
                setStatus("Mark is speaking...");
                if ((message.serverContent.outputTranscription as any).partial === false) {
                  transcriptRef.current.push({ speaker: 'ai', text: newText || '' });
                }
              }
              if (message.serverContent?.inputTranscription) {
                const newText = message.serverContent.inputTranscription.text;
                setStatus("🔴 Your turn... Speak now.");
                if ((message.serverContent.inputTranscription as any).partial === false) {
                  transcriptRef.current.push({ speaker: 'user', text: newText || '' });
                }
              }
              if (message.serverContent?.turnComplete) {
                setStatus("🔴 Your turn... Speak now.");
              }
            },
            onerror: (e) => {
              let errorMessage = 'An unknown error occurred';
              if (e instanceof CloseEvent) errorMessage = `Session closed unexpectedly. Code: ${e.code}, Reason: ${e.reason}`;
              else if (e instanceof Error) errorMessage = e.message;
              else errorMessage = JSON.stringify(e);
              setStatus(`Error: ${errorMessage}`);
              console.error("Session Error:", e);
            },
            onclose: (e) => setStatus('Session Closed: ' + e.reason),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: systemInstruction,
            contextWindowCompression: { slidingWindow: {} }
          },
        });
        setSession(newSession); // <-- Set the session in state once ready
      } catch (e: any) {
        console.error("Connection to Gemini failed:", e);
        setStatus(`Error: ${e.message}`);
      }
    };

    initSession();

    // 3. Cleanup function
    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      session?.close();
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- Empty dependency array ensures this runs only once.


  const startInterview = useCallback(async () => {
    if (isInterviewing || !session) return; // Prevent multiple starts
    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to start an interview.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    const usage = await checkAndIncrementUsage(user.uid, 'interview');
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

      setStatus('Microphone access granted. Connecting...');

      const inputCtx = inputAudioContextRef.current!;
      sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);

      const bufferSize = 4096;
      scriptProcessorNodeRef.current = inputCtx.createScriptProcessor(bufferSize, 1, 1);

      scriptProcessorNodeRef.current.onaudioprocess = (event) => {
        if (session) { // Check if session is valid before sending
          const pcmData = event.inputBuffer.getChannelData(0);
          session.sendRealtimeInput({ media: createBlob(pcmData) });
        }
      };

      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputCtx.destination);

      setIsInterviewing(true);
      setElapsedTime(0);
      timerIntervalRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);

      setStatus("🔴 Your turn... Speak now.");

    } catch (err: any) {
      setStatus(`Error starting interview: ${err.message}`);
      console.error('Error starting interview:', err);
    }
  }, [session, user, toast, router, isInterviewing]);

  const endSession = useCallback(async (shouldNavigate = true) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsInterviewing(false);
    if (shouldNavigate) setStatus('Interview ended. Saving transcript...');

    session?.close();
    setSession(null);

    scriptProcessorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    if (userVideoEl.current) userVideoEl.current.srcObject = null;

    if (shouldNavigate && user) {
      const interviewId = 'draft_interview_' + Date.now();
      const activity: InterviewActivity = {
        id: interviewId,
        type: 'interview',
        timestamp: new Date().toISOString(),
        transcript: transcriptRef.current,
        feedback: "Feedback has not been generated for this interview.",
        details: {
          topic: 'Draft Session',
        }
      };

      try {
        await addActivity(user.uid, activity);
        router.push(`/dashboard/interview/${interviewId}/transcript`);
      } catch (error: any) {
        console.error("Failed to save activity:", error);
        toast({
          title: "Could not save interview results",
          description: `There was an error saving your interview: ${error.message}. Please check your dashboard later.`,
          variant: "destructive"
        });
        router.push('/dashboard');
      }
    }
  }, [user, router, toast, session]);


  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !nextMuted; });
    }
  }

  const toggleVideo = () => {
    const nextVideoOn = !isVideoOn;
    setIsVideoOn(nextVideoOn);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => { track.enabled = nextVideoOn; });
    }
  }

  return (
    <div className="relative flex flex-col h-screen w-full p-4 sm:p-6 bg-background">
      <div className="absolute inset-0 thermal-gradient-bg z-0" />
      <InterviewHeader status={status} elapsedTime={elapsedTime} />
      <main className="flex-1 relative z-10 flex items-center justify-center">
        <AIPanel isInterviewing={isInterviewing} />
        {!isInterviewing && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            <Button onClick={startInterview} size="lg" className="h-16 rounded-full px-8" disabled={!session || isInterviewing || status !== 'Ready to start'}>
              {!session || status !== 'Ready to start' ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Play className="mr-3 h-6 w-6" />}
              {!session ? 'Connecting...' : (status !== 'Ready to start' ? status : 'Start Interview')}
            </Button>
          </div>
        )}
      </main>
      <UserVideo videoRef={userVideoEl} isVideoOn={isVideoOn} />
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

