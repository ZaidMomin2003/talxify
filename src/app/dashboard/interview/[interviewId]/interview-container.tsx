
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMeeting, MeetingProvider } from '@videosdk.live/react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, StoredActivity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2, MessageSquare, Bot, Power, User } from 'lucide-react';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';

type TranscriptEntry = {
  speaker: 'user' | 'ai';
  text: string;
};

type SessionStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ending';

// Custom Hook to manage Deepgram connection
function useDeepgram(onMessage: (data: any) => void) {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isReady = !!connection;

  const connectToDeepgram = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
      console.error("Deepgram API Key is not set.");
      return;
    }
    const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
    const conn = deepgram.listen.live({
      model: 'nova-2-general',
      interim_results: false,
      smart_format: true,
      endpointing: 200, // shorter endpointing for quicker turn-taking
      no_delay: true,
      diarize: false,
    });

    conn.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened.');
    });

    conn.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed.');
    });

    conn.on(LiveTranscriptionEvents.Transcript, onMessage);

    conn.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram Error:', error);
    });

    setConnection(conn);
  }, [onMessage]);

  const startStreaming = useCallback(async () => {
    if (!connection) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0 && connection.getReadyState() === 1) {
        connection.send(event.data);
      }
    };
    
    mediaRecorderRef.current.start(250); // Start recording and send data every 250ms
  }, [connection]);

  const stopStreaming = useCallback(() => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
    }
    if (connection) {
        connection.finish();
        setConnection(null);
    }
  }, [connection]);

  return { connectToDeepgram, startStreaming, stopStreaming, isReady };
}


export function InterviewContainer({ interviewId }: { interviewId: string }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<{ interviewState: any; ws: WebSocket | null }>({
    interviewState: null,
    ws: null,
  });
  
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState<SessionStatus>('idle');
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  
  const { join, leave, toggleWebcam, localWebcamOn } = useMeeting();

  const handleDeepgramMessage = useCallback((data: any) => {
    const userTranscript = data.channel.alternatives[0].transcript;
    if (userTranscript && session.ws) {
        setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);
        session.ws.send(JSON.stringify({ type: 'user_speech', text: userTranscript }));
        setStatus('speaking'); // AI will start speaking soon
    }
  }, [session.ws]);

  const { connectToDeepgram, startStreaming, stopStreaming, isReady: isDeepgramReady } = useDeepgram(handleDeepgramMessage);


  const handleServerMessage = useCallback(async (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      if (message.type === 'ai_audio') {
          // Play the incoming audio chunk
          const audioBlob = new Blob([new Uint8Array(message.audio)], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          if(audioPlayerRef.current) {
             audioPlayerRef.current.src = audioUrl;
             audioPlayerRef.current.play();
          }
      } else if (message.type === 'ai_text') {
          // Update transcript with AI's response
          setTranscript(prev => [...prev, { speaker: 'ai', text: message.text }]);
      } else if (message.type === 'interview_complete') {
          endSession(true);
      }
  }, []);

  useEffect(() => {
    const audioPlayer = audioPlayerRef.current;
    const handleAudioEnd = () => {
        setStatus('listening'); // Once AI is done speaking, go back to listening
    };
    if (audioPlayer) {
        audioPlayer.addEventListener('ended', handleAudioEnd);
        return () => audioPlayer.removeEventListener('ended', handleAudioEnd);
    }
  }, []);

  const startSession = async () => {
    setStatus('connecting');
    join();
    setIsSessionActive(true);

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001');

    ws.onopen = () => {
        const interviewConfig = {
            interviewId: interviewId,
            topic: searchParams.get('topic') || 'general',
            level: searchParams.get('level') || 'entry-level',
            role: searchParams.get('role') || 'Software Engineer',
            company: searchParams.get('company') || undefined,
        };
        ws.send(JSON.stringify({ type: 'start_interview', config: interviewConfig }));
        connectToDeepgram(); // Connect to Deepgram once WebSocket is ready
    };

    ws.onmessage = handleServerMessage;
    ws.onclose = () => console.log('Server WebSocket closed.');
    ws.onerror = (err) => console.error('Server WebSocket error:', err);
    
    setSession({ interviewState: {}, ws });
  };
  
  useEffect(() => {
    // Once deepgram is ready, start streaming microphone audio to it
    if(isDeepgramReady) {
        startStreaming();
        setStatus('listening');
    }
  }, [isDeepgramReady, startStreaming]);


  const endSession = useCallback(async (isFinished: boolean = false) => {
    setStatus('ending');
    stopStreaming(); // Stops Deepgram connection and media recorder
    if (session.ws) {
        session.ws.close();
    }
    leave();
    setIsSessionActive(false);
    
    if (user && isFinished && transcript.length > 0) {
        // Prepare final data for storage
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
        // Add to firebase, but don't wait for it to finish to navigate
        addActivity(user.uid, finalActivity).catch(console.error);
    }

    router.push(`/dashboard/interview/${interviewId}/results`);
  }, [stopStreaming, session.ws, leave, user, transcript, interviewId, router, searchParams]);


  const getStatusIndicator = () => {
    switch (status) {
        case 'listening':
            return <div className="flex items-center justify-center gap-2 text-green-400"><Mic className="h-5 w-5 animate-pulse" /><span>Listening...</span></div>;
        case 'speaking':
            return <div className="flex items-center justify-center gap-2 text-blue-400"><Bot className="h-5 w-5" /><span>AI Speaking...</span></div>;
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
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Click the button below to start your session. Make sure your microphone is enabled.
              </p>
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
             <Button variant={status === 'listening' ? "default" : "secondary"} size="icon" className="rounded-full h-12 w-12" disabled>
                {status === 'listening' ? <Mic /> : <MicOff />}
            </Button>
        </div>
    </div>
  );
}
