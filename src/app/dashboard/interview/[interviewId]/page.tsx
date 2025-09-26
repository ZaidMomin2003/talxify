
'use client';

import {
  MessageSquare,
  Mic,
  Phone,
  Settings,
  Video,
  Loader2,
  AlertTriangle,
  User,
  Bot,
  BrainCircuit,
  Maximize
} from 'lucide-react';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { addActivity, updateActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  LiveConnectionState,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from '@deepgram/sdk';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


function InterviewComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isConnecting, setIsConnecting] = useState(true);
  const [micOpen, setMicOpen] = useState(false);
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorder = useRef<MediaRecorder | null>();
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const addTranscript = (entry: TranscriptEntry) => {
    setTranscript((prev) => [...prev, entry]);
  };

  const stopInterview = useCallback(async (save: boolean) => {
    connection?.finish();
    setConnection(undefined);
    recorder.current?.stop();
    recorder.current = undefined;
    if (audioPlayer.current) {
        audioPlayer.current.pause();
    }

    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }

    if (save && user && transcript.length > 1) {
        const interviewActivity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcript,
            feedback: "Feedback will be generated on the results page.",
            details: { topic, role, level, company }
        };
        await addActivity(user.uid, interviewActivity);
        router.push(`/dashboard/interview/${interviewActivity.id}/results`);
    } else {
        router.push('/dashboard/arena');
    }
  }, [user, interviewId, topic, role, level, company, router, transcript, connection]);


  const startRecording = useCallback(async () => {
    if (isRecording || !connection) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

        newRecorder.ondataavailable = async (event) => {
            if (event.data.size > 0 && connection.getReadyState() === LiveConnectionState.OPEN) {
                connection.send(event.data);
            }
        };

        newRecorder.onstart = () => {
            setIsRecording(true);
        };

        newRecorder.onstop = () => {
            setIsRecording(false);
        };
        
        newRecorder.start(250);
        recorder.current = newRecorder;
    } catch(err) {
        console.error("Mic error:", err);
    }
  }, [connection, isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    recorder.current?.stop();
  }, [isRecording]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    getCameraPermission();
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      startRecording();
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      stopRecording();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startRecording, stopRecording]);
  
  const getAgentResponse = async (text: string) => {
      const response = await fetch('/api/deepgram-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, role, topic, level }),
      });
      const data = await response.json();
      
      addTranscript({ speaker: 'ai', text: data.text });
      
      const audioBuffer = Buffer.from(data.audio, 'base64');
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioPlayer.current) {
         audioPlayer.current.src = audioUrl;
         audioPlayer.current.play();
         setMicOpen(true);
      }
  };
  
  useEffect(() => {
    const newConnection = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!).listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: false,
        utterance_end_ms: 1000,
        endpointing: 250,
        punctuate: true,
    });

    newConnection.on(LiveTranscriptionEvents.Open, async () => {
        setIsConnecting(false);
        await getAgentResponse(''); 
    });

    newConnection.on(LiveTranscriptionEvents.Transcript, async (transcription) => {
        const text = transcription.channel.alternatives[0].transcript;
        if (transcription.is_final && text.trim()) {
            addTranscript({ speaker: 'user', text });
            await getAgentResponse(text);
        }
    });

    newConnection.on(LiveTranscriptionEvents.Close, () => {
        setIsConnecting(false);
        setConnection(null);
    });

    newConnection.on(LiveTranscriptionEvents.Error, (e) => {
        console.error(e);
    });

    setConnection(newConnection);

    // Initialize the audio player
    if (!audioPlayer.current) {
        audioPlayer.current = new Audio();
    }

    return () => {
        newConnection.finish();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFullScreen = () => {
    if (!mainContainerRef.current) return;
    if (!document.fullscreenElement) {
        mainContainerRef.current.requestFullscreen();
        setIsFullScreen(true);
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    }
  }


  return (
    <div ref={mainContainerRef} className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground p-4">
      {isConnecting ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary"/>
          <p className="text-lg text-muted-foreground">Initializing Session...</p>
        </div>
      ) : (
      <div className="w-full h-full flex flex-col">
          <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-0">
              <div className="md:col-span-3 h-full bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden p-8">
                   <div className="relative flex flex-col items-center gap-4 text-center z-10">
                      <div className={cn("relative flex items-center justify-center w-48 h-48 rounded-full border-8 transition-all duration-300", 
                          isRecording ? 'border-red-500/50' : 'border-border'
                      )}>
                          <Image src="/robot.png" alt="Kathy" width={192} height={192} className="rounded-full" data-ai-hint="robot face" />
                           <div className={cn("absolute inset-0 rounded-full animate-pulse",
                              isRecording ? 'bg-red-500/20' : 'bg-transparent'
                          )}></div>
                      </div>
                      <h2 className="text-2xl font-bold font-headline">Kathy</h2>
                  </div>

                  <div className="absolute bottom-4 right-4 border rounded-lg bg-background shadow-lg h-32 w-48 overflow-hidden">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                       <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center text-white">
                            <AlertTriangle className="w-6 h-6 mb-2"/>
                            <p className="text-xs">Camera is optional and only for you.</p>
                        </div>
                  </div>

                  <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-green-900/50 text-green-300 border border-green-700">
                      <div className="flex items-center gap-2">
                           <Mic className={cn("transition-colors", isRecording ? "text-red-500" : "text-green-500")} />
                          <span className="font-semibold text-sm">Hold <Badge variant="secondary">Space</Badge> to Speak</span>
                      </div>
                  </div>
              </div>

              <div className="md:col-span-1 h-full flex flex-col gap-4 min-h-0">
                   <h3 className="font-semibold mb-2 flex items-center gap-2 shrink-0"><MessageSquare className="w-5 h-5"/> Transcript</h3>
                  <div className="flex-grow bg-muted rounded-lg p-4 overflow-y-auto min-h-0">
                      <div className="space-y-4 text-sm">
                          {transcript.map((entry, index) => (
                              <div key={index} className={cn("flex flex-col", entry.speaker === 'user' ? 'items-end' : 'items-start')}>
                                  <div className={cn("max-w-[90%] p-3 rounded-lg", entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                      <p className="font-bold mb-1 capitalize">{entry.speaker === 'ai' ? 'Kathy' : 'You'}</p>
                                      <p>{entry.text}</p>
                                  </div>
                              </div>
                          ))}
                           {audioPlayer.current?.seeking && (
                               <div className="flex items-start">
                                    <div className="p-3 rounded-lg bg-background flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin"/>
                                        <span className="text-muted-foreground italic text-sm">Kathy is thinking...</span>
                                    </div>
                               </div>
                           )}
                      </div>
                  </div>
              </div>
          </div>

          <footer className="p-4 border-t flex items-center justify-center gap-4">
                <Button 
                  variant={isRecording ? "destructive" : "outline"} 
                  size="icon" 
                  className={cn("rounded-full h-14 w-14 transition-colors", isRecording && "animate-pulse")}
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  disabled={!micOpen || (audioPlayer.current && !audioPlayer.current.paused)}
                >
                  <Mic className="w-6 h-6"/>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-14 w-14">
                  <Video className="w-6 h-6"/>
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={() => stopInterview(true)}>
                  <Phone className="w-6 h-6" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-14 w-14" onClick={toggleFullScreen}>
                  <Maximize className="w-6 h-6"/>
                </Button>
          </footer>
      </div>
      )}
    </div>
  );
}


export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <InterviewComponent />
        </Suspense>
    )
}
