
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, AlertTriangle, Video, Bot, User, Keyboard } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type InterviewState = 'idle' | 'generating_question' | 'speaking_question' | 'listening' | 'processing_response' | 'finished' | 'error';

export default function MockInterviewSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [interviewState, setInterviewState] = useState<InterviewState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userTranscript, setUserTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const topic = searchParams.get('topic') || 'general';
    const role = searchParams.get('role') || 'Software Engineer';

    // Request camera and microphone permissions
    useEffect(() => {
        async function getPermissions() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera/mic:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Permissions Denied',
                    description: 'Please enable camera and microphone permissions to use this feature.',
                    duration: 5000,
                });
            }
        }
        getPermissions();

        // Cleanup function to stop media tracks when the component unmounts
        return () => {
             if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };

    }, [toast]);
    
    const startInterview = useCallback(async () => {
        if (hasCameraPermission === false) {
             toast({ title: 'Cannot Start Interview', description: 'Permissions for camera and microphone are required.', variant: 'destructive' });
             return;
        }
        setInterviewState('generating_question');
        try {
            const result = await generateInterviewQuestions({ role, level: 'mid-level', technologies: topic });
            if (result.questions && result.questions.length > 0) {
                setQuestions(result.questions);
                askQuestion(result.questions[0]);
            } else {
                throw new Error('No questions were generated.');
            }
        } catch (error) {
            console.error('Failed to generate interview questions:', error);
            toast({ title: 'Error', description: 'Could not start the interview. Please try again.', variant: 'destructive' });
            setInterviewState('error');
        }
    }, [role, topic, toast, hasCameraPermission]);

    const askQuestion = useCallback(async (questionText: string) => {
        setInterviewState('speaking_question');
        setMessages(prev => [...prev, { sender: 'ai', text: questionText }]);
        try {
            const { audioDataUri } = await textToSpeech({ text: questionText });
            if (audioRef.current) {
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setInterviewState('listening'); // Ready to listen after speaking
                };
            }
        } catch (error) {
            console.error('Text-to-speech failed:', error);
            toast({ title: 'Audio Error', description: 'Could not play the question.', variant: 'destructive' });
            setInterviewState('listening'); // Fallback to listening
        }
    }, [toast]);

    const startListening = useCallback(async () => {
        if (isRecording || interviewState !== 'listening') return;

        setUserTranscript('');
        setIsRecording(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                setInterviewState('processing_response');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // Stop the microphone track after recording
                stream.getTracks().forEach(track => track.stop());
                
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    if (base64Audio) {
                        try {
                            const { transcript } = await speechToText({ audioDataUri: base64Audio });
                            setUserTranscript(transcript);
                            setMessages(prev => [...prev, { sender: 'user', text: transcript }]);
                            
                            if (currentQuestionIndex < questions.length - 1) {
                                const nextIndex = currentQuestionIndex + 1;
                                setCurrentQuestionIndex(nextIndex);
                                askQuestion(questions[nextIndex]);
                            } else {
                                setInterviewState('finished');
                            }
                        } catch (error) {
                             console.error('Speech-to-text failed:', error);
                             toast({ title: 'Transcription Error', description: 'Could not understand your response. Please try again.', variant: 'destructive' });
                             setInterviewState('listening');
                        }
                    }
                };
            };
            mediaRecorderRef.current.start();
        } catch (error) {
            console.error('Microphone access denied:', error);
            toast({ title: 'Microphone Required', description: 'Please allow microphone access.', variant: 'destructive' });
            setIsRecording(false);
        }
    }, [isRecording, interviewState, askQuestion, currentQuestionIndex, questions, toast]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    // Handle Spacebar press for push-to-talk
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat && interviewState === 'listening') {
                e.preventDefault();
                startListening();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && interviewState === 'listening') {
                e.preventDefault();
                stopListening();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [interviewState, startListening, stopListening]);

    const renderInterviewStatus = () => {
        switch (interviewState) {
            case 'idle':
                return <Button size="lg" onClick={startInterview} disabled={hasCameraPermission === false}>Start Interview</Button>;
            case 'generating_question':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>Preparing question...</p></div>;
            case 'speaking_question':
                return <div className="flex items-center space-x-2 text-primary"><Bot className="animate-pulse" /> <p>AI is speaking...</p></div>;
            case 'listening':
                 return (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Mic className={isRecording ? "text-destructive animate-pulse" : ""} />
                            <span>{isRecording ? "Recording..." : "Ready to listen"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Keyboard size={16} /> Press and hold Spacebar to talk</div>
                    </div>
                );
            case 'processing_response':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>Processing your response...</p></div>;
            case 'finished':
                return <Button size="lg" onClick={() => router.push('/dashboard')}>Interview Complete! Back to Dashboard</Button>;
             case 'error':
                 return (
                    <div className="text-center text-destructive flex flex-col items-center gap-2">
                         <AlertTriangle className="h-8 w-8" />
                         <p>An error occurred. Please refresh or go back.</p>
                         <Button variant="secondary" className="mt-2" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </div>
                 );
            default: return null;
        }
    };
    
    const lastMessage = messages[messages.length - 1];

    return (
        <main className="flex flex-col h-screen bg-black text-white p-4">
            <audio ref={audioRef} style={{ display: 'none' }} />

            {/* Video Panels */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="relative bg-muted/20 border-primary/20 overflow-hidden">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        <User size={16} /> <span>You</span>
                    </div>
                </Card>
                 <Card className="relative bg-muted/20 border-primary/20 overflow-hidden">
                    <Image src="https://placehold.co/1280x720.png" alt="AI Interviewer" layout="fill" objectFit="cover" className="opacity-80" data-ai-hint="abstract background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
                        <Bot size={16} /> <span>AI Interviewer</span>
                    </div>
                </Card>
            </div>
            
            {hasCameraPermission === false && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                     <Alert variant="destructive" className="max-w-md">
                        <Video className="h-4 w-4" />
                        <AlertTitle>Camera and Microphone Required</AlertTitle>
                        <AlertDescription>
                            Talxify needs access to your camera and microphone for the mock interview. Please enable permissions in your browser settings and refresh the page.
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Subtitles and Controls */}
            <div className="w-full mt-4">
                <Card className="bg-background/80 backdrop-blur-sm border-border/30">
                    <CardContent className="p-4">
                       <div className="min-h-[6rem] text-center flex flex-col justify-center">
                           {lastMessage ? (
                                <div>
                                    <p className="text-sm font-semibold text-primary mb-1">{lastMessage.sender === 'ai' ? 'AI Interviewer:' : 'You said:'}</p>
                                    <p className="text-xl text-foreground">{lastMessage.text}</p>
                                </div>
                            ) : (
                                <p className="text-lg text-muted-foreground">The interview will begin shortly...</p>
                            )}
                       </div>
                       <div className="h-16 flex items-center justify-center border-t border-border/30 mt-4 pt-4">
                            {renderInterviewStatus()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

