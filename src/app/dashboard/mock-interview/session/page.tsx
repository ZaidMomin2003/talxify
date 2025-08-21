
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, Video, Bot, User, StopCircle, RefreshCw, AlertTriangle, PhoneOff } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';


type Message = {
  role: 'user' | 'model';
  content: string;
};

type InterviewState = 'idle' | 'generating_response' | 'speaking_response' | 'listening' | 'finished' | 'error';


// Main Component for the meeting
const MeetingView = ({ meetingId, token, onMeetingLeave }: { meetingId: string, token: string, onMeetingLeave: () => void }) => {
    const { join, leave, toggleMic, toggleWebcam, localParticipant, enableWebcam, disableWebcam } = useMeeting();
    const { publish } = usePubSub("TRANSCRIPTION");

    const router = useRouter();
    const searchParams = useSearchParams();
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

    const company = searchParams.get('company') || 'a leading tech company';
    const role = searchParams.get('role') || 'Software Engineer';
    const interviewType = (searchParams.get('type') as 'technical' | 'behavioural') || 'technical';
    
    const interviewContext = { company, role, type: interviewType };

    const endInterviewAndAnalyze = useCallback(async () => {
      setIsEnding(true);
      setInterviewState('finished');

      // Stop listening & recording
      if (deepgramConnectionRef.current) {
          deepgramConnectionRef.current.finish();
          deepgramConnectionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (!user) {
          router.push('/login');
          return;
      }
      if (messages.length === 0) {
          leave(); // Leave VideoSDK meeting
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
  }, [user, messages, interviewContext, router, toast, leave]);

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
    if (!transcript.trim() || interviewState !== 'listening') {
        if(interviewState === 'listening') setInterviewState('listening');
        return;
    }
    
    setInterviewState('generating_response');
    const newHistory: Message[] = [...messages, { role: 'user', content: transcript }];
    setMessages(newHistory);
    setCurrentTranscript('');
    finalTranscriptRef.current = ''; // Clear final transcript after processing

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
}, [messages, interviewState, speakResponse, interviewContext, toast]);
    
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


    // Setup Deepgram connection
    const setupDeepgram = useCallback(() => {
       if (!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY) {
            toast({ title: 'Configuration Error', description: 'Deepgram API Key not found.', variant: 'destructive' });
            return;
        }
        const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY);
        const connection = deepgram.listen.live({
            model: 'nova-2-general',
            smart_format: true,
            interim_results: true,
            utterance_end_ms: 1500, // End utterance after 1.5s of silence
        });

        connection.on(LiveTranscriptionEvents.Open, async () => {
           const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
            if (data.is_final && transcript) {
                finalTranscriptRef.current += transcript + ' ';
            }
             setCurrentTranscript(finalTranscriptRef.current + transcript);
             publish(finalTranscriptRef.current + transcript, { persist: true });
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
        });
        
        connection.on(LiveTranscriptionEvents.Error, (err) => {
            console.error(err);
            toast({ title: "Real-time Transcription Error", variant: "destructive" });
        });

        deepgramConnectionRef.current = connection;
    }, [toast, handleUserResponse, publish]);

    useEffect(() => {
        if (interviewState === 'listening' && !isRecording) {
            setupDeepgram();
        } else if (interviewState !== 'listening' && isRecording) {
             if (deepgramConnectionRef.current) {
                deepgramConnectionRef.current.finish();
                deepgramConnectionRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current = null;
            }
            setIsRecording(false);
        }
    }, [interviewState, isRecording, setupDeepgram]);

    useEffect(() => {
        join();
        enableWebcam();

        return () => {
            leave();
        }
    }, []);

    const lastMessage = messages[messages.length - 1];

    const renderInterviewStatus = () => {
        switch (interviewState) {
            case 'idle':
                return <Button size="lg" onClick={startInterview}>Start Interview</Button>;
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


// Component to render a single participant
const ParticipantView = ({ participantId }: { participantId: string }) => {
  const { webcamStream, webcamOn, displayName } = useParticipant(participantId);
  const { connection } = useConnection(participantId, {});
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
      {webcamOn ? (
        <video ref={(video) => { if(video) video.srcObject = videoStream! }} autoPlay muted className="w-full h-full object-cover" />
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


// Parent component to handle token and meeting setup
export default function MockInterviewSessionPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        const genToken = await generateVideoSDKToken();
        setToken(genToken);
        
        const VIDEOSDK_API_KEY = process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY;
        if (!VIDEOSDK_API_KEY) throw new Error("VideoSDK API Key is not configured.");

        const url = `https://api.videosdk.live/v2/rooms`;
        const options = {
          method: "POST",
          headers: {
            "Authorization": genToken,
            "Content-Type": "application/json",
          },
        };

        const response = await fetch(url, options);
        const data = await response.json();
        setMeetingId(data.roomId);
      } catch (e: any) {
        console.error("Failed to initialize meeting:", e);
        setError("Could not start the video session. Please check your configuration and try again.");
      }
    };
    initializeMeeting();
  }, []);

  const handleLeave = () => {
    router.push('/dashboard');
  };
  
  if (error) {
     return (
        <main className="flex h-screen items-center justify-center p-4">
            <Card className="max-w-md w-full text-center p-8 shadow-lg">
                 <div className="mx-auto bg-destructive/10 text-destructive rounded-full p-3 w-fit mb-4">
                    <AlertTriangle className="h-8 w-8" />
                 </div>
                <h2 className="text-2xl font-bold">Session Error</h2>
                <p className="text-muted-foreground mt-2 mb-6">{error}</p>
                <Button onClick={() => router.push('/dashboard')}><PhoneOff className="mr-2" /> Back to Dashboard</Button>
            </Card>
        </main>
    );
  }

  if (!token || !meetingId) {
    return (
      <main className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p>Initializing interview session...</p>
        </div>
      </main>
    )
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: "Participant",
      }}
      token={token}
    >
      <MeetingView meetingId={meetingId} token={token} onMeetingLeave={handleLeave} />
    </MeetingProvider>
  );
}

    