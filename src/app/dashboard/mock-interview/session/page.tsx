
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Bot, User, StopCircle, AlertTriangle, PhoneOff } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { conductInterviewTurn } from '@/ai/flows/analyze-interview-response';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity } from '@/lib/types';
import { addActivity } from '@/lib/firebase-service';
import { generateVideoSDKToken } from '@/app/actions/videosdk';

import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  useConnection,
  usePubSub,
} from "@videosdk.live/react-sdk";

type Message = {
  role: 'user' | 'model';
  content: string;
};

type InterviewState = 'idle' | 'generating_response' | 'speaking_response' | 'listening' | 'finished' | 'error';

// Main Component for the meeting
const MeetingView = ({ meetingId, token, onMeetingLeave, onMeetingError }: { meetingId: string, token: string, onMeetingLeave: () => void, onMeetingError: (error: string) => void }) => {
    const { join, leave, localParticipant, enableWebcam } = useMeeting({
        onMeetingJoined: () => {
             startInterview();
        },
        onError: (error) => {
            console.error("VideoSDK Meeting Error:", error);
            onMeetingError(`Video session error: ${error.message}`);
        }
    });

    const { publish } = usePubSub("TRANSCRIPTION");
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [interviewState, setInterviewState] = useState<InterviewState>('idle');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [isEnding, setIsEnding] = useState(false);
    
    const deepgramConnectionRef = useRef<LiveClient | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const finalTranscriptRef = useRef('');

    const searchParams = useSearchParams();
    const company = useMemo(() => searchParams.get('company') || 'a leading tech company', [searchParams]);
    const role = useMemo(() => searchParams.get('role') || 'Software Engineer', [searchParams]);
    const interviewType = useMemo(() => (searchParams.get('type') as 'technical' | 'behavioural') || 'technical', [searchParams]);
    
    const interviewContext = useMemo(() => ({ company, role, type: interviewType }), [company, role, interviewType]);

    const endInterviewAndAnalyze = useCallback(async () => {
      if(isEnding) return;
      setIsEnding(true);
      setInterviewState('finished');

      if (deepgramConnectionRef.current) {
          deepgramConnectionRef.current.finish();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      if (!user) {
          router.push('/login');
          return;
      }
      if (messages.length === 0) {
          leave();
          router.push('/dashboard');
          return;
      }

      const attemptId = `interview_attempt_${Date.now()}`;
      const interviewActivity: InterviewActivity = {
          id: attemptId,
          type: 'interview',
          timestamp: new Date().toISOString(),
          transcript: messages,
          analysis: null,
          interviewContext: interviewContext,
          details: {
              topic: `Interview for ${interviewContext.role}`,
              role: interviewContext.role,
              company: interviewContext.company,
          }
      };

      try {
          await addActivity(user.uid, interviewActivity);
          leave();
          router.push(`/dashboard/mock-interview/analysis?id=${attemptId}`);
      } catch (error) {
          console.error("Failed to save interview results:", error);
          toast({
              title: "Save Error",
              description: "Could not save your interview session.",
              variant: "destructive"
          });
          leave();
          router.push('/dashboard'); 
      }
  }, [isEnding, user, messages, interviewContext, router, toast, leave]);

  const speakResponse = useCallback(async (text: string) => {
      setInterviewState('speaking_response');
      try {
          const { audioDataUri } = await textToSpeech({ text, voice: "aura-asteria-en" });
          if (audioRef.current) {
              audioRef.current.src = audioDataUri;
              audioRef.current.play();
              audioRef.current.onended = () => {
                  if (messages.length >= 2) { 
                       endInterviewAndAnalyze();
                  } else {
                      setInterviewState('listening');
                  }
              };
          }
      } catch (error) {
          console.error('Text-to-speech failed:', error);
          toast({ title: 'Audio Error', description: 'Could not play the AI response.', variant: 'destructive' });
           if (messages.length >= 2) {
              endInterviewAndAnalyze();
           } else {
              setInterviewState('listening');
           }
      }
  }, [toast, messages.length, endInterviewAndAnalyze]);

    const handleUserResponse = useCallback(async (transcript: string) => {
        if (!transcript.trim()) {
            return;
        }
        
        setInterviewState('generating_response');
        const newHistory: Message[] = [...messages, { role: 'user', content: transcript }];
        setMessages(newHistory);
        setCurrentTranscript('');
        finalTranscriptRef.current = '';

        try {
            const { response } = await conductInterviewTurn({
                history: newHistory,
                interviewContext
            });
            setMessages(prev => [...prev, { role: 'model', content: response }]);
            speakResponse(response);
        } catch(error) {
            console.error("AI turn failed:", error);
            toast({ title: "AI Error", description: "The AI failed to respond. Please try again.", variant: "destructive"});
            setInterviewState('error');
        }
    }, [messages, speakResponse, interviewContext, toast]);
    
    const startInterview = useCallback(async () => {
        setInterviewState('generating_response');
        try {
            const { response } = await conductInterviewTurn({ history: [], interviewContext });
            setMessages([{ role: 'model', content: response }]);
            speakResponse(response);
        } catch (error) {
            console.error("Failed to start interview:", error);
            toast({ title: "Interview Start Failed", description: "Could not generate the first question.", variant: "destructive"});
            setInterviewState('error');
        }
    }, [toast, speakResponse, interviewContext]);

    const setupDeepgram = useCallback(async () => {
       if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
            toast({ title: 'Configuration Error', description: 'Deepgram API Key not found.', variant: 'destructive' });
            setInterviewState('error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
            const connection = deepgram.listen.live({
                model: 'nova-2-general',
                smart_format: true,
                interim_results: true,
                utterance_end_ms: 1500,
            });
    
            connection.on(LiveTranscriptionEvents.Open, () => {
               const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
               recorder.ondataavailable = (event) => {
                   if (event.data.size > 0 && connection.getReadyState() === 1) {
                       connection.send(event.data);
                   }
               };
               mediaRecorderRef.current = recorder;
               recorder.start(250);
               setIsRecording(true);
            });
    
            connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                const transcript = data.channel.alternatives[0].transcript;
                if (data.is_final && transcript.trim()) {
                    finalTranscriptRef.current += transcript + ' ';
                }
                 const displayTranscript = finalTranscriptRef.current + transcript;
                 setCurrentTranscript(displayTranscript);
                 publish(displayTranscript, { persist: true });
            });
    
            connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
                if (deepgramConnectionRef.current) {
                    deepgramConnectionRef.current.finish();
                }
            });
    
            connection.on(LiveTranscriptionEvents.Close, () => {
                setIsRecording(false);
                const finalTranscript = finalTranscriptRef.current.trim();
                if (finalTranscript) {
                    handleUserResponse(finalTranscript);
                }
                deepgramConnectionRef.current = null;
            });
            
            connection.on(LiveTranscriptionEvents.Error, (err) => {
                console.error("Deepgram Error:", err);
                toast({ title: "Real-time Transcription Error", variant: "destructive" });
                setInterviewState('error');
            });
    
            deepgramConnectionRef.current = connection;
        } catch (error) {
            console.error("Failed to get user media:", error);
            toast({ title: "Microphone Access Denied", description: "Please allow microphone access to continue.", variant: "destructive" });
            setInterviewState('error');
        }
    }, [toast, publish, handleUserResponse]);

    useEffect(() => {
        if (interviewState === 'listening' && !isRecording && !deepgramConnectionRef.current) {
            setupDeepgram();
        } else if (interviewState !== 'listening' && isRecording) {
             if (deepgramConnectionRef.current) {
                deepgramConnectionRef.current.finish();
             }
             if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
             }
        }
    }, [interviewState, isRecording, setupDeepgram]);

    useEffect(() => {
        join();
        enableWebcam();
        return () => {
            leave();
            if (deepgramConnectionRef.current) deepgramConnectionRef.current.finish();
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const lastMessage = messages[messages.length - 1];

    const renderInterviewStatus = () => {
        switch (interviewState) {
            case 'idle':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>Connecting...</p></div>;
            case 'generating_response':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>AI is thinking...</p></div>;
            case 'speaking_response':
                return <div className="flex items-center space-x-2 text-primary"><Bot className="animate-pulse" /> <p>AI is speaking...</p></div>;
            case 'listening':
                 return (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Mic className={isRecording ? "text-destructive animate-pulse" : ""} />
                            <span>{isRecording ? "Listening... Speak now" : "Ready for your response"}</span>
                        </div>
                    </div>
                );
            case 'finished':
                return <div className="flex items-center space-x-2"><Loader2 className="animate-spin" /> <p>Finalizing & Analyzing...</p></div>;
            case 'error':
                 return <Button variant="destructive" onClick={endInterviewAndAnalyze}>End Session</Button>;
            default: return null;
        }
    };

    return (
      <div className="flex flex-col h-screen bg-black text-white p-4">
        <audio ref={audioRef} style={{ display: 'none' }} />

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {localParticipant && <ParticipantView participantId={localParticipant.id} />}
            <Card className="relative bg-muted/20 border-primary/20 overflow-hidden">
                <Image src="/interview.webp" alt="AI Interviewer" layout="fill" objectFit="cover" className="opacity-80" data-ai-hint="professional woman" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
                    <Bot size={16} /> <span>AI Interviewer</span>
                </div>
            </Card>
        </div>

        <div className="w-full mt-4">
            <Card className="bg-background/80 backdrop-blur-sm border-border/30">
                <CardContent className="p-4">
                   <div className="min-h-[6rem] text-center flex flex-col justify-center">
                       {currentTranscript ? (
                            <p className="text-xl text-foreground">{currentTranscript}</p>
                       ) : lastMessage ? (
                            <div>
                                <p className="text-sm font-semibold text-primary mb-1">{lastMessage.role === 'model' ? 'AI Interviewer:' : 'You said:'}</p>
                                <p className="text-xl text-foreground">{lastMessage.content}</p>
                            </div>
                        ) : (
                            <p className="text-lg text-muted-foreground">The interview will begin shortly...</p>
                        )}
                   </div>
                   <div className="h-16 flex items-center justify-center border-t border-border/30 mt-4 pt-4">
                        <div className="flex items-center gap-4">
                           {interviewState !== 'finished' && interviewState !== 'idle' && (
                                <Button variant="destructive" onClick={endInterviewAndAnalyze} disabled={isEnding}>
                                    <StopCircle className="mr-2 h-4 w-4" />
                                    End & Get Report
                                </Button>
                            )}
                            {renderInterviewStatus()}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    );
};

const ParticipantView = ({ participantId }: { participantId: string }) => {
  const { webcamStream, webcamOn } = useParticipant(participantId);
  const { message } = usePubSub("TRANSCRIPTION", {});

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  return (
    <Card className="relative bg-muted/20 border-primary/20 overflow-hidden">
      {webcamOn && videoStream ? (
        <video ref={(video) => { if(video) video.srcObject = videoStream }} autoPlay muted className="w-full h-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black">
          <User size={64} />
        </div>
      )}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center gap-2">
        <User size={16} /> <span>You</span>
      </div>
      {message && message.text && (
          <div className="absolute top-4 left-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
            <p className='text-sm'>{message.text}</p>
          </div>
      )}
    </Card>
  );
};


export default function MockInterviewSessionPage() {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<{
      meetingId: string | null;
      token: string | null;
      error: string | null;
      isLoading: boolean;
  }>({
      meetingId: null,
      token: null,
      error: null,
      isLoading: true
  });

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        const token = await generateVideoSDKToken();
        
        const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
          method: "POST",
          headers: {
            "authorization": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!res.ok) {
            const errorBody = await res.json();
            throw new Error(`Failed to create room: ${res.status} - ${JSON.stringify(errorBody)}`);
        }
        
        const { roomId } = await res.json();
        setMeetingState({ meetingId: roomId, token: token, error: null, isLoading: false });

      } catch (e: any) {
        console.error("Failed to initialize meeting:", e);
        setMeetingState({ meetingId: null, token: null, error: e.message, isLoading: false });
      }
    };
    initializeMeeting();
  }, []);

  const handleLeave = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleError = useCallback((error: string) => {
    setMeetingState(prev => ({...prev, error: error, isLoading: false }));
  }, []);
  
  if (meetingState.isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p>Initializing interview session...</p>
        </div>
      </main>
    )
  }
  
  if (meetingState.error || !meetingState.token || !meetingState.meetingId) {
     return (
        <main className="flex h-screen items-center justify-center p-4">
            <Card className="max-w-md w-full text-center p-8 shadow-lg">
                 <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit mb-4">
                    <AlertTriangle className="h-8 w-8" />
                 </div>
                <h2 className="text-2xl font-bold">Session Error</h2>
                <p className="text-muted-foreground mt-2 mb-6">Could not start the video session. Please check your configuration and try again. Error: {meetingState.error}</p>
                <Button onClick={() => router.push('/dashboard')}><PhoneOff className="mr-2" /> Back to Dashboard</Button>
            </Card>
        </main>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId: meetingState.meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Participant",
      }}
      token={meetingState.token}
    >
      <MeetingView 
        meetingId={meetingState.meetingId} 
        token={meetingState.token} 
        onMeetingLeave={handleLeave} 
        onMeetingError={handleError}
      />
    </MeetingProvider>
  );
}
