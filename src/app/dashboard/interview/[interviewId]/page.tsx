
'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, Video, Phone, Bot, User, MessageSquare, ChevronLeft, Loader2, Keyboard, Headphones, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { InterviewState } from '@/lib/interview-types';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { addActivity, getUserData } from '@/lib/firebase-service';
import type { InterviewActivity, UserData } from '@/lib/types';


type SessionStatus = 'idle' | 'connecting' | 'speaking' | 'ready' | 'listening' | 'processing' | 'ending' | 'error';
type TranscriptEntry = {
    speaker: 'user' | 'ai';
    text: string;
};

function InterviewPageContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const interviewId = params.interviewId as string;
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [userData, setUserData] = useState<UserData | null>(null);
    const [status, setStatus] = useState<SessionStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
    
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (user) {
            getUserData(user.uid).then(setUserData);
        }
    }, [user]);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);
    
    const endSession = useCallback(async () => {
        setStatus('ending');
    
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.src = '';
        }

        if (user && interviewState && transcript.length > 0) {
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcript,
                feedback: "Feedback will be generated on the results page.",
                details: {
                    topic: interviewState.topic,
                    role: interviewState.role,
                    level: interviewState.level,
                    company: interviewState.company,
                }
            };
            
            // Save the data first before redirecting.
            await addActivity(user.uid, finalActivity);

            // Don't redirect for icebreaker, just go to dashboard.
            if (interviewState.topic === 'Icebreaker Introduction') {
                toast({ title: "Thank You!", description: "Your profile has been updated with your information." });
                router.push('/dashboard/arena');
            } else {
                 router.push(`/dashboard/interview/${interviewId}/results`);
            }

        } else {
            // If something went wrong or the interview was empty, just go to the dashboard
            router.push('/dashboard');
        }
    
      }, [user, transcript, interviewState, interviewId, router, toast]);


    const processAndRespond = useCallback(async (state: InterviewState) => {
        if (!state || !user) return;
        
        setStatus('speaking');
        try {
            const isIcebreaker = state.topic === 'Icebreaker Introduction';
            let aiText, newState;
            
            if (isIcebreaker) {
                const icebreakerResponse = await conductIcebreakerInterview(user.uid, state);
                aiText = icebreakerResponse.response;
                newState = icebreakerResponse.newState;
            } else {
                const standardResponse = await generateInterviewResponse(state);
                aiText = standardResponse.response;
                newState = standardResponse.newState;
            }
          
          setTranscript(prev => [...prev, { speaker: 'ai', text: aiText }]);
          setInterviewState(newState);
          
          const { audioDataUri } = await textToSpeech({ text: aiText, voice: 'aura-hera-en' });
          
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
          }
    
          const audio = audioPlayerRef.current;
          const onAudioEnd = () => {
            if(newState.isComplete) {
               setTimeout(() => {
                endSession();
               }, 2000);
            } else {
              setStatus('ready');
            }
            audio?.removeEventListener('ended', onAudioEnd);
          };
          audio?.addEventListener('ended', onAudioEnd);
    
        } catch (error) {
          console.error("Error processing AI response:", error);
          toast({ title: "AI Error", description: "Could not get a response from the AI. Please try again.", variant: "destructive"});
          setStatus('ready');
        }
    }, [toast, endSession, user]);
    
    // This is now called from the instructions page. The interview itself doesn't need to fetch its own details.
    const startSession = async (initialState: InterviewState) => {
        if(!initialState) return;
        setStatus('connecting');
        setInterviewState(initialState);
        setTranscript([]);
        await processAndRespond(initialState);
    };

    // Push-to-talk handlers
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space' && !event.repeat && status === 'ready') {
            event.preventDefault();
            setStatus('listening');
            audioChunksRef.current = [];
            mediaRecorderRef.current?.start();
        }
    }, [status]);

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space' && status === 'listening') {
            event.preventDefault();
            setStatus('processing');
            mediaRecorderRef.current?.stop();
        }
    }, [status]);

    useEffect(() => {
        // Automatically start the session when the component mounts and has user data
        if (userData) {
            const initialState: InterviewState = {
                interviewId,
                topic: searchParams.get('topic') || 'general',
                level: searchParams.get('level') || 'entry-level',
                role: searchParams.get('role') || 'Software Engineer',
                company: searchParams.get('company') || undefined,
                history: [],
                isComplete: false,
            };
            startSession(initialState);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData, interviewId, searchParams]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);


    // Initialize Media Recorder
    useEffect(() => {
        const initializeRecorder = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = recorder;
    
            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };
            
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size < 1000) { // Ignore very short recordings
                    setStatus('ready');
                    return;
                }
    
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    try {
                        const { transcript: userTranscript } = await speechToText({ audioDataUri: base64Audio });
                        if (userTranscript && interviewState) {
                            setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);
                            const newHistory = [...interviewState.history, { role: 'user', content: userTranscript }];
                            const newState = { ...interviewState, history: newHistory };
                            setInterviewState(newState);
                            processAndRespond(newState);
                        } else {
                            toast({ title: "Couldn't hear you", description: "The AI didn't catch that. Please try speaking again.", variant: "destructive"});
                            setStatus('ready');
                        }
                    } catch (err) {
                        console.error("Transcription error:", err);
                        toast({ title: "Transcription Error", description: "Could not understand audio. Please try again.", variant: "destructive"});
                        setStatus('ready');
                    }
                };
            };
    
          } catch (error) {
            console.error("Failed to get media devices:", error);
            toast({ title: "Microphone Error", description: "Could not access your microphone.", variant: "destructive"});
          }
        };
        initializeRecorder();
    }, [interviewState, toast, processAndRespond]);

    const getStatusIndicator = () => {
        const baseClasses = "flex items-center justify-center gap-2 p-3 font-semibold text-sm transition-all duration-300";
        switch (status) {
            case 'idle': return { text: "Preparing Session...", className: "bg-muted text-muted-foreground", icon: <Loader2 className="animate-spin"/> };
            case 'connecting': return { text: "Connecting...", className: "bg-yellow-500/10 text-yellow-500", icon: <Loader2 className="animate-spin"/> };
            case 'speaking': return { text: "AI is Speaking", className: "bg-blue-500/10 text-blue-500", icon: <Headphones className="animate-pulse"/> };
            case 'ready': return { text: <><Keyboard className="h-5 w-5 mr-1"/> Hold <kbd className="mx-1 px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Space</kbd> to Speak</>, className: "bg-green-500/10 text-green-500", icon: null };
            case 'listening': return { text: "Listening...", className: "bg-green-500/10 text-green-500 animate-pulse", icon: <Mic/> };
            case 'processing': return { text: "Processing...", className: "bg-yellow-500/10 text-yellow-500", icon: <Loader2 className="animate-spin"/> };
            case 'ending': return { text: "Interview Over. Redirecting...", className: "bg-red-500/10 text-red-500", icon: <CheckCircle/> };
            case 'error': return { text: "Error", className: "bg-red-500/10 text-red-500", icon: <AlertTriangle/> };
            default: return { text: "Idle", className: "bg-muted text-muted-foreground", icon: null };
        }
    }
    const { text, className: statusClassName, icon: statusIcon } = getStatusIndicator();

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <audio ref={audioPlayerRef} hidden />
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
            </Button>
            <div className="text-center">
                <h1 className="text-lg font-semibold">{interviewState?.topic || 'Interview'}</h1>
                <p className="text-sm text-muted-foreground">AI Interviewer: Alex</p>
            </div>
            <div className="w-10"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 min-h-0">
            {/* Video Feed */}
            <div className="lg:col-span-2 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center border">
                {status === 'idle' || status === 'connecting' ? (
                     <div className="text-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin"/>
                        <p className="mt-4 text-muted-foreground">Preparing your session...</p>
                     </div>
                ) : (
                    <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <div className={cn("relative w-40 h-40 rounded-full transition-all duration-500",
                            (status === 'speaking' || status === 'connecting') && "animate-pulse"
                        )}>
                            <Image src="/popup.png" alt="AI Interviewer" layout="fill" className="rounded-full object-cover" data-ai-hint="abstract female person"/>
                            <div className={cn(
                                "absolute inset-0 rounded-full",
                                (status === 'speaking' || status === 'connecting') ? "shadow-[0_0_40px_10px] shadow-primary/60" : "shadow-[0_0_20px_5px] shadow-primary/30",
                                "transition-all duration-500"
                            )}></div>
                        </div>
                        <p className="text-muted-foreground mt-4 text-lg">{status === 'speaking' ? 'AI Interviewer is speaking...' : 'AI Interviewer'}</p>
                    </div>

                    <div className="absolute bottom-6 right-6 w-1/4 max-w-[200px] aspect-video bg-black/80 rounded-lg border-2 border-primary shadow-lg flex items-center justify-center">
                        <div className="text-center text-white">
                            <User className="w-8 h-8 mx-auto" />
                            <p className="text-sm mt-1">You</p>
                        </div>
                    </div>
                    </>
                )}
            </div>

            {/* Transcript & Controls */}
            <div className="flex flex-col gap-4 min-h-0">
                <Card className="flex-grow flex flex-col min-h-0">
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2"><MessageSquare/> Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto pr-2">
                         <div className="space-y-4">
                            {transcript.map((entry, index) => (
                                <div key={index} className={cn("flex items-start gap-3", entry.speaker === 'user' ? 'justify-end' : 'justify-start')}>
                                    {entry.speaker === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><Bot className="w-5 h-5"/></div>}
                                    <div className={cn("rounded-lg px-4 py-2 max-w-[80%]", entry.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-secondary')}>
                                         <p className="text-sm font-semibold">{entry.speaker === 'ai' ? 'Alex (AI)' : 'You'}</p>
                                        <p className="text-sm">{entry.text}</p>
                                    </div>
                                    {entry.speaker === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><User className="w-5 h-5"/></div>}
                                </div>
                            ))}
                        </div>
                        <div ref={transcriptEndRef} />
                    </CardContent>
                     <div className={cn("flex items-center justify-center gap-2 p-3 font-semibold text-sm transition-all duration-300 border-t", statusClassName)}>
                        {statusIcon}
                        <span>{text}</span>
                    </div>
                </Card>
            </div>
        </main>

        {/* Footer Controls */}
        <footer className="flex-shrink-0 flex justify-center items-center gap-4 py-4 border-t">
            <Button variant='secondary' size="icon" className="rounded-full h-14 w-14">
                <Mic className="h-6 w-6" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full h-14 w-14">
                <Video className="h-6 w-6" />
            </Button>
            <Button variant="destructive" size="icon" className="rounded-full h-16 w-16" onClick={endSession}>
                <Phone className="h-7 w-7" />
            </Button>
        </footer>
    </div>
  );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>Preparing Interview...</p>
                </div>
            </div>
        }>
            <InterviewPageContent />
        </Suspense>
    )
}
