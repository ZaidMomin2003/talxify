
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, Bot, User, MessageSquare, ChevronLeft, Loader2, Sparkles, AlertTriangle, Keyboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getAssemblyAiToken } from '@/app/actions/assemblyai';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { InterviewState } from '@/lib/interview-types';

type SessionStatus = 'idle' | 'connecting' | 'connected' | 'listening' | 'processing' | 'speaking' | 'ending' | 'error';
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
    
    const socketRef = useRef<WebSocket | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const finalTranscriptRef = useRef(''); // Store the final transcript from a single speech segment

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
              startRecording(); // Automatically start listening for user's turn
            }
            audio?.removeEventListener('ended', onAudioEnd);
          };
          audio?.addEventListener('ended', onAudioEnd);
    
        } catch (error) {
          console.error("Error processing AI response:", error);
          toast({ title: "AI Error", description: "Could not get a response from the AI. Please try again.", variant: "destructive"});
          setStatus('error');
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

    const stopRecordingAndProcess = useCallback(() => {
        if (recorderRef.current && recorderRef.current.state === 'recording') {
            recorderRef.current.stop();
        }
    }, []);

    const startRecording = useCallback(async () => {
        if (recorderRef.current || status === 'listening') return;
        
        setStatus('connecting');

        try {
            const token = await getAssemblyAiToken();
            const wsUrl = `wss://streaming.assemblyai.com/v3/ws?token=${token}`;
            socketRef.current = new WebSocket(wsUrl);

            socketRef.current.onopen = () => {
                socketRef.current?.send(JSON.stringify({
                    audio_format: "audio/webm",
                    turn_detection: true,
                    end_of_turn_confidence_threshold: 0.7,
                    min_end_of_turn_silence_when_confident: 400,
                    max_turn_silence: 1200
                }));
            };

            socketRef.current.onmessage = (message) => {
                const res = JSON.parse(message.data);
                if (res.message_type === 'PartialTranscript' && res.text) {
                    setInterimTranscript(res.text);
                } else if (res.message_type === 'FinalTranscript' && res.text) {
                    finalTranscriptRef.current += res.text + ' ';
                } else if (res.end_of_turn) {
                    stopRecordingAndProcess();
                }
            };

            socketRef.current.onerror = (event) => {
                console.error("WebSocket error:", event);
                setStatus('error');
                toast({ title: "Connection Error", description: "Could not connect to transcription service.", variant: "destructive" });
            };
            
            socketRef.current.onclose = () => {
                 socketRef.current = null;
            }

        } catch (error: any) {
            console.error("Failed to start transcription session:", error);
            setStatus('error');
            toast({ title: "Initialization Failed", description: error.message, variant: "destructive" });
            return;
        }
        
        const waitForConnection = (callback: () => void, retries = 10) => {
            if (retries <= 0) {
                setStatus('error');
                toast({ title: "Connection Timeout", description: "Could not establish connection in time.", variant: "destructive"});
                return;
            }
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                callback();
            } else {
                setTimeout(() => waitForConnection(callback, retries - 1), 500);
            }
        };

        waitForConnection(async () => {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                recorderRef.current = recorder;

                recorder.addEventListener('dataavailable', (event) => {
                    if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
                         socketRef.current.send(event.data);
                    }
                });

                recorder.onstop = () => {
                    if (socketRef.current?.readyState === WebSocket.OPEN) {
                         socketRef.current.send(JSON.stringify({ terminate_session: true }));
                    }
                    
                    setStatus('processing');
                    const userTranscript = finalTranscriptRef.current.trim();
                    setInterimTranscript('');
                    
                    if (userTranscript && interviewState) {
                        setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);
                        const newHistory = [...interviewState.history, { role: 'user', content: userTranscript }];
                        const newState = { ...interviewState, history: newHistory };
                        setInterviewState(newState);
                        processAndRespond(newState);
                    } else {
                        // If no transcript, just go back to listening state
                        startRecording();
                    }

                    // Clean up for next turn
                    const aStream = recorderRef.current?.stream;
                    aStream?.getTracks().forEach(track => track.stop());
                    recorderRef.current = null;
                    finalTranscriptRef.current = '';
                };
                
                recorder.start(250); // Send data every 250ms
                setStatus('listening');
            } catch(err) {
                console.error("Microphone access error:", err);
                toast({title: "Microphone Error", description: "Could not access your microphone.", variant: "destructive"});
                setStatus('error');
            }
        });
    }, [status, stopRecordingAndProcess, toast, interviewState, processAndRespond]);

    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ terminate_session: true }));
                socketRef.current.close();
            }
        };
    }, []);

    const getStatusIndicator = () => {
        switch (status) {
            case 'idle': return <div className="flex items-center gap-2 text-blue-400"><Sparkles className="w-4 h-4"/>Ready to Start</div>;
            case 'connecting': return <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin"/>Connecting...</div>;
            case 'speaking': return <div className="flex items-center gap-2 text-blue-400"><Bot className="w-4 h-4" />AI Speaking...</div>;
            case 'connected': return <div className="flex items-center gap-2 text-green-400"><Keyboard className="w-4 h-4"/>Hold <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Space</kbd> to speak</div>;
            case 'listening': return <div className="flex items-center gap-2 text-green-400 animate-pulse"><Mic className="w-4 h-4"/>Listening...</div>;
            case 'processing': return <div className="flex items-center gap-2 text-yellow-400"><Loader2 className="w-4 h-4 animate-spin"/>Processing...</div>;
            case 'ending': return <div className="flex items-center gap-2 text-red-400"><Loader2 className="w-4 h-4 animate-spin"/>Ending Session...</div>;
            case 'error': return <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4"/>Error</div>;
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
                    <CardContent className="flex-grow overflow-y-auto pr-2 space-y-4">
                         {transcript.map((entry, index) => (
                             <div key={index} className={cn("flex items-start gap-3", entry.speaker === 'user' ? 'justify-end' : 'justify-start')}>
                                {entry.speaker === 'ai' && (
                                    <Avatar className="w-8 h-8 border-2 border-primary">
                                        <AvatarFallback><Bot className="w-4 h-4"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg px-4 py-2 max-w-[80%]", entry.speaker === 'user' ? 'bg-blue-600 text-white' : 'bg-secondary')}>
                                     <p className="text-sm font-semibold">{entry.speaker === 'ai' ? 'Alex (AI)' : 'You'}</p>
                                    <p className="text-sm">{entry.text}</p>
                                </div>
                                {entry.speaker === 'user' && (
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {interimTranscript && (
                            <div className="flex items-start gap-3 justify-end opacity-70">
                                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-blue-600/80 text-white">
                                    <p className="text-sm font-semibold">You</p>
                                    <p className="text-sm italic">{interimTranscript}</p>
                                </div>
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
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
                    <Button variant={status === 'listening' ? 'destructive' : 'secondary'} size="icon" className="rounded-full h-14 w-14" onClick={() => status === 'listening' ? stopRecordingAndProcess() : startRecording()}>
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


