
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, StopCircle, User, Bot, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { conductInterviewES } from '@/ai/flows/conduct-interview-es';
import type { InterviewState } from '@/lib/interview-types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

export default function DraftInterviewPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [interviewState, setInterviewState] = useState<InterviewState>({
        interviewId: 'draft-session-' + Date.now(),
        topic: searchParams.get('topic') || 'General Software Engineering',
        level: searchParams.get('level') || 'entry-level',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [],
        isComplete: false,
    });
    
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [interviewState.history]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            setAudioChunks([]); // Reset chunks
            recorder.ondataavailable = (event) => {
                setAudioChunks(chunks => [...chunks, event.data]);
            };
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check your browser permissions.');
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };
    
    // This effect processes the recording once it's stopped
    useEffect(() => {
        if (!isRecording && audioChunks.length > 0) {
            const processAudio = async () => {
                setIsProcessing(true);
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    try {
                        const { userTranscript, aiResponseText, aiResponseAudioUri, newState } = await conductInterviewES(interviewState, base64Audio);
                        
                        // Update state with both user's transcribed message and AI's response
                        setInterviewState(prevState => ({
                            ...newState,
                            history: [
                                ...prevState.history,
                                { role: 'user', content: userTranscript },
                                { role: 'assistant', content: aiResponseText }
                            ]
                        }));

                        if (audioPlayerRef.current) {
                            audioPlayerRef.current.src = aiResponseAudioUri;
                            audioPlayerRef.current.play();
                        }
                    } catch (e) {
                        console.error(e);
                        toast({ title: "Error", description: "An error occurred during the interview.", variant: "destructive" });
                    } finally {
                        setIsProcessing(false);
                        setAudioChunks([]); // Clear chunks after processing
                    }
                };
            };
            processAudio();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRecording, audioChunks]);

    if (authLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-primary" /></div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="flex h-screen flex-col bg-muted">
             {/* Header */}
            <header className="flex-shrink-0 bg-background/80 backdrop-blur-sm border-b p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Talxify AI Interview</h1>
                        <p className="text-sm text-muted-foreground">Topic: {interviewState.topic}</p>
                    </div>
                     <Button variant="outline" onClick={() => router.push('/dashboard')}>End Interview</Button>
                </div>
            </header>

             {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {interviewState.history.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Bot /></div>}
                            <div className={cn("max-w-lg rounded-xl p-4", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground")}>
                                <p>{msg.content}</p>
                            </div>
                            {msg.role === 'user' && <div className="flex-shrink-0 h-10 w-10 rounded-full bg-card text-card-foreground flex items-center justify-center"><User /></div>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                 {isProcessing && (
                    <div className="flex items-start gap-4 justify-start mt-6">
                         <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Bot /></div>
                        <div className="max-w-lg rounded-xl p-4 bg-card text-card-foreground">
                            <Loader2 className="w-5 h-5 animate-spin"/>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="flex-shrink-0 bg-background border-t p-4">
                <div className="max-w-4xl mx-auto">
                    {error && (
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-4 bg-destructive/10 p-3 rounded-lg">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <Card className="p-4">
                        <div className="flex items-center justify-center">
                            {isRecording ? (
                                <Button onClick={handleStopRecording} variant="destructive" size="lg" className="rounded-full w-20 h-20">
                                    <StopCircle className="w-8 h-8"/>
                                </Button>
                            ) : (
                                <Button onClick={handleStartRecording} size="lg" className="rounded-full w-20 h-20" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="w-8 h-8 animate-spin"/> : <Mic className="w-8 h-8"/>}
                                </Button>
                            )}
                        </div>
                         <p className="text-center text-muted-foreground text-sm mt-2">
                           {isRecording ? "Recording... Click to stop." : "Click the button and start speaking."}
                        </p>
                    </Card>
                    <audio ref={audioPlayerRef} className="hidden" />
                </div>
            </footer>
        </div>
    );
}
