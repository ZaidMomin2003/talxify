
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2, MessageSquare, Bot, Power, User, AlertTriangle } from 'lucide-react';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { InterviewState } from '@/lib/interview-types';

type TranscriptEntry = {
  speaker: 'user' | 'ai';
  text: string;
};

type SessionStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ending' | 'processing';

export function InterviewContainer({ interviewId }: { interviewId: string }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // New refs for endpointing
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const isRecording = useRef(false);

  const { join, leave, toggleWebcam, localWebcamOn, localMicOn, toggleMic } = useMeeting();

  const processAndRespond = useCallback(async (state: InterviewState) => {
    if (!state || state.isComplete) {
      if (state?.isComplete) endSession(true);
      return;
    }
    
    setStatus('speaking');
    try {
      const { response: aiText, newState } = await generateInterviewResponse(state);
      setTranscript(prev => [...prev, { speaker: 'ai', text: aiText }]);
      
      const { audioDataUri } = await textToSpeech({ text: aiText });
      
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioDataUri;
        audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
      }
      setInterviewState(newState);

      if (newState.isComplete) {
         const audio = audioPlayerRef.current;
         const onAudioEnd = () => {
            endSession(true);
            audio?.removeEventListener('ended', onAudioEnd);
         };
         audio?.addEventListener('ended', onAudioEnd);
      } else {
        // Automatically start listening for user's response after AI finishes
        const audio = audioPlayerRef.current;
        const onAudioEnd = () => {
            startRecording();
            audio?.removeEventListener('ended', onAudioEnd);
        };
        audio?.addEventListener('ended', onAudioEnd);
      }

    } catch (error) {
      console.error("Error processing AI response:", error);
      toast({ title: "AI Error", description: "Could not get a response from the AI. Please try again.", variant: "destructive"});
      setStatus('listening');
    }
  }, []);

  const handleStopRecordingAndProcess = useCallback(async () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          isRecording.current = false;
          if (silenceTimer.current) clearTimeout(silenceTimer.current);
          
          setStatus('processing');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if(audioBlob.size < 2000) { // Ignore small audio chunks/noise
              setStatus('listening');
              startRecording();
              return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
              const { transcript: userTranscript } = await speechToText({ audioDataUri: base64Audio });
              if (userTranscript && interviewState) {
                setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);
                const newHistory = [...interviewState.history, { role: 'user', content: userTranscript }];
                const newState = { ...interviewState, history: newHistory };
                setInterviewState(newState);
                processAndRespond(newState);
              } else {
                setStatus('listening'); // If no transcript, just go back to listening
                startRecording();
              }
            } catch (err) {
              console.error("Transcription error:", err);
              toast({ title: "Transcription Error", description: "Could not understand audio. Please try again.", variant: "destructive"});
              setStatus('listening');
              startRecording();
            }
          };
      }
  }, [interviewState, processAndRespond, toast]);


  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Record in 1s chunks
      isRecording.current = true;
      setStatus('listening');
    }
  };

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
          // Endpointing logic: if new data comes in, reset the silence timer
          if (isRecording.current) {
             if (silenceTimer.current) clearTimeout(silenceTimer.current);
             silenceTimer.current = setTimeout(handleStopRecordingAndProcess, 1500); // 1.5s of silence
          }
        };

      } catch (error) {
        console.error("Failed to get media devices:", error);
        toast({ title: "Microphone Error", description: "Could not access your microphone.", variant: "destructive"});
      }
    };
    initializeRecorder();
  }, [handleStopRecordingAndProcess, toast]);


  const startSession = async () => {
    setStatus('connecting');
    join();
    if (!localMicOn) toggleMic();
    setIsSessionActive(true);

    const initialState: InterviewState = {
        interviewId,
        topic: searchParams.get('topic') || 'general',
        level: searchParams.get('level') || 'entry-level',
        role: searchParams.get('role') || 'Software Engineer',
        company: searchParams.get('company') || undefined,
        history: [],
        isComplete: false,
    };
    
    setInterviewState(initialState);
    await processAndRespond(initialState);
  };
  
  const endSession = useCallback(async (isFinished: boolean = false) => {
    setStatus('ending');
    // Stop any active recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        isRecording.current = false;
    }
    if (silenceTimer.current) clearTimeout(silenceTimer.current);

    leave();
    setIsSessionActive(false);
    
    if (user && isFinished && transcript.length > 0) {
        const finalActivity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcript,
            feedback: "Feedback will be generated on the results page.",
            details: {
                topic: searchParams.get('topic') || 'general',
                role: searchParams.get('role') || 'Software Engineer',
                level: searchParams.get('level') || 'entry-level',
                company: searchParams.get('company') || undefined,
            }
        };
        addActivity(user.uid, finalActivity).catch(console.error);
    }
    router.push(`/dashboard/interview/${interviewId}/results`);
  }, [leave, user, transcript, interviewId, router, searchParams]);

  const getStatusIndicator = () => {
    switch (status) {
        case 'listening':
            return <div className="flex items-center justify-center gap-2 text-green-400"><Mic className="h-5 w-5 animate-pulse" /><span>Listening... (Speak now)</span></div>;
        case 'speaking':
            return <div className="flex items-center justify-center gap-2 text-blue-400"><Bot className="h-5 w-5" /><span>AI Speaking...</span></div>;
        case 'processing':
            return <div className="flex items-center justify-center gap-2 text-yellow-400"><Loader2 className="h-5 w-5 animate-spin" /><span>Processing...</span></div>;
        case 'connecting':
            return <div className="flex items-center justify-center gap-2 text-yellow-400"><Loader2 className="h-5 w-5 animate-spin" /><span>Connecting...</span></div>;
        case 'ending':
            return <div className="flex items-center justify-center gap-2 text-red-400"><Loader2 className="h-5 w-5 animate-spin" /><span>Ending Session...</span></div>;
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
               <CardDescription>Click the button below to start your session. The conversation will be hands-free. The AI will detect when you've finished speaking.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={startSession} size="lg" disabled={status === 'connecting'}>
                {status === 'connecting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Start Session
              </Button>
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
                    <video ref={(ref) => ref && ref.srcObject && (ref.srcObject = new MediaStream([useMeeting().localWebcamStream]))} autoPlay muted className="w-full h-full object-cover" />
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
             <Button
                onClick={toggleMic}
                variant={localMicOn ? "default" : "destructive"}
                size="icon"
                className="rounded-full h-12 w-12"
            >
                {localMicOn ? <Mic /> : <MicOff />}
            </Button>
        </div>
    </div>
  );
}

    