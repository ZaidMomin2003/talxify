
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

  const [transcript, setTranscript] = useState<TranscriptEntry[]>(dummyTranscript);
  const [isSessionActive, setIsSessionActive] = useState(true); // Start active for UI dev
  const [status, setStatus] = useState<SessionStatus>('speaking'); // Dummy status

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { join, leave, toggleWebcam, localWebcamOn } = useMeeting();

  // The actual logic is commented out to allow for UI-only development.
  const processUserSpeech = useCallback(async (audioBlob: Blob) => {
    console.log("Processing speech...");
    // AI logic would go here
  }, []);

  const stopRecording = useCallback(() => {
    // Recording logic
  }, []);
  
  const startRecording = useCallback(() => {
    // VAD logic
  }, [processUserSpeech, stopRecording, status, toast]);


  useEffect(() => {
      // Logic for handling audio playback ending would go here.
  }, [startRecording, interviewState.isComplete]);


  const startSession = async () => {
    // join();
    setIsSessionActive(true);
    setStatus('speaking');
    console.log("Starting session (dummy)...")
  }

  const endSession = () => {
    // leave();
    setIsSessionActive(false);
    // Navigate to the new results page
    router.push(`/dashboard/interview/${interviewId}/results`);
  }

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
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <User className="w-24 h-24 text-muted-foreground/50"/>
                    <p className="text-muted-foreground mt-2">Your camera view will appear here</p>
                </div>
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
            <Button onClick={() => console.log("Toggle Webcam")} variant="secondary" size="icon" className="rounded-full h-12 w-12">
                <Video />
            </Button>
            <Button onClick={endSession} variant="destructive" size="icon" className="rounded-full h-14 w-14">
                <Phone />
            </Button>
             <Button onClick={() => console.log("Toggle Mic")} variant="secondary" size="icon" className="rounded-full h-12 w-12">
                <Mic />
            </Button>
        </div>
    </div>
  );
}
