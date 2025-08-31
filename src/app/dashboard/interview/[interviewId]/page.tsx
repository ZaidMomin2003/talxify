
'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Loader2, Mic, MicOff, Send, Bot, User, CornerDownLeft, Volume2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, StoredActivity } from '@/lib/types';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import type { InterviewState } from '@/lib/interview-types';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';

// --- Audio Recording Logic ---

const useAudioRecorder = (onStop: (audioBlob: Blob) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    onStop(audioBlob);
                    stream.getTracks().forEach(track => track.stop()); // Stop the microphone access
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                // You might want to show a toast or message to the user here
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return { isRecording, startRecording, stopRecording };
};


function InterviewPageComponent() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const interviewId = params.interviewId as string;
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSynthesizing, setIsSynthesizing] = useState(false);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [interviewState, setInterviewState] = useState<InterviewState>({
        interviewId: interviewId,
        topic: searchParams.get('topic') || 'General',
        level: searchParams.get('level') || 'entry-level',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [],
        isComplete: false,
    });
    
    const playAudio = (audioDataUri: string) => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }

    const processAndRespond = useCallback(async (text: string) => {
        setIsLoading(true);
        const currentUserMessage = { role: 'user' as const, text };
        setMessages(prev => [...prev, currentUserMessage]);
        
        const currentState = { ...interviewState };
        currentState.history.push({ role: 'user', content: text });

        try {
            let aiResponseText, newState;

            if (currentState.topic === 'Icebreaker Introduction') {
                const { response, newState: updatedState } = await conductIcebreakerInterview(user!.uid, currentState);
                aiResponseText = response;
                newState = updatedState;
            } else {
                 const { response, newState: updatedState } = await generateInterviewResponse(currentState);
                 aiResponseText = response;
                 newState = updatedState;
            }
            
            setInterviewState(newState);
            setMessages(prev => [...prev, { role: 'assistant', text: aiResponseText }]);

            setIsSynthesizing(true);
            const ttsResult = await textToSpeech({ text: aiResponseText });
            playAudio(ttsResult.audioDataUri);
            setIsSynthesizing(false);
            
            if (newState.isComplete) {
                // Save results
                const finalActivity: InterviewActivity = {
                    id: interviewId,
                    type: 'interview',
                    timestamp: new Date().toISOString(),
                    transcript: newState.history.map(m => ({ speaker: m.role === 'user' ? 'user' : 'ai', text: m.content as string })),
                    feedback: "Feedback will be generated on the results page.",
                    details: { topic: newState.topic, role: newState.role, level: newState.level, company: newState.company }
                };
                await addActivity(user!.uid, finalActivity);
                toast({ title: "Interview Complete!", description: "Redirecting to your results..."});
                router.push(`/dashboard/interview/${interviewId}/results`);
            }

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to get AI response.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [interviewState, interviewId, router, toast, user]);

    // Initial greeting from AI
    useEffect(() => {
        if (messages.length === 0) {
             const greet = `Hello! Welcome to your interview for the ${interviewState.role} role. Today we'll be discussing ${interviewState.topic}. Let's start with a simple question to warm up. Can you tell me a little bit about your experience with this topic?`;
             setMessages([{ role: 'assistant', text: greet }]);
             setIsLoading(true); // To disable input while TTS is playing
             textToSpeech({ text: greet }).then(res => {
                playAudio(res.audioDataUri);
                setIsLoading(false);
             }).catch(console.error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    const handleSend = () => {
        if (!userInput.trim()) return;
        processAndRespond(userInput.trim());
        setUserInput('');
    };

    const onRecordingStop = async (audioBlob: Blob) => {
        setIsTranscribing(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const { transcript } = await speechToText({ audioDataUri: base64Audio });
                if (transcript) {
                    await processAndRespond(transcript);
                } else {
                    toast({ title: "Transcription Failed", description: "Could not understand audio. Please try again.", variant: "destructive"});
                }
                setIsTranscribing(false);
            };
        } catch (error) {
            console.error("Transcription error:", error);
            toast({ title: "Error", description: "Failed to transcribe audio.", variant: "destructive"});
            setIsTranscribing(false);
        }
    };
    
    const { isRecording, startRecording, stopRecording } = useAudioRecorder(onRecordingStop);

    useEffect(() => {
        if(scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex h-screen flex-col bg-muted/40">
             <audio ref={audioPlayerRef} hidden />
            <div className="flex-1 overflow-hidden p-4">
                <Card className="h-full flex flex-col shadow-lg">
                    <ScrollArea className="flex-1" ref={scrollAreaRef}>
                        <CardContent className="p-6 space-y-6">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex items-start gap-4", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {msg.role === 'assistant' && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Bot className="h-6 w-6" /></div>}
                                    <div className={cn("max-w-md rounded-xl px-4 py-3", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                        <p>{msg.text}</p>
                                    </div>
                                     {msg.role === 'user' && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><User className="h-6 w-6" /></div>}
                                </div>
                            ))}
                            {(isLoading || isTranscribing || isSynthesizing) && (
                                <div className="flex items-start gap-4 justify-start">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Bot className="h-6 w-6" /></div>
                                    <div className="max-w-md rounded-xl px-4 py-3 bg-muted flex items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-muted-foreground italic">
                                            {isTranscribing ? "Listening..." : isSynthesizing ? "Speaking..." : "Thinking..."}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </ScrollArea>
                    <div className="border-t p-4 bg-background/95">
                        <div className="relative">
                            <input
                                className="w-full rounded-full border bg-muted py-3 pl-4 pr-24 text-sm"
                                placeholder="Type your answer or use the mic..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') handleSend()}}
                                disabled={isLoading || isRecording}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <Button size="icon" className="rounded-full" onClick={handleSend} disabled={isLoading || isRecording || !userInput}>
                                    <Send className="h-5 w-5" />
                                </Button>
                                <Button size="icon" className={cn("rounded-full", isRecording && "bg-destructive hover:bg-destructive/80")} onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}>
                                    {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <InterviewPageComponent />
        </Suspense>
    )
}
