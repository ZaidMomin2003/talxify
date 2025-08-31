
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, PhoneOff, AlertTriangle, PhoneCall } from 'lucide-react';
import { createClient, DeepgramClient, DeepgramResponse } from '@deepgram/sdk';
import type { InterviewState } from '@/lib/interview-types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';


type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type AgentState = 'idle' | 'speaking';

const AgentStatusIndicator = ({ state }: { state: AgentState }) => {
    const statusMap = {
        idle: { text: "Idle", color: "bg-gray-500" },
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
    const [phoneNumber, setPhoneNumber] = useState('');
    const [connectionResult, setConnectionResult] = useState<DeepgramResponse | null>(null);

    const deepgramClient = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!);

    // Prepare initial interview state from URL params
    const initialInterviewState: InterviewState = {
        interviewId: user?.uid || 'draft-session',
        topic: searchParams.get('topic') || 'Icebreaker Introduction',
        level: searchParams.get('level') || 'entry-level',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [],
        isComplete: false,
    };

    const connectToDeepgram = useCallback(async () => {
        if (!phoneNumber) {
            alert("Please enter a phone number.");
            return;
        }
        setConnectionState('connecting');

        try {
            // Use asynclive for voice agents, not listen.live
            const result = await deepgramClient.listen.asynclive.fromUrl(
                { type: 'phone', phone_number: phoneNumber },
                {
                    model: 'nova-2',
                    language: 'en-US',
                    smart_format: true,
                    punctuate: true,
                    callback: `${window.location.origin}/api/deepgram-agent`,
                    tag: [JSON.stringify(initialInterviewState)],
                }
            );
            setConnectionResult(result);
            setConnectionState('connected');
            setAgentState('speaking'); // Agent will start speaking first

        } catch (error) {
            console.error("Failed to connect to Deepgram:", error);
            setConnectionState('error');
        }
    }, [phoneNumber, deepgramClient, initialInterviewState]);

    const disconnectFromDeepgram = () => {
        // With asynclive, there's no persistent connection to close from the client.
        // We just reset the state. The call will end automatically.
        setConnectionState('disconnected');
        setAgentState('idle');
        setConnectionResult(null);
    };
    
    useEffect(() => {
        // This is a simple way to monitor the call status.
        // In a real app, you might use WebSockets or server-sent events
        // to get real-time updates from your backend about the call status.
        if (connectionState === 'connected') {
             const interval = setInterval(() => {
                // Here you would typically check a backend status endpoint.
                // For this draft, we'll just assume the call is active.
                console.log("Checking call status...", connectionResult);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [connectionState, connectionResult]);


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
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">Voice Agent Interview</CardTitle>
                            <CardDescription>Using Deepgram Voice Agent</CardDescription>
                        </div>
                        {connectionState === 'connected' && <AgentStatusIndicator state={agentState} />}
                    </div>
                </CardHeader>
                <CardContent>
                    {connectionState === 'disconnected' && (
                        <div className="text-center py-8 space-y-6">
                             <PhoneCall className="mx-auto h-16 w-16 text-muted-foreground"/>
                            <h3 className="text-xl font-semibold">Ready to Start?</h3>
                             <div className="space-y-2 text-left">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input 
                                    id="phone" 
                                    type="tel" 
                                    placeholder="+15551234567" 
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">Enter your phone number including the country code.</p>
                             </div>
                            <Button size="lg" onClick={connectToDeepgram} disabled={!phoneNumber}>
                                <PhoneCall className="mr-2"/> Call and Begin Interview
                            </Button>
                        </div>
                    )}
                     {connectionState === 'connecting' && (
                        <div className="text-center py-8">
                             <Loader2 className="mx-auto h-16 w-16 text-primary animate-spin mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Initiating Call...</h3>
                            <p className="text-muted-foreground">The agent is calling {phoneNumber}. Please answer.</p>
                        </div>
                    )}
                     {connectionState === 'error' && (
                        <div className="text-center py-8">
                             <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4"/>
                            <h3 className="text-xl font-semibold mb-2">Connection Failed</h3>
                            <p className="text-muted-foreground mb-6">Could not initiate the call. Please check the number and try again.</p>
                             <Button size="lg" variant="destructive" onClick={() => setConnectionState('disconnected')}>
                                Try Again
                            </Button>
                        </div>
                    )}

                    {connectionState === 'connected' && (
                        <div className="space-y-4 py-8 text-center">
                            <PhoneCall className="mx-auto h-16 w-16 text-green-500 animate-pulse" />
                            <h3 className="text-xl font-semibold">Call in Progress</h3>
                            <p className="text-muted-foreground">The interview is active. Speak clearly into your phone.</p>
                            <Button size="lg" variant="destructive" className="w-full mt-4" onClick={disconnectFromDeepgram}>
                                <PhoneOff className="mr-2"/> End Call
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
