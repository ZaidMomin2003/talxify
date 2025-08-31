
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, MicOff, AlertTriangle, User, BrainCircuit } from 'lucide-react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import type { InterviewState } from '@/lib/interview-types';
import { textToSpeechWithDeepgram } from '@/ai/flows/deepgram-tts';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type TranscriptState = {
    isFinal: boolean;
    text: string;
};

// Custom hook to manage the Deepgram connection
const useDeepgram = (onTranscript: (transcript: TranscriptState) => void, onConnect: () => void, onDisconnect: () => void) => {
    const [connection, setConnection] = useState<LiveClient | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    
    const connect = useCallback(async () => {
        if (connection || isConnecting) return;

        setIsConnecting(true);
        try {
            const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!);
            const conn = deepgram.listen.live({
                model: 'nova-2',
                language: 'en-US',
                smart_format: true,
                interim_results: true,
                endpointing: 500, // Endpoint after 500ms of silence
                utterance_end_ms: 1000,
            });

            conn.on(LiveTranscriptionEvents.Open, onConnect);
            conn.on(LiveTranscriptionEvents.Close, onDisconnect);
            conn.on(LiveTranscriptionEvents.Transcript, (data) => {
                onTranscript({
                    isFinal: data.is_final,
                    text: data.channel.alternatives[0].transcript,
                });
            });
            conn.on(LiveTranscriptionEvents.Error, (err) => console.error(err));

            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
            conn.send(mic);

            setConnection(conn);
        } catch (err) {
            console.error(err);
        } finally {
            setIsConnecting(false);
        }
    }, [onTranscript, onConnect, onDisconnect, connection, isConnecting]);

    const disconnect = useCallback(() => {
        if (connection) {
            connection.finish();
            setConnection(null);
        }
    }, [connection]);

    return { connect, disconnect, isConnecting };
};

function DraftInterviewComponent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    const interviewState = useRef<InterviewState>({
        interviewId: user?.uid || 'draft-session',
        topic: searchParams.get('topic') || 'Icebreaker Introduction',
        level: searchParams.get('level') || 'entry-level',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [],
        isComplete: false,
    });
    
    const audioQueue = useRef<HTMLAudioElement[]>([]);

    // Function to play audio from queue sequentially
    const playNextAudio = useCallback(() => {
        if (audioQueue.current.length > 0) {
            const audio = audioQueue.current[0];
            audio.onended = () => {
                audioQueue.current.shift();
                setIsSpeaking(false);
                playNextAudio();
            };
            setIsSpeaking(true);
            audio.play();
        }
    }, []);

    const sendToAgent = useCallback(async (text: string) => {
        if (!text) return;
        
        try {
            const res = await fetch('/api/deepgram-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tag: JSON.stringify(interviewState.current),
                    messages: [{ transcript: text }]
                })
            });
            const data = await res.json();
            
            interviewState.current = JSON.parse(data.tag); // Update state

            const { audioDataUri } = await textToSpeechWithDeepgram({ text: data.text });
            
            const audio = new Audio(audioDataUri);
            audioQueue.current.push(audio);
            if (!isSpeaking) {
                playNextAudio();
            }

            if (interviewState.current.isComplete) {
                // Wait for the final audio to finish playing before disconnecting
                audio.addEventListener('ended', () => {
                   disconnect();
                }, { once: true });
            }

        } catch (err) {
            console.error("Error communicating with agent:", err);
            setConnectionState('error');
        }
    }, [isSpeaking, playNextAudio]);


    const handleTranscript = useCallback((transcriptData: TranscriptState) => {
        setCurrentTranscript(transcriptData.text);
        if (transcriptData.isFinal && transcriptData.text.trim()) {
            sendToAgent(transcriptData.text);
        }
    }, [sendToAgent]);

    const { connect, disconnect, isConnecting } = useDeepgram(
        handleTranscript,
        () => setConnectionState('connected'),
        () => setConnectionState('disconnected')
    );
    
    const handleConnectClick = async () => {
        setConnectionState('connecting');
        await connect();
        await sendToAgent("Hello"); // Kick off the conversation
    }

    if (authLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-muted/40">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Live Voice Interview</CardTitle>
                    <CardDescription>Using Deepgram and Gemini</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-4">
                        {connectionState === 'disconnected' && (
                            <>
                                <MicOff className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold">Ready to start?</h3>
                                <p className="text-muted-foreground mb-6">Click below to connect.</p>
                                <Button onClick={handleConnectClick} size="lg">Connect to Interview</Button>
                            </>
                        )}
                        {connectionState === 'connecting' && (
                             <>
                                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                                <h3 className="text-xl font-semibold">Connecting...</h3>
                                <p className="text-muted-foreground">Please allow microphone access.</p>
                             </>
                        )}
                         {connectionState === 'error' && (
                             <>
                                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                                <h3 className="text-xl font-semibold">Connection Failed</h3>
                                <p className="text-muted-foreground mb-6">Could not connect. Please check permissions and refresh.</p>
                                <Button onClick={handleConnectClick} variant="destructive">Try Again</Button>
                             </>
                        )}
                        {connectionState === 'connected' && (
                           <>
                            <div className="flex gap-8 items-center mb-6">
                                <div className="text-center">
                                    <User className="w-12 h-12 text-blue-500 mx-auto mb-2"/>
                                    <p className="font-semibold">You</p>
                                </div>
                                <div className="text-center">
                                    <BrainCircuit className={`w-12 h-12 text-primary mx-auto mb-2 ${isSpeaking ? 'animate-pulse' : ''}`}/>
                                    <p className="font-semibold">AI Interviewer</p>
                                </div>
                            </div>
                            <p className="flex-grow text-lg text-center text-muted-foreground h-16">"{currentTranscript || (isSpeaking ? '...' : 'Listening...')}"</p>
                            <Button onClick={disconnect} size="lg" variant="destructive" className="mt-6">End Interview</Button>
                           </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function DraftInterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <DraftInterviewComponent />
        </Suspense>
    );
}
