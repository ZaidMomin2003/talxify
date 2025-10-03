
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, BrainCircuit } from 'lucide-react';
import { addActivity, updateUserFromIcebreaker } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry, IcebreakerData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { encode, decodeAudioData, createBlob } from '@/lib/utils';


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
            <span className={cn("w-2 h-2 rounded-full", status.includes('progress') ? 'bg-red-500 animate-pulse' : 'bg-yellow-500')}/>
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

const ControlBar = ({ onMuteToggle, onVideoToggle, onEndCall, isMuted, isVideoOn, isInterviewing }: {
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOn: boolean;
  isInterviewing: boolean;
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 rounded-full bg-background/50 border p-3 backdrop-blur-md">
      <Button onClick={onMuteToggle} size="icon" className="w-14 h-14 rounded-full" variant={isMuted ? 'destructive' : 'secondary'}>
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      <Button onClick={onVideoToggle} size="icon" className="w-14 h-14 rounded-full" variant={!isVideoOn ? 'destructive' : 'secondary'}>
        {isVideoOn ? <Video /> : <VideoOff />}
      </Button>
      <Button onClick={onEndCall} size="icon" className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white" disabled={!isInterviewing}>
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
  const [error, setError] = useState('');
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userVideoEl = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isInitializedRef = useRef(false);

  const updateStatus = (msg: string) => { setStatus(msg); setError(''); };
  const updateError = (msg: string) => { setError(msg); console.error(msg); };
  
   useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    const isSessionActive = isInterviewing && !status.toLowerCase().includes('closed') && !status.toLowerCase().includes('ended') && !error;
    
    if (isSessionActive) {
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [isInterviewing, status, error]);

  const playAudio = useCallback(async (base64EncodedAudioString: string) => {
    if (!outputAudioContextRef.current) return;
    await outputAudioContextRef.current.resume();
    const audioBuffer = await decodeAudioData(Buffer.from(base64EncodedAudioString, 'base64'), outputAudioContextRef.current, 24000, 1);
    const source = outputAudioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContextRef.current.destination);
    source.start();
  }, []);

  const initSession = useCallback(() => {
    const topic = searchParams.get('topic') || 'general software engineering';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company');

    let systemInstruction = `Your name is Kathy, you are an expert technical interviewer at Talxify.
    You are interviewing a candidate for the role of "${role}". The main topic for this interview is "${topic}".
    Your tone must be professional, encouraging, and clear.
    Start with a brief, friendly introduction and then begin the interview by asking your first question.
    Keep your questions relevant and your responses concise. Always wait for the user to finish speaking before you reply.
    `;

    if (company) {
        systemInstruction += ` The candidate is specifically interested in ${company}, so you can tailor behavioral questions to their leadership principles if applicable (e.g., STAR method for Amazon).`;
    }

     if (topic === 'Icebreaker Introduction') {
        systemInstruction = `Your name is Kathy, a friendly career coach at Talxify. Your goal is to conduct a short, 2-minute icebreaker session.
        Start by warmly welcoming the user.
        Ask them about their name, what city they are from, their college, their skills, and their hobbies.
        Keep the conversation light and encouraging.
        After gathering this information, respond with a JSON object containing the extracted data. The JSON object should follow this format:
        { "isIcebreaker": true, "name": "User's Name", "city": "User's City", "college": "User's College", "skills": ["skill1", "skill2"], "hobbies": ["hobby1", "hobby2"] }
        Wrap the JSON object within <JSON_DATA> tags. For example: <JSON_DATA>{"isIcebreaker": true, ...}</JSON_DATA>.
        Do not add any other text before or after the JSON data block. This is your final response.
        `;
    }
    
    updateStatus('Initializing session...');

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://talxify.space/api/gemini-live' 
      : 'ws://localhost:3001/api/gemini-live';

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'config', config: { systemInstruction } }));
    };

    socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
            case 'status':
                updateStatus(message.data);
                break;
            case 'audio':
                playAudio(message.data);
                break;
            case 'transcription':
                setCurrentTranscription(message.data);
                break;
            case 'turnComplete':
                 if (message.data.user) transcriptRef.current.push({ speaker: 'user', text: message.data.user });
                 if (message.data.ai) {
                     transcriptRef.current.push({ speaker: 'ai', text: message.data.ai });
                     const jsonMatch = message.data.ai.match(/<JSON_DATA>(.*?)<\/JSON_DATA>/);
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
                break;
            case 'error':
                updateError(message.data);
                break;
        }
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        updateError('WebSocket connection error.');
    };

    socket.onclose = () => {
        updateStatus('Session Closed.');
        setIsInterviewing(false);
    };

  }, [playAudio, searchParams, user, toast]);
  
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
    outputAudioContextRef.current.destination.channelCount = 1;
    
    startInterview();

    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      socketRef.current?.close();
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const startInterview = async () => {
    if (isInterviewing) return;
    if (!audioContextRef.current) { updateError("Audio context not ready."); return; }
    await audioContextRef.current.resume();
    updateStatus('Requesting device access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      if (userVideoEl.current) { userVideoEl.current.srcObject = stream; userVideoEl.current.play(); }
      
      const inputCtx = audioContextRef.current!;
      sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);
      const bufferSize = 4096;
      scriptProcessorNodeRef.current = inputCtx.createScriptProcessor(bufferSize, 1, 1);
      
      scriptProcessorNodeRef.current.onaudioprocess = (e) => {
        if (socketRef.current?.readyState === WebSocket.OPEN && isInterviewing && !isMuted) {
             const pcmData = e.inputBuffer.getChannelData(0);
             const blob = createBlob(pcmData);
             socketRef.current.send(JSON.stringify({ type: 'audio', data: blob.data }));
        }
      };
      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputCtx.destination);
      
      setIsInterviewing(true);
      updateStatus('Interview in progress...');
      initSession();
    } catch (err: any) {
      updateError(`Error starting interview: ${err.message}`);
      await endInterview();
    }
  };

  const endInterview = async () => {
    if (!isInterviewing && !mediaStreamRef.current) { router.push('/dashboard'); return; }

    setIsInterviewing(false);
    updateStatus('Interview ended. Navigating to results...');

    const interviewId = params.interviewId as string;
    router.push(`/dashboard/interview/${interviewId}/results`);

    scriptProcessorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    if (userVideoEl.current) { userVideoEl.current.srcObject = null; }

    socketRef.current?.close();

    if (user) {
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

  return (
    <div className="relative flex flex-col h-screen w-full p-4 sm:p-6 bg-background thermal-gradient-bg">
        <InterviewHeader status={error || status} elapsedTime={elapsedTime}/>
        <main className="flex-1 relative flex items-center justify-center">
            <AIPanel isInterviewing={isInterviewing} />
        </main>
        <UserVideo videoRef={userVideoEl} isVideoOn={isVideoOn} />
        <CaptionDisplay text={currentTranscription}/>
        <ControlBar 
            onMuteToggle={toggleMute}
            onVideoToggle={toggleVideo}
            onEndCall={endInterview}
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isInterviewing={isInterviewing}
        />
    </div>
  );
}

