'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, BrainCircuit, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { speechToTextWithDeepgram } from '@/ai/flows/deepgram-stt';
import { textToSpeechWithDeepgram } from '@/ai/flows/deepgram-tts';
import type { InterviewState } from '@/lib/interview-types';
import { addActivity, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';


type AgentStatus = 'idle' | 'listening' | 'processing' | 'speaking';

function DraftInterviewComponent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [status, setStatus] = useState<AgentStatus>('idle');
    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'ai', text: string }[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    
    const interviewId = `interview_${user?.uid}_${Date.now()}`;

    const [interviewState, setInterviewState] = useState<InterviewState>({
        interviewId: interviewId,
        topic: searchParams.get('topic') || 'General Software Engineering',
        role: searchParams.get('role') || 'Software Engineer',
        level: searchParams.get('level') || 'Entry-level',
        company: searchParams.get('company') || '',
        history: [],
        isComplete: false,
    });
    
    const startRecording = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.addEventListener("dataavailable", event => {
                    audioChunksRef.current.push(event.data);
                });

                mediaRecorderRef.current.start();
                setIsRecording(true);
                setStatus('listening');
            })
            .catch(err => {
                console.error("Error accessing microphone:", err);
                toast({ title: "Microphone Error", description: "Could not access microphone. Please check permissions.", variant: "destructive" });
            });
    }, [toast]);
    
    const stopRecordingAndProcess = useCallback(async () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setStatus('processing');

            mediaRecorderRef.current.addEventListener("stop", async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    
                    try {
                        // 1. STT: Transcribe user's speech
                        const sttResult = await speechToTextWithDeepgram({ audioDataUri: base64Audio });
                        const userText = sttResult.transcript;
                        if (!userText) {
                            setStatus('idle');
                            toast({ description: "Could not understand audio. Please try again."})
                            return;
                        }

                        setTranscript(prev => [...prev, { speaker: 'user', text: userText }]);
                        
                        const stateForApi = { ...interviewState };
                        stateForApi.history.push({ role: 'user', parts: [{ text: userText }] });

                        // 2. LLM: Get AI response
                        const response = await fetch('/api/deepgram-agent', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ state: stateForApi, message: userText }),
                        });

                        if (!response.ok) throw new Error("Failed to get AI response.");

                        const { text: aiText, newState } = await response.json();
                        setInterviewState(newState);
                        setTranscript(prev => [...prev, { speaker: 'ai', text: aiText }]);
                        
                        // 3. TTS: Convert AI response to speech and play
                        setStatus('speaking');
                        const ttsResult = await textToSpeechWithDeepgram({ text: aiText });
                        
                        if (audioPlayerRef.current) {
                            audioPlayerRef.current.src = ttsResult.audioDataUri;
                            audioPlayerRef.current.play();
                            audioPlayerRef.current.onended = () => {
                                 if (newState.isComplete) {
                                    // Save the final results
                                    const finalActivity: InterviewActivity = {
                                        id: interviewId,
                                        type: 'interview',
                                        timestamp: new Date().toISOString(),
                                        transcript: [...transcript, { speaker: 'user', text: userText }, { speaker: 'ai', text: aiText }],
                                        feedback: "Feedback will be generated on the results page.",
                                        details: interviewState
                                    };
                                    addActivity(user!.uid, finalActivity).then(() => {
                                        router.push(`/dashboard/interview/${interviewId}/results`);
                                    });
                                } else {
                                    setStatus('idle');
                                }
                            };
                        }
                    } catch (error) {
                        console.error(error);
                        toast({ title: "Error", description: "An error occurred during processing.", variant: "destructive" });
                        setStatus('idle');
                    }
                };
            });
        }
    }, [interviewState, toast, transcript, user, interviewId, router]);
    
    // Initial greeting
    useEffect(() => {
        if (transcript.length === 0 && user) {
            setStatus('processing');
            const initialGreeting = `Hello ${user.displayName}! I'm Alex, your AI interviewer. When you're ready, hold the button below and tell me a bit about yourself to get started.`;
            
            setInterviewState(prev => ({
                ...prev,
                history: [{ role: 'model', parts: [{text: initialGreeting}] }]
            }));
            
            textToSpeechWithDeepgram({ text: initialGreeting }).then(ttsResult => {
                setTranscript([{ speaker: 'ai', text: initialGreeting }]);
                 if (audioPlayerRef.current) {
                    audioPlayerRef.current.src = ttsResult.audioDataUri;
                    audioPlayerRef.current.play();
                    audioPlayerRef.current.onended = () => setStatus('idle');
                }
            }).catch(err => {
                console.error(err);
                setStatus('idle');
                toast({ title: "Initialization Error", description: "Could not generate opening message.", variant: "destructive"})
            });
        }
    }, [user, transcript.length, toast]);

    const getStatusInfo = () => {
        switch (status) {
            case 'listening': return { text: "Listening...", icon: <User className="w-12 h-12 text-blue-500 animate-pulse"/>, color: "bg-blue-500" };
            case 'processing': return { text: "Thinking...", icon: <BrainCircuit className="w-12 h-12 text-purple-500 animate-pulse"/>, color: "bg-purple-500" };
            case 'speaking': return { text: "Speaking...", icon: <BrainCircuit className="w-12 h-12 text-primary animate-pulse"/>, color: "bg-primary" };
            default: return { text: "Ready", icon: <Mic className="w-12 h-12 text-muted-foreground"/>, color: "bg-muted-foreground" };
        }
    };

    const statusInfo = getStatusInfo();
    const lastMessage = transcript.slice(-1)[0];

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-muted/40">
            <audio ref={audioPlayerRef} hidden />
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Live Voice Interview</CardTitle>
                    <CardDescription>Topic: {interviewState.topic}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-between h-96 border-2 border-dashed rounded-lg p-4">
                        {/* Status Display */}
                        <div className="text-center">
                            {statusInfo.icon}
                            <p className="font-semibold mt-2">{statusInfo.text}</p>
                        </div>
                        
                        {/* Transcript */}
                         <div className="h-24 w-full text-center text-lg text-foreground overflow-y-auto px-4">
                            {lastMessage && (
                                <p>
                                    <span className={lastMessage.speaker === 'ai' ? "font-bold text-primary" : "font-bold text-blue-500"}>
                                        {lastMessage.speaker === 'ai' ? 'AI: ' : 'You: '}
                                    </span>
                                    {lastMessage.text}
                                </p>
                            )}
                         </div>

                        {/* Control Button */}
                        <div className="text-center">
                             <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecordingAndProcess}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecordingAndProcess}
                                disabled={status !== 'idle'}
                                className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:bg-muted-foreground disabled:cursor-not-allowed"
                            >
                                <Mic className="w-10 h-10" />
                            </button>
                            <p className="text-sm text-muted-foreground mt-4">Hold to Speak</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function DraftPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <DraftInterviewComponent />
        </Suspense>
    )
}
