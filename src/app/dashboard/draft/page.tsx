
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, MicOff, PhoneOff, AlertTriangle } from 'lucide-react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import type { InterviewState } from '@/lib/interview-types';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';

const AgentStatusIndicator = ({ state }: { state: AgentState }) => {
    const statusMap = {
        idle: { text: "Idle", color: "bg-gray-500" },
        listening: { text: "Listening...", color: "bg-green-500 animate-pulse" },
        thinking: { text: "Thinking...", color: "bg-yellow-500 animate-pulse" },
        speaking: { text: "Speaking...", color: "bg-blue-500 animate-pulse" },
    };
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusMap[state].color}`}></div>
            <span className="text-sm font-medium">{statusMap[state].text}</span>
        </div>
    );
};

function DraftInterviewComponent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [agentState, setAgentState] = useState<AgentState>('idle');
    const [transcript, setTranscript] = useState<{ speaker: 'User' | 'AI'; text: string }[]>([]);
    const [deepgramClient, setDeepgramClient] = useState<LiveClient | null>(null);

    // Prepare initial interview state from URL params
    const initialInterviewState: InterviewState = {
        interviewId: user?.uid || 'draft-session',
        topic: searchParams.get('topic') || 'General Software Engineering',
        level: searchParams.get('level') || 'entry-level',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [],
        isComplete: false,
    };

    const connectToDeepgram = useCallback(async () => {
        if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
            console.error("Deepgram API key is not set.");
            setConnectionState('error');
            return;
        }

        setConnectionState('connecting');

        try {
            const client = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
            const dgConnection = client.listen.live({
                model: 'nova-2',
                language: 'en-US',
                smart_format: true,
                puncutate: true,
                // The key part: connect to our server endpoint
                callback: '/api/deepgram-agent',
                // Pass initial state to the agent
                tag: JSON.stringify(initialInterviewState),
            });

            dgConnection.on(LiveTranscriptionEvents.Open, () => {
                setConnectionState('connected');
                setAgentState('listening');
            });
            
            dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
                 const newTranscript = {
                    speaker: 'User' as const,
                    text: data.channel.alternatives[0].transcript
                }
                if (data.is_final) {
                    setTranscript(prev => [...prev, newTranscript]);
                    setAgentState('thinking');
                }
            });

            // Listen for messages from Deepgram agent
            dgConnection.on(LiveTranscriptionEvents.Message, (data) => {
                const message = JSON.parse(data.message);
                if (message.text) {
                    setTranscript(prev => [...prev, { speaker: 'AI', text: message.text }]);
                    setAgentState('speaking');
                    // After the AI speaks, it goes back to listening
                    setTimeout(() => setAgentState('listening'), 1000); 
                }
            });

            dgConnection.on(LiveTranscriptionEvents.Close, () => {
                setConnectionState('disconnected');
                setAgentState('idle');
            });
            
            dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
                console.error('Deepgram Error:', err);
                setConnectionState('error');
            });

            setDeepgramClient(dgConnection);

        } catch (error) {
            console.error("Failed to connect to Deepgram:", error);
            setConnectionState('error');
        }
    }, [initialInterviewState]);

    const disconnectFromDeepgram = () => {
        if (deepgramClient) {
            deepgramClient.finish();
            setDeepgramClient(null);
            setConnectionState('disconnected');
        }
    };
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            disconnectFromDeepgram();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deepgramClient]);

    if (authLoading) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }
    
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-muted/40">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">Draft Voice Interview</CardTitle>
                            <CardDescription>Using Deepgram Voice Agent</CardDescription>
                        </div>
                        {connectionState === 'connected' && <AgentStatusIndicator state={agentState} />}
                    </div>
                </CardHeader>
                <CardContent>
                    {connectionState === 'disconnected' && (
                        <div className="text-center py-8">
                             <Mic className="mx-auto h-16 w-16 text-muted-foreground mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
                            <p className="text-muted-foreground mb-6">Click the button below to connect to the AI interviewer.</p>
                            <Button size="lg" onClick={connectToDeepgram}>
                                <Mic className="mr-2"/> Connect to Interview
                            </Button>
                        </div>
                    )}
                     {connectionState === 'connecting' && (
                        <div className="text-center py-8">
                             <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
                            <p className="text-muted-foreground">Establishing a secure connection to the voice agent.</p>
                        </div>
                    )}
                     {connectionState === 'error' && (
                        <div className="text-center py-8">
                             <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Connection Failed</h3>
                            <p className="text-muted-foreground mb-6">Could not connect to the voice agent. Please check your console and try again.</p>
                             <Button size="lg" variant="destructive" onClick={connectToDeepgram}>
                                Try Again
                            </Button>
                        </div>
                    )}

                    {connectionState === 'connected' && (
                        <div className="space-y-4">
                            <div className="h-80 overflow-y-auto p-4 bg-muted rounded-lg space-y-4 border">
                                {transcript.length === 0 ? (
                                    <p className="text-center text-muted-foreground">Waiting for conversation to start...</p>
                                ) : (
                                    transcript.map((entry, index) => (
                                        <div key={index} className={`flex ${entry.speaker === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[75%] rounded-lg px-4 py-2 ${entry.speaker === 'AI' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                                                <p className="text-sm">{entry.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Button size="lg" variant="destructive" className="w-full" onClick={disconnectFromDeepgram}>
                                <PhoneOff className="mr-2"/> Disconnect & End Interview
                            </Button>
                        </div>
                    )}
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
    )
}
