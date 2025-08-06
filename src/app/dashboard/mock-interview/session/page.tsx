
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, MicOff, AlertTriangle, Send } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText, SpeechToTextInput } from '@/ai/flows/speech-to-text';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { analyzeInterviewResponse } from '@/ai/flows/analyze-interview-response';
import { useToast } from '@/hooks/use-toast';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type InterviewState = 'idle' | 'generating_question' | 'speaking_question' | 'listening' | 'processing_response' | 'analyzing' | 'finished' | 'error';

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
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);

    const topic = searchParams.get('topic') || 'general';
    const role = searchParams.get('role') || 'Software Engineer';
    
    const startInterview = useCallback(async () => {
        setInterviewState('generating_question');
        try {
            const result = await generateInterviewQuestions({
                role,
                level: 'mid-level',
                technologies: topic,
            });
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
    }, [role, topic, toast]);

    const askQuestion = useCallback(async (questionText: string) => {
        setInterviewState('speaking_question');
        try {
            const { audioDataUri } = await textToSpeech({ text: questionText });
            if (audioRef.current) {
                audioRef.current.src = audioDataUri;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setMessages(prev => [...prev, { sender: 'ai', text: questionText }]);
                    startListening();
                };
            }
        } catch (error) {
            console.error('Text-to-speech failed:', error);
            toast({ title: 'Audio Error', description: 'Could not play the question.', variant: 'destructive' });
            setInterviewState('listening'); // Fallback to listening
        }
    }, [toast]);

    const startListening = useCallback(async () => {
        setInterviewState('listening');
        setUserTranscript('');
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
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = reader.result as string;
                    if (base64Audio) {
                        try {
                            const { transcript } = await speechToText({ audioDataUri: base64Audio });
                            setUserTranscript(transcript);
                            setMessages(prev => [...prev, { sender: 'user', text: transcript }]);
                            // For now, we'll just move to the next question. Analysis could be added here.
                            if (currentQuestionIndex < questions.length - 1) {
                                const nextIndex = currentQuestionIndex + 1;
                                setCurrentQuestionIndex(nextIndex);
                                askQuestion(questions[nextIndex]);
                            } else {
                                setInterviewState('finished');
                            }
                        } catch (error) {
                             console.error('Speech-to-text failed:', error);
                             toast({ title: 'Transcription Error', description: 'Could not understand your response.', variant: 'destructive' });
                             setInterviewState('listening'); // Let user try again
                        }
                    }
                };
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Microphone access denied:', error);
            toast({ title: 'Microphone Required', description: 'Please allow microphone access to participate in the interview.', variant: 'destructive' });
            setInterviewState('error');
        }
    }, [askQuestion, currentQuestionIndex, questions, toast]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Turn off microphone tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (mediaRecorderRef.current?.stream) {
                 mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);


    const renderInterviewState = () => {
        switch (interviewState) {
            case 'idle':
                return (
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground mb-4">Ready to start your mock interview?</p>
                        <Button size="lg" onClick={startInterview}>Start Interview</Button>
                    </div>
                );
            case 'generating_question':
                return <div className="flex items-center justify-center space-x-2"><Loader2 className="animate-spin" /> <p>Preparing your first question...</p></div>;
            case 'speaking_question':
                return <div className="flex items-center justify-center space-x-2"><Loader2 className="animate-spin" /> <p>AI is speaking...</p></div>;
            case 'listening':
                return <p className="text-center text-primary font-semibold">Listening... Please answer the question.</p>;
            case 'processing_response':
                return <div className="flex items-center justify-center space-x-2"><Loader2 className="animate-spin" /> <p>Processing your response...</p></div>;
            case 'finished':
                return (
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground mb-4">Interview Complete!</p>
                        <Button size="lg" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </div>
                );
             case 'error':
                 return (
                    <div className="text-center text-destructive">
                         <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                         <p>An error occurred. Please refresh the page or go back to the dashboard.</p>
                         <Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                    </div>
                 );
            default:
                return null;
        }
    };

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <audio ref={audioRef} style={{ display: 'none' }} />
            <div className="max-w-4xl mx-auto">
                <Card className="min-h-[70vh] flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Mock Interview: {role}</CardTitle>
                        <CardDescription>Topic: {topic}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <div className="space-y-4 mb-4 h-96 overflow-y-auto p-4 bg-muted/50 rounded-lg">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                              {isRecording && <div className="text-center text-muted-foreground animate-pulse">Listening...</div>}
                        </div>
                        
                        <div className="h-24 flex items-center justify-center">
                            {renderInterviewState()}
                        </div>
                    </CardContent>
                     {interviewState === 'listening' && (
                        <div className="p-4 border-t flex justify-center">
                            <Button onClick={stopListening} size="lg" variant="destructive">
                                <Send className="mr-2" />
                                I'm done answering
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </main>
    );
}
