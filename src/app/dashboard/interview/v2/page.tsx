
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Video, Phone, Bot, User, MessageSquare, ChevronLeft, Loader2, Keyboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { InterviewState } from '@/lib/interview-types';

type SessionStatus = 'idle' | 'connecting' | 'speaking' | 'ready' | 'listening' | 'processing' | 'ending' | 'error';
type TranscriptEntry = {
    speaker: 'user' | 'ai';
    text: string;
};

export default function InterviewV2Page() {
    const router = useRouter();
    const { toast } = useToast();

    const [status, setStatus] = useState<SessionStatus>('idle');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
    
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript, interimTranscript]);
    
    const processAndRespond = useCallback(async (state: InterviewState) => {
        if (!state) return;
        
        setStatus('speaking');
        try {
          const { response: aiText, newState } = await generateInterviewResponse(state);
          
          setTranscript(prev => [...prev, { speaker: 'ai', text: aiText }]);
          setInterviewState(newState);
          
          const { audioDataUri } = await textToSpeech({ text: aiText });
          
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
          }
    
          const audio = audioPlayerRef.current;
          const onAudioEnd = () => {
            if(newState.isComplete) {
              setStatus('ending');
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
    }, [toast]);
    
    const startSession = async () => {
        setStatus('connecting');
        
        const initialState: InterviewState = {
            interviewId: `interview_${Date.now()}`,
            topic: 'System Design', // Example topic
            level: 'Senior',
            role: 'Software Engineer',
            company: 'Google',
            history: [],
            isComplete: false,
        };
        
        setInterviewState(initialState);
        setTranscript([]);
        await processAndRespond(initialState);
    };

    // Push-to-talk handlers
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.code === 'Space' && !event.repeat && status === 'ready') {
            event.preventDefault();
            setStatus('listening');
            setInterimTranscript("Listening...");
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
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
    
            recorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };
            
            recorder.onstop = async () => {
                setInterimTranscript("");
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
        switch (status) {
            case 'idle': return <div className="flex items-center gap-2 text-blue-400">Ready to Start</div>;
            case 'connecting': return <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin"/>Connecting...</div>;
            case 'speaking': return <div className="flex items-center gap-2 text-blue-400"><Bot className="w-4 h-4" />AI Speaking...</div>;
            case 'ready': return <div className="flex items-center justify-center gap-2 text-green-400"><Keyboard className="h-5 w-5" /><span>Hold <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Space</kbd> to speak</span></div>;
            case 'listening': return <div className="flex items-center gap-2 text-green-400 animate-pulse"><Mic className="w-4 h-4"/>Listening...</div>;
            case 'processing': return <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin"/>Processing...</div>;
            case 'ending': return <div className="flex items-center gap-2 text-red-400"><Loader2 className="w-4 h-4 animate-spin"/>Ending Session...</div>;
            case 'error': return <div className="flex items-center gap-2 text-red-400">Error</div>;
            default: return null;
        }
    }

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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    {status === 'speaking' || status === 'connecting' ? 
                        <Bot className="w-24 h-24 text-primary animate-pulse"/> :
                        <Bot className="w-24 h-24 text-primary/30"/>
                    }
                    <p className="text-muted-foreground mt-4 text-lg">{status === 'speaking' ? 'AI Interviewer is speaking...' : 'AI Interviewer'}</p>
                </div>

                <div className="absolute bottom-6 right-6 w-1/4 max-w-[200px] aspect-video bg-black/80 rounded-lg border-2 border-primary shadow-lg flex items-center justify-center">
                    <div className="text-center text-white">
                        <User className="w-8 h-8 mx-auto" />
                        <p className="text-sm mt-1">You</p>
                    </div>
                </div>
            </div>

            {/* Transcript & Controls */}
            <div className="flex flex-col gap-4 min-h-0">
                <Card className="flex-grow flex flex-col min-h-0">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                           <CardTitle className="flex items-center gap-2"><MessageSquare/> Transcript</CardTitle>
                           <div className="text-xs font-mono">{getStatusIndicator()}</div>
                        </div>
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
                            {interimTranscript && (
                                <div className="flex items-start gap-3 justify-end opacity-70">
                                    <div className="rounded-lg px-4 py-2 max-w-[80%] bg-blue-600/80 text-white">
                                        <p className="text-sm font-semibold">You</p>
                                        <p className="text-sm italic">{interimTranscript}</p>
                                    </div>
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><User className="w-5 h-5"/></div>
                                </div>
                            )}
                        </div>
                        <div ref={transcriptEndRef} />
                    </CardContent>
                </Card>
            </div>
        </main>

        {/* Footer Controls */}
        <footer className="flex-shrink-0 flex justify-center items-center gap-4 py-4 border-t">
             {status === 'idle' ? (
                <Button size="lg" onClick={startSession}>Start Interview</Button>
             ) : (
                <>
                    <Button variant='secondary' size="icon" className="rounded-full h-14 w-14">
                        <Mic className="h-6 w-6" />
                    </Button>
                     <Button variant="secondary" size="icon" className="rounded-full h-14 w-14">
                        <Video className="h-6 w-6" />
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-full h-16 w-16">
                        <Phone className="h-7 w-7" />
                    </Button>
                </>
             )}
        </footer>
    </div>
  );
}

    