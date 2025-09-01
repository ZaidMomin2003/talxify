
'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { MeetingProvider, useMeeting, useParticipant } from '@videosdk.live/react-sdk';
import { generateVideoSDKToken } from '@/app/actions/videosdk';
import { getAssemblyAiToken } from '@/app/actions/assemblyai';
import { textToSpeechWithGoogle } from '@/ai/flows/google-tts';
import { RealtimeTranscriber, Transcript } from 'assemblyai';
import type { InterviewState } from '@/lib/interview-types';
import { addActivity } from '@/lib/firebase-service';
import { InterviewActivity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, BrainCircuit, User, Bot, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


function Controls() {
  const { leave, toggleMic, toggleWebcam, localParticipant } = useMeeting();
  const { micOn, webcamOn } = localParticipant;

  return (
    <div className="flex gap-4">
      <Button onClick={() => toggleMic()} variant={micOn ? 'secondary' : 'destructive'} size="icon" className="rounded-full h-12 w-12">
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button onClick={() => toggleWebcam()} variant={webcamOn ? 'secondary' : 'destructive'} size="icon" className="rounded-full h-12 w-12">
        {webcamOn ? <Video /> : <VideoOff />}
      </Button>
      <Button onClick={() => leave()} variant="destructive" size="icon" className="rounded-full h-12 w-12">
        <PhoneOff />
      </Button>
    </div>
  );
}

function ParticipantView({ participantId }: { participantId: string }) {
  const { webcamStream, webcamOn, displayName } = useParticipant(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && webcamStream) {
        videoRef.current.srcObject = webcamStream;
        videoRef.current.play().catch(e => console.error("Video play failed", e));
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [webcamStream, webcamOn]);

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative group">
      {webcamOn ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <User className="w-24 h-24 text-muted-foreground" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
        {displayName}
      </div>
    </div>
  );
}

function AIAvatar({ status, lastAIText }: { status: string, lastAIText: string }) {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden relative flex flex-col items-center justify-center text-center">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background/80 to-background blur-sm"></div>
       <div className="relative z-10 p-4 space-y-4">
            <div className={cn("mx-auto h-24 w-24 rounded-full border-2 flex items-center justify-center", status === 'speaking' ? 'border-primary animate-pulse' : 'border-border')}>
                <BrainCircuit className="w-12 h-12 text-primary"/>
            </div>
            <h2 className="text-xl font-bold">AI Interviewer</h2>
            <Badge variant={status === 'speaking' ? 'default' : 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
            <p className="text-muted-foreground text-sm h-12 overflow-hidden">{lastAIText}</p>
       </div>
    </div>
  );
}

function InterviewRoom() {
  const { localParticipant, leave } = useMeeting();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [interviewStatus, setInterviewStatus] = useState<'initializing' | 'in_progress' | 'error' | 'finished'>('initializing');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState<{ speaker: 'user' | 'ai', text: string }[]>([]);
  const [finalTranscript, setFinalTranscript] = useState<string>('');

  const transcriberRef = useRef<RealtimeTranscriber | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
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
    setAgentStatus('processing');

    try {
        const res = await fetch('/api/interview-agent/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: interviewStateRef.current, message: userText || '' }),
        });

        if (!res.ok) throw new Error('Failed to get AI response');
        
        const { text: aiText, newState } = await res.json();
        interviewStateRef.current = newState;
        
        setTranscript(prev => [...prev, { speaker: 'ai', text: aiText }]);
        
        setAgentStatus('speaking');
        const ttsResult = await textToSpeechWithGoogle({ text: aiText });
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = ttsResult.audioDataUri;
            audioPlayerRef.current.play();
            audioPlayerRef.current.onended = () => {
                if (newState.isComplete) {
                  setInterviewStatus('finished');
                  leave();
                } else {
                  setAgentStatus('idle');
                }
            };
        }
    } catch (error) {
        console.error("Error processing AI response:", error);
        toast({ title: "Agent Error", description: "An error occurred with the agent.", variant: "destructive" });
        setInterviewStatus('error');
    }
  }, [toast, leave]);

  useEffect(() => {
    async function setupAgent() {
        if (!user) return;
        setInterviewStatus('initializing');
        
        try {
            const token = await getAssemblyAiToken();
            const assemblyai = new RealtimeTranscriber({ token, sampleRate: 16000 });

            assemblyai.on('open', () => {
                // Initial greeting from AI
                processAIResponse();
            });

            assemblyai.on('transcript', (transcript: Transcript) => {
                if (transcript.text) {
                    setFinalTranscript(transcript.text);
                }
                if (transcript.message_type === 'FinalTranscript' && transcript.text.trim()) {
                    setTranscript(prev => [...prev, { speaker: 'user', text: transcript.text }]);
                    processAIResponse(transcript.text);
                }
            });

            assemblyai.on('error', (error) => {
                console.error('AssemblyAI Error:', error);
                setInterviewStatus('error');
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            assemblyai.stream(stream);
            transcriberRef.current = assemblyai;
            setInterviewStatus('in_progress');

        } catch (error) {
            console.error("Setup failed:", error);
            toast({ title: "Setup Failed", description: "Could not initialize interview. Check microphone permissions.", variant: 'destructive' });
            setInterviewStatus('error');
        }
    }
    setupAgent();
    
    return () => {
        transcriberRef.current?.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (interviewStatus === 'finished' && user) {
        const finalActivity: InterviewActivity = {
            id: interviewStateRef.current.interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcript,
            feedback: "Feedback will be generated on the results page.",
            details: interviewStateRef.current
        };
        addActivity(user.uid, finalActivity).then(() => {
            router.push(`/dashboard/interview/${finalActivity.id}/results`);
        });
    }
  }, [interviewStatus, transcript, user, router]);


  if (interviewStatus === 'initializing') {
    return <div className="h-full w-full flex flex-col items-center justify-center gap-4"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p>Initializing Interview...</p></div>;
  }
   if (interviewStatus === 'error') {
    return <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-destructive"><AlertTriangle className="h-12 w-12" /><p>An error occurred. Please try again.</p><Button onClick={() => window.location.reload()}>Reload</Button></div>;
  }

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4">
        <audio ref={audioPlayerRef} hidden />
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParticipantView participantId={localParticipant.id} />
            <AIAvatar status={agentStatus} lastAIText={transcript.filter(t => t.speaker === 'ai').slice(-1)[0]?.text || 'Waiting for AI...'}/>
        </div>
        <Card className="w-full h-28 p-4 overflow-y-auto">
            <p className="text-muted-foreground">
                {transcript.map((t, i) => (
                    <span key={i} className={cn(t.speaker === 'ai' ? 'text-primary' : 'text-foreground')}>
                        <span className="font-bold">{t.speaker === 'ai' ? 'AI: ' : 'You: '}</span>
                        {t.text} &nbsp;
                    </span>
                ))}
                 <span className="text-muted-foreground/50 italic">{finalTranscript}</span>
            </p>
        </Card>
        <div className="flex justify-center">
            <Controls />
        </div>
    </div>
  );
}


function DraftInterviewComponent() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  const fetchToken = useCallback(async () => {
    try {
      const sdkToken = await generateVideoSDKToken();
      setToken(sdkToken);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  if (loading || !token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId: params.interviewId as string,
        micEnabled: true,
        webcamEnabled: true,
        name: 'User',
      }}
      token={token}
    >
      <InterviewRoom />
    </MeetingProvider>
  );
}


export default function DraftPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <DraftInterviewComponent />
        </Suspense>
    )
}
