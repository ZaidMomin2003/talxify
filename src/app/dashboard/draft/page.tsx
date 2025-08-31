
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Mic, MicOff, AlertTriangle, User, BrainCircuit, Play, StopCircle } from 'lucide-react';
import { createClient, AgentEvents } from '@deepgram/sdk';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
type AgentStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

const useDeepgramAgent = () => {
    const [connection, setConnection] = useState<any>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
    const [transcript, setTranscript] = useState('');
    const micStream = useRef<MediaStream | null>(null);
    const processor = useRef<any>(null);
    const { toast } = useToast();

    const connect = useCallback(async (interviewConfig: { topic: string, role: string, level: string, company?: string }) => {
        if (connection) {
            connection.finish();
        }

        setConnectionState('connecting');

        try {
            const newConnection = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!).agent();

            newConnection.on(AgentEvents.Welcome, () => {
                console.log("Agent Welcome");
                const systemPrompt = `
                    You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview.
                    The candidate is interviewing for a ${interviewConfig.level} ${interviewConfig.role} role. 
                    The main technical topic is: ${interviewConfig.topic}.
                    ${interviewConfig.company ? `The interview is tailored for ${interviewConfig.company}. Adapt your style accordingly.` : ''}

                    Conversation Rules:
                    1. Start with a brief, friendly greeting.
                    2. Ask ONE main question at a time.
                    3. Keep your responses concise (1-3 sentences).
                    4. After you have asked about 6-7 questions, you MUST conclude the interview with a brief summary of feedback. Start the final message with "Okay, that's all the questions I have. Here's my feedback...".
                `;

                newConnection.configure({
                    agent: {
                        listen: { model: "nova-2" },
                        think: { provider: "google", model: "gemini-1.5-flash", prompt: systemPrompt },
                        speak: { model: "aura-asteria-en" },
                    },
                    audio: {
                        input: { encoding: "linear16", sample_rate: 16000 },
                        output: { encoding: "linear16", sample_rate: 24000, container: "wav" }
                    }
                });
                setConnectionState('connected');
            });

            newConnection.on(AgentEvents.AgentUtteranceEnd, () => {
                setAgentStatus('idle');
            });
            newConnection.on(AgentEvents.UserUtteranceEnd, () => {
                 setAgentStatus('thinking');
            });
            newConnection.on(AgentEvents.UserStartedSpeaking, () => {
                setAgentStatus('listening');
            });
            newConnection.on(AgentEvents.AgentStartedSpeaking, () => {
                 setAgentStatus('speaking');
            });
            newConnection.on(AgentEvents.ConversationText, (data) => {
                setTranscript(t => `${t}\n${data.role}: ${data.content}`);
            });
             newConnection.on(AgentEvents.Error, (error) => {
                console.error("Agent Error:", error);
                toast({ title: "Agent Error", description: "An error occurred with the agent.", variant: "destructive" });
                setConnectionState('error');
            });
             newConnection.on(AgentEvents.Close, () => {
                console.log("Connection closed.");
                disconnect();
            });

            micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(micStream.current);
            await audioContext.audioWorklet.addModule('/audio-processor.js');
            processor.current = new AudioWorkletNode(audioContext, 'audio-processor');
            source.connect(processor.current);
            processor.current.port.onmessage = (event: MessageEvent) => {
                if (newConnection.getReadyState() === 1) { // WebSocket.OPEN
                    newConnection.send(event.data);
                }
            };
            
            setConnection(newConnection);
            
        } catch (error) {
            console.error("Failed to connect to Deepgram Agent:", error);
            setConnectionState('error');
            toast({ title: "Connection Failed", description: "Could not connect to the voice agent. Please check microphone permissions.", variant: "destructive" });
        }
    }, [connection, toast]);
    
    const disconnect = useCallback(() => {
        if(connection) {
            connection.finish();
        }
        if (micStream.current) {
            micStream.current.getTracks().forEach(track => track.stop());
            micStream.current = null;
        }
        if (processor.current) {
            processor.current.disconnect();
            processor.current = null;
        }
        setConnection(null);
        setConnectionState('disconnected');
        setAgentStatus('idle');
    }, [connection]);

    useEffect(() => {
      if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
        console.error("Deepgram API Key not found.");
        setConnectionState('error');
      }
      // Ensure the audio processor is available
      if (!document.getElementById('audio-processor-script')) {
        const script = document.createElement('script');
        script.id = 'audio-processor-script';
        script.innerHTML = `
          class AudioProcessor extends AudioWorkletProcessor {
            constructor() {
              super();
            }
            process(inputs) {
              const input = inputs[0];
              if (input.length > 0) {
                const pcmData = input[0];
                const buffer = new Int16Array(pcmData.length);
                for (let i = 0; i < pcmData.length; i++) {
                  buffer[i] = pcmData[i] * 32767;
                }
                this.port.postMessage(buffer.buffer, [buffer.buffer]);
              }
              return true;
            }
          }
          try {
            registerProcessor('audio-processor', AudioProcessor);
          } catch(e) { console.error(e) }
        `;
        document.body.appendChild(script);
      }
    }, []);

    return { connect, disconnect, connectionState, agentStatus, transcript };
};


function DraftInterviewComponent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    
    const interviewConfig = {
        topic: searchParams.get('topic') || 'General Software Engineering',
        role: searchParams.get('role') || 'Software Engineer',
        level: searchParams.get('level') || 'Entry-level',
        company: searchParams.get('company') || undefined,
    };
    
    const { connect, disconnect, connectionState, agentStatus, transcript } = useDeepgramAgent();

    const getStatusInfo = () => {
        switch (agentStatus) {
            case 'listening': return { text: "Listening...", icon: <User className="w-12 h-12 text-blue-500"/> };
            case 'thinking': return { text: "Thinking...", icon: <BrainCircuit className="w-12 h-12 text-purple-500 animate-pulse"/> };
            case 'speaking': return { text: "Speaking...", icon: <BrainCircuit className="w-12 h-12 text-primary animate-pulse"/> };
            default: return { text: "Idle", icon: <Mic className="w-12 h-12 text-muted-foreground"/> };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-muted/40">
            <Card className="w-full max-w-lg shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Live Voice Interview</CardTitle>
                    <CardDescription>Topic: {interviewConfig.topic}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-4">
                        {connectionState === 'disconnected' && (
                            <>
                                <MicOff className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold">Ready to start?</h3>
                                <p className="text-muted-foreground mb-6">Click below to begin the interview.</p>
                                <Button onClick={() => connect(interviewConfig)} size="lg">
                                    <Play className="mr-2" /> Start Interview
                                </Button>
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
                                <Button onClick={() => connect(interviewConfig)} variant="destructive">Try Again</Button>
                             </>
                        )}
                        {connectionState === 'connected' && (
                           <>
                                <div className="text-center mb-6">
                                    {statusInfo.icon}
                                    <p className="font-semibold mt-2">{statusInfo.text}</p>
                                </div>
                                <div className="h-16 text-sm text-center text-muted-foreground overflow-y-auto">
                                    <p className="whitespace-pre-wrap">{transcript.split('\n').slice(-2).join('\n') || "The conversation will appear here."}</p>
                                </div>
                                <Button onClick={disconnect} size="lg" variant="destructive" className="mt-6">
                                    <StopCircle className="mr-2" /> End Interview
                                </Button>
                           </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}

export default function DraftInterviewPage() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
    }

    return <DraftInterviewComponent />;
}

