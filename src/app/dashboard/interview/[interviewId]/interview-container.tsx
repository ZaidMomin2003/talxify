
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { speechToText } from '@/ai/flows/speech-to-text';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2, MessageSquare, Bot, Power, User } from 'lucide-react';
import { MessageData } from 'genkit/model';
import type { InterviewState } from '@/lib/interview-types';

type TranscriptEntry = {
  speaker: 'user' | 'ai';
  text: string;
};

type SessionStatus = 'idle' | 'listening' | 'processing' | 'speaking';

const dummyTranscript: TranscriptEntry[] = [
    { speaker: 'ai', text: "Hello, and welcome to your mock interview! My name is Alex. We'll spend about 12 minutes on the topic of React. Are you ready to start?" },
    { speaker: 'user', text: "Yes, I'm ready. Thanks for having me." },
    { speaker: 'ai', text: "Great. Let's begin. Can you explain the concept of the Virtual DOM in React and why it's beneficial for performance?" },
];


export function InterviewContainer({ interviewId }: { interviewId: string }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [interviewState, setInterviewState] = useState<InterviewState>({
    interviewId: interviewId,
    topic: searchParams.get('topic') || 'general',
    level: searchParams.get('level') || 'entry-level',
    role: searchParams.get('role') || 'Software Engineer',
    history: [],
    questionsAsked: 0,
    isComplete: false,
  });

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState<SessionStatus>('idle');

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { join, leave, toggleWebcam, localWebcamOn } = useMeeting();

  const processUserSpeech = useCallback(async (audioBlob: Blob) => {
    setStatus('processing');
    try {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            // 1. Speech to Text
            const { transcript: userTranscript } = await speechToText({ audioDataUri: base64Audio });
            
            if (!userTranscript.trim()) {
                setStatus('listening'); // Nothing was said, go back to listening
                return;
            }

            setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);

            // Update history for the AI
            const newHistory: MessageData[] = [...interviewState.history, { role: 'user', content: [{ text: userTranscript }] }];
            const stateForAI: InterviewState = { ...interviewState, history: newHistory };

            // 2. Get AI Response
            const { response, newState } = await generateInterviewResponse(stateForAI);
            setInterviewState(newState);
            setTranscript(prev => [...prev, { speaker: 'ai', text: response }]);
            
            // 3. Text to Speech
            const { audioDataUri } = await textToSpeech({ text: response });
            
            // 4. Play AI audio
            if (audioPlayerRef.current) {
                audioPlayerRef.current.src = audioDataUri;
                audioPlayerRef.current.play();
                setStatus('speaking');
            }
        };
    } catch (error) {
        console.error('Error processing user speech:', error);
        toast({ title: 'Error', description: 'Could not process audio. Please try again.', variant: 'destructive' });
        setStatus('listening'); // Go back to listening on error
    }
}, [interviewState, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
    }
     if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
  }, []);
  
  const startRecording = useCallback(() => {
    async function getMedia() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size > 1000) { // Only process if there's some audio data
                    processUserSpeech(audioBlob);
                } else {
                    setStatus('listening'); // If blob is empty, just go back to listening
                }
            };
            
            mediaRecorderRef.current.start();
            setStatus('listening');

            // Voice Activity Detection (VAD)
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512;
            source.connect(analyserRef.current);

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const checkForSilence = () => {
                if(status !== 'listening') return;

                analyserRef.current!.getByteFrequencyData(dataArray);
                let sum = dataArray.reduce((a, b) => a + b, 0);

                if (sum < bufferLength) { // Silence detected
                    if (!silenceTimeoutRef.current) {
                        silenceTimeoutRef.current = setTimeout(() => {
                            stopRecording();
                        }, 1500); // 1.5 seconds of silence to trigger stop
                    }
                } else { // Sound detected
                    if (silenceTimeoutRef.current) {
                        clearTimeout(silenceTimeoutRef.current);
                        silenceTimeoutRef.current = null;
                    }
                }
                requestAnimationFrame(checkForSilence);
            };
            checkForSilence();

        } catch (err) {
            console.error('Failed to get media stream:', err);
            toast({ title: 'Microphone Error', description: 'Could not access your microphone.', variant: 'destructive' });
        }
    }
    getMedia();
  }, [processUserSpeech, stopRecording, status, toast]);


  useEffect(() => {
      const audioPlayer = audioPlayerRef.current;
      const handleAudioEnd = () => {
          if (interviewState.isComplete) {
              endSession(true); // End session after final AI message
          } else {
              startRecording();
          }
      };

      if (audioPlayer) {
          audioPlayer.addEventListener('ended', handleAudioEnd);
          return () => audioPlayer.removeEventListener('ended', handleAudioEnd);
      }
  }, [startRecording, interviewState.isComplete]);


  const startSession = async () => {
    join();
    setIsSessionActive(true);
    
    // Initial AI message
    try {
        setStatus('processing');
        const { response, newState } = await generateInterviewResponse(interviewState);
        setInterviewState(newState);
        setTranscript(prev => [...prev, { speaker: 'ai', text: response }]);
        
        const { audioDataUri } = await textToSpeech({ text: response });
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play();
            setStatus('speaking');
        }
    } catch(err) {
        console.error(err)
        toast({title: "Error", description: "Failed to start the interview session."})
        setIsSessionActive(false);
    }
  }

  const endSession = useCallback(async (isFinished: boolean = false) => {
    stopRecording();
    leave();
    setIsSessionActive(false);
    setStatus('idle');
    
    if (user && isFinished && transcript.length > 0) {
        const finalActivity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcript,
            feedback: "Feedback generation is a work in progress.", // Placeholder
            details: {
                topic: interviewState.topic,
                role: interviewState.role,
                level: interviewState.level,
            }
        };
        await addActivity(user.uid, finalActivity);
    }

    // Navigate to the new results page
    router.push(`/dashboard/interview/${interviewId}/results`);
  }, [stopRecording, leave, user, transcript, interviewId, interviewState, router]);

  const getStatusIndicator = () => {
    switch (status) {
        case 'listening':
            return <div className="flex items-center justify-center gap-2 text-green-400"><Mic className="h-5 w-5 animate-pulse" /><span>Listening...</span></div>;
        case 'speaking':
            return <div className="flex items-center justify-center gap-2 text-blue-400"><Bot className="h-5 w-5" /><span>AI Speaking...</span></div>;
        case 'processing':
            return <div className="flex items-center justify-center gap-2 text-yellow-400"><Loader2 className="h-5 w-5 animate-spin" /><span>Processing...</span></div>;
        default:
            return <div className="flex items-center justify-center gap-2 text-muted-foreground"><Power className="h-5 w-5" /><span>Session Idle</span></div>;
    }
  };


  if (!isSessionActive) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-background p-4">
          <Card className="max-w-lg text-center">
            <CardHeader>
              <CardTitle>Ready for your mock interview?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Click the button below to start your session. Make sure your microphone is enabled.
              </p>
              <Button onClick={startSession} size="lg">Start Session</Button>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 gap-4">
        <audio ref={audioPlayerRef} hidden />
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
            <div className="md:col-span-2 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
                 {localWebcamOn ? (
                    <video ref={(ref) => ref && (ref.srcObject = new MediaStream([useMeeting().localWebcamStream]))} autoPlay muted className="w-full h-full object-cover" />
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <User className="w-24 h-24 text-muted-foreground/50"/>
                        <p className="text-muted-foreground mt-2">Your camera is off</p>
                    </div>
                 )}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <User className="w-4 h-4"/>
                    {user?.displayName || "Interviewee"}
                </div>
            </div>

            <div className="flex flex-col gap-4 min-h-0">
                <Card className="flex-grow flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare/> Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {entry.speaker === 'ai' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground"><Bot className="w-5 h-5"/></div>}
                                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${entry.speaker === 'user' ? 'bg-secondary' : 'bg-muted'}`}>
                                        <p className="text-sm">{entry.text}</p>
                                    </div>
                                    {entry.speaker === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><User className="w-5 h-5"/></div>}
                                </div>
                            ))}
                             {status === 'processing' && (
                                <div className="flex items-start gap-3 justify-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                        <Bot className="w-5 h-5"/>
                                    </div>
                                    <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                       {getStatusIndicator()}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="flex-shrink-0 flex justify-center items-center gap-4 py-2">
            <Button onClick={toggleWebcam} variant={localWebcamOn ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12">
                {localWebcamOn ? <Video /> : <VideoOff />}
            </Button>
            <Button onClick={() => endSession()} variant="destructive" size="icon" className="rounded-full h-14 w-14">
                <Phone />
            </Button>
             <Button onClick={status === 'listening' ? stopRecording : startRecording} variant={status === 'listening' ? "secondary" : "default"} size="icon" className="rounded-full h-12 w-12">
                {status === 'listening' ? <MicOff /> : <Mic />}
            </Button>
        </div>
    </div>
  );
}
