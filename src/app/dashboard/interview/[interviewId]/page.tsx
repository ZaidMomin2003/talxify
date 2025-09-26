
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
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  ConnectionState,
  LiveClient,
  LiveTranscriptionEvents,
  createClient,
} from '@deepgram/sdk';
import { useQueue } from '@uidotdev/usehooks';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type InterviewStatus = 'initializing' | 'generating_questions' | 'ready' | 'listening' | 'speaking' | 'processing' | 'finished' | 'error';

const statusInfo: { [key in InterviewStatus]: { text: string; showMic?: boolean } } = {
  initializing: { text: "Initializing Session..." },
  generating_questions: { text: "Kathy is preparing your questions..." },
  ready: { text: "Ready to Start. Kathy will speak first." },
  listening: { text: "Hold Space to Talk", showMic: true },
  speaking: { text: "Kathy is Speaking..." },
  processing: { text: "Processing your answer..." },
  finished: { text: "Interview Finished" },
  error: { text: "Connection Error" },
};

function InterviewComponent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [status, setStatus] = useState<InterviewStatus>('initializing');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { add, remove, first, size, queue } = useQueue<any>([]);
  const [connection, setConnection] = useState<LiveClient | null>();
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const recorder = useRef<MediaRecorder | null>();

  const interviewId = params.interviewId as string;
  const topic = searchParams.get('topic') || 'General Software Engineering';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  const addTranscript = (entry: TranscriptEntry) => {
    setTranscript((prev) => [...prev, entry]);
  };

  const stopInterview = useCallback(async (save: boolean) => {
    setConnection(undefined);
    recorder.current?.stop();
    recorder.current = undefined;

    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }

    if (save && user && transcript.length > 1) {
        try {
            setStatus('finished');
            const { generateInterviewFeedback } = await import('@/ai/flows/generate-interview-feedback');
            const feedback = await generateInterviewFeedback({ transcript, topic, role, company });
            const finalActivity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcript,
                feedback: "Feedback generated.",
                analysis: feedback,
                details: { topic, role, level, company, score: feedback.overallScore }
            };
            await addActivity(user.uid, finalActivity);
            router.push(`/dashboard/interview/${finalActivity.id}/results`);
        } catch(e) {
            console.error("Failed to generate and save feedback:", e);
             router.push('/dashboard/arena');
        }
    } else {
        router.push('/dashboard/arena');
    }
  }, [user, interviewId, topic, role, level, company, router, transcript]);


  const startRecording = useCallback(async () => {
    if (isRecording) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const newRecorder = new MediaRecorder(stream);
    newRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && connection?.getReadyState() === 1) {
        connection.send(event.data);
      }
    };
    newRecorder.start(250);
    recorder.current = newRecorder;
    setIsRecording(true);
  }, [connection, isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    recorder.current?.stop();
    recorder.current = undefined;
    setIsRecording(false);
  }, [isRecording]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
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

  const processQueue = useCallback(async () => {
    if (size > 0 && !isProcessing) {
      setIsProcessing(true);
      const audio = first;
      const audioBlob = new Blob([audio], { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();
      audioElement.onended = () => {
        remove();
        setIsProcessing(false);
      };
    }
  }, [size, isProcessing, first, remove]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    searchParams.set('role', role);
    searchParams.set('topic', topic);
    searchParams.set('level', level);
    
    const connect = async () => {
      const response = await fetch(`/api/deepgram?${searchParams.toString()}`);
      const newConnection = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!).listen.live({
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        smart_format: true,
        endpointing: 250,
        utterance_end_ms: 1000,
      });

      newConnection.on(LiveTranscriptionEvents.Open, async () => {
        console.log('connection established');
        setIsReady(true);
        setIsConnecting(false);
        const { runInterviewAgent } = await import('@/ai/flows/interview-agent');
        const { stream } = await runInterviewAgent({
          text: '',
          role, topic, level
        });
        for await (const chunk of stream) {
          add(chunk);
        }
      });

      newConnection.on(
        LiveTranscriptionEvents.Transcript,
        async (transcription) => {
          const text = transcription.channel.alternatives[0].transcript;
          if (transcription.is_final && text.trim()) {
            addTranscript({ speaker: 'user', text });
            const { runInterviewAgent } = await import('@/ai/flows/interview-agent');
            const { stream } = await runInterviewAgent({
              text,
              role, topic, level
            });
            for await (const chunk of stream) {
              add(chunk);
            }
          }
        }
      );

      newConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log('connection closed');
        setIsReady(false);
        setIsConnecting(false);
        setConnection(undefined);
      });

      newConnection.on(LiveTranscriptionEvents.Error, (e) => {
        console.error(e);
      });
      setConnection(newConnection);
    };

    if (!connection) {
      connect();
    }
  }, [add, connection, level, role, topic]);

  useEffect(() => {
    if (!isProcessing) {
      processQueue();
    }
  }, [processQueue, isProcessing]);

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
                          isRecording ? 'border-red-500/50' :
                          isProcessing ? 'border-blue-500/50' : 'border-border'
                      )}>
                          <Image src="/robot.png" alt="Kathy" width={192} height={192} className="rounded-full" data-ai-hint="robot face" />
                           <div className={cn("absolute inset-0 rounded-full animate-pulse",
                              isRecording ? 'bg-red-500/20' : 
                              isProcessing ? 'bg-blue-500/20' : 'bg-transparent'
                          )}></div>
                      </div>
                      <h2 className="text-2xl font-bold font-headline">Kathy</h2>
                  </div>

                  <div className="absolute bottom-4 right-4 border rounded-lg bg-background shadow-lg h-32 w-48 overflow-hidden">
                      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                      { !hasCameraPermission && (
                          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center text-white">
                              <AlertTriangle className="w-6 h-6 mb-2"/>
                              <p className="text-xs">Enable camera permissions to see yourself.</p>
                          </div>
                      )}
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

    