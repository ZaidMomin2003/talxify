
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, BrainCircuit, Loader2 } from 'lucide-react';
import { addActivity, updateUserFromIcebreaker } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry, IcebreakerData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '@/lib/utils';
import { getGeminiApiKey } from '@/app/actions/gemini';

// --- Sub-components for better structure ---

const InterviewHeader = ({ status, elapsedTime }: { status: string; elapsedTime: number }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-4 bg-background/50 border rounded-full px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
            <span className={cn("w-2 h-2 rounded-full", status.toLowerCase().includes('recording') ? 'bg-red-500 animate-pulse' : 'bg-yellow-500')}/>
            <span>{status}</span>
            {elapsedTime > 0 && <span className="font-mono">{formatTime(elapsedTime)}</span>}
        </div>
    </div>
  );
};

const AIPanel = ({ isInterviewing }: { isInterviewing: boolean }) => {
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

const CaptionDisplay = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <div className="absolute bottom-28 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
      <div className="bg-background/60 backdrop-blur-md rounded-lg p-4 text-center text-foreground text-lg shadow-lg border">
        {text}
      </div>
    </div>
  );
};

const ControlBar = ({ onMuteToggle, onVideoToggle, onEndCall, isMuted, isVideoOn, isRecording }: {
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOn: boolean;
  isRecording: boolean;
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 rounded-full bg-background/50 border p-3 backdrop-blur-md">
      <Button onClick={onMuteToggle} size="icon" className="w-14 h-14 rounded-full" variant={isMuted ? 'destructive' : 'secondary'}>
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      <Button onClick={onVideoToggle} size="icon" className="w-14 h-14 rounded-full" variant={!isVideoOn ? 'destructive' : 'secondary'}>
        {isVideoOn ? <Video /> : <VideoOff />}
      </Button>
      <Button onClick={onEndCall} size="icon" className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white" disabled={!isRecording}>
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

  const [isInitializing, setIsInitializing] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [currentTranscription, setCurrentTranscription] = useState('');
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
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const updateStatus = (msg: string) => { setStatus(msg); setError(''); };
  const updateError = (msg: string) => { setError(msg); console.error(msg); };
  
   useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (isRecording) {
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isRecording]);


  const initSession = useCallback(async () => {
    if (!clientRef.current) return;
    setIsInitializing(true);
    updateStatus('Initializing Session...');

    const topic = searchParams.get('topic') || 'general software engineering';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company');

    let systemInstruction = `You are Kathy, an expert technical interviewer at Talxify. You are interviewing a candidate for the role of "${role}" on the topic of "${topic}". Your tone must be professional, encouraging, and clear. Start with a friendly introduction, then ask your first question. Always wait for the user to finish speaking.`;
    
    if (company) {
        systemInstruction += ` The candidate is interested in ${company}, so you can tailor behavioral questions to their leadership principles if applicable.`;
    }

     if (topic === 'Icebreaker Introduction') {
        systemInstruction = `You are Kathy, a friendly career coach at Talxify. Your goal is a short, 2-minute icebreaker. Start warmly. Ask about their name, city, college, skills, and hobbies. Keep it light and encouraging. After getting this info, you MUST respond with ONLY a JSON object in this exact format: { "isIcebreaker": true, "name": "User's Name", "city": "User's City", "college": "User's College", "skills": ["skill1"], "hobbies": ["hobby1"] }. Wrap this JSON object in <JSON_DATA> tags. This is your final response.`;
    }
    
    try {
      sessionRef.current = await clientRef.current.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog-001',
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction,
        },
        callbacks: {
          onopen: () => {
            updateStatus('Session Opened. Ready for interview.');
            setIsInitializing(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            if (audio) {
                const outputCtx = outputAudioContextRef.current!;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(audio.data), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                audioSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
                for (const source of audioSourcesRef.current.values()) {
                    source.stop();
                    audioSourcesRef.current.delete(source);
                }
                nextStartTimeRef.current = 0;
            }

            let userText = message.serverContent?.inputTranscription?.text || '';
            let aiText = message.serverContent?.outputTranscription?.text || '';

            if (userText) setCurrentTranscription(userText);
            if (aiText) setCurrentTranscription(aiText);

            if (message.serverContent?.turnComplete) {
              if (userText) transcriptRef.current.push({ speaker: 'user', text: userText });
              if (aiText) {
                transcriptRef.current.push({ speaker: 'ai', text: aiText });
                 const jsonMatch = aiText.match(/<JSON_DATA>(.*?)<\/JSON_DATA>/s);
                 if (jsonMatch && jsonMatch[1]) {
                    try {
                        const icebreakerData: IcebreakerData = JSON.parse(jsonMatch[1]);
                        if (user && icebreakerData.isIcebreaker) {
                           await updateUserFromIcebreaker(user.uid, icebreakerData);
                           toast({ title: "Icebreaker Complete!", description: "Your profile has been updated."});
                        }
                    } catch (e) { console.error("Failed to parse icebreaker JSON", e); }
                }
              }
              setCurrentTranscription('');
            }
          },
          onerror: (e: ErrorEvent) => updateError(e.message),
          onclose: (e: CloseEvent) => {
            updateStatus('Session Closed: ' + e.reason);
            setIsRecording(false);
            setIsInitializing(false);
          },
        },
      });
      startRecording();
    } catch (e: any) {
      console.error(e);
      updateError(`Failed to initialize session: ${e.message}`);
      setIsInitializing(false);
    }
  }, [searchParams, toast, user]);


  useEffect(() => {
    let isMounted = true;
    async function setup() {
        try {
            const apiKey = await getGeminiApiKey();
            if (!apiKey) {
                updateError('GEMINI_API_KEY is not available.');
                setIsInitializing(false);
                return;
            }
            if (isMounted) {
                clientRef.current = new GoogleGenAI({ apiKey });
                inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                
                initSession();
            }
        } catch(e: any) {
             updateError(`Failed to set up Gemini Client: ${e.message}`);
             if (isMounted) setIsInitializing(false);
        }
    }
    
    setup();

    return () => {
      isMounted = false;
      stopRecording(false); // Stop recording without navigation
      sessionRef.current?.close();
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    if (isRecording) return;
    if (!inputAudioContextRef.current) { updateError("Input audio context not ready."); return; }
    await inputAudioContextRef.current.resume();
    updateStatus('Requesting device access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      if (userVideoEl.current) { userVideoEl.current.srcObject = stream; userVideoEl.current.play(); }

      updateStatus('Microphone access granted. Starting capture...');

      const inputCtx = inputAudioContextRef.current!;
      sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);
      
      const bufferSize = 256;
      scriptProcessorNodeRef.current = inputCtx.createScriptProcessor(bufferSize, 1, 1);
      
      scriptProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecording || isMuted || !sessionRef.current) return;
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const pcmData = inputBuffer.getChannelData(0);
        sessionRef.current.sendRealtimeInput({ media: createBlob(pcmData) });
      };

      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputCtx.destination);

      setIsRecording(true);
      updateStatus('🔴 Recording... Speak now.');
    } catch (err: any) {
      updateError(`Error starting recording: ${err.message}`);
      await stopRecording();
    }
  };

  const stopRecording = async (shouldNavigate = true) => {
    if (!isRecording && !mediaStreamRef.current) { 
        if (shouldNavigate) router.push('/dashboard'); 
        return; 
    }

    setIsRecording(false);
    if(shouldNavigate) updateStatus('Interview ended. Navigating to results...');

    if (scriptProcessorNodeRef.current && sourceNodeRef.current) {
      scriptProcessorNodeRef.current.disconnect();
      sourceNodeRef.current.disconnect();
    }
    scriptProcessorNodeRef.current = null;
    sourceNodeRef.current = null;

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    if (userVideoEl.current) { userVideoEl.current.srcObject = null; }

    sessionRef.current?.close();

    if (shouldNavigate && user) {
        const interviewId = params.interviewId as string;
        router.push(`/dashboard/interview/${interviewId}/results`);

        if (transcriptRef.current.length === 0) transcriptRef.current.push({ speaker: 'ai', text: 'Interview ended prematurely.' });
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
        
        addActivity(user.uid, activity).catch(error => {
            console.error("Failed to save activity in background:", error);
            toast({
                title: "Could not save interview results",
                description: "There was an issue saving your interview data.",
                variant: "destructive"
            });
        });
    }
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleVideo = () => {
    const nextVideoOn = !isVideoOn;
    setIsVideoOn(nextVideoOn);
     if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(track => { track.enabled = nextVideoOn; });
    }
  }

  if (isInitializing) {
     return (
       <div className="relative flex flex-col h-screen w-full p-4 sm:p-6 bg-background">
          <div className="absolute inset-0 thermal-gradient-bg z-0"/>
          <main className="flex-1 relative flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary"/>
              <p className="text-muted-foreground">{status}</p>
            </div>
          </main>
       </div>
     )
  }

  return (
    <div className="relative flex flex-col h-screen w-full p-4 sm:p-6 bg-background">
        <div className="absolute inset-0 thermal-gradient-bg z-0"/>
        <InterviewHeader status={error || status} elapsedTime={elapsedTime}/>
        <main className="flex-1 relative flex items-center justify-center">
            <AIPanel isInterviewing={isRecording} />
        </main>
        <UserVideo videoRef={userVideoEl} isVideoOn={isVideoOn} />
        <CaptionDisplay text={currentTranscription}/>
        <ControlBar 
            onMuteToggle={toggleMute}
            onVideoToggle={toggleVideo}
            onEndCall={() => stopRecording()}
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isRecording={isRecording}
        />
    </div>
  );
}
