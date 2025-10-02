
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertTriangle, Loader2, Play, RefreshCw, X, Video, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addActivity } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry } from '@/lib/types';
import LiveAudioVisuals3D from './live-audio-visuals-3d';
import { Analyser, createBlob, decodeAudioData } from '@/lib/live-audio/utils';
import type { LiveServerMessage } from '@google/genai';

type InterviewStatus = 'idle' | 'requesting_media' | 'ready' | 'starting' | 'recording' | 'processing' | 'error' | 'finished';

const LiveInterviewComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<InterviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  
  // Audio & Video state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  const inputAudioContextRef = useRef<AudioContext>();
  const outputAudioContextRef = useRef<AudioContext>();
  
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const interviewStartTimeRef = useRef(0);
  const timerIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const interviewId = params.interviewId as string;
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Initialize AudioContexts
  useEffect(() => {
    if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (outputAudioContextRef.current && !outputNodeRef.current) {
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);
    }
  }, []);


  const cleanupMedia = useCallback(() => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
     if (scriptProcessorNodeRef.current) {
      scriptProcessorNodeRef.current.disconnect();
      scriptProcessorNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if(videoRef.current) videoRef.current.srcObject = null;
    mediaStreamRef.current = null;
  }, []);

  const requestMediaAndStart = useCallback(async () => {
    setStatus('requesting_media');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
      setStatus('ready');
      startInterview(stream);
    } catch (err) {
      console.error('Media access denied:', err);
      setError('Microphone and camera access are required to start the interview.');
      setStatus('error');
    }
  }, []);

  const startInterview = useCallback(async (stream: MediaStream) => {
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company') || 'a top tech company';
    
    setStatus('starting');
    
    if (outputAudioContextRef.current?.state === 'suspended') {
        await outputAudioContextRef.current.resume();
    }
    if (inputAudioContextRef.current?.state === 'suspended') {
        await inputAudioContextRef.current.resume();
    }

    interviewStartTimeRef.current = Date.now();
    timerIntervalIdRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - interviewStartTimeRef.current) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
      const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);

    const queryParams = new URLSearchParams({ role, company }).toString();

    try {
        const sourceNode = inputAudioContextRef.current!.createMediaStreamSource(stream);
        inputNodeRef.current = inputAudioContextRef.current!.createGain();
        sourceNode.connect(inputNodeRef.current);
        
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const response = await fetch(`/api/gemini-live?${queryParams}`, {
            method: 'POST',
            body: new ReadableStream({
                start(controller) {
                    scriptProcessorNodeRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    sourceNode.connect(scriptProcessorNodeRef.current);
                    scriptProcessorNodeRef.current.connect(inputAudioContextRef.current!.destination);
                    scriptProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
                        if (isMuted) return;
                        const pcmData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const base64 = createBlob(pcmData).data;
                        controller.enqueue(new TextEncoder().encode(base64));
                    };
                },
                cancel() {
                   if (scriptProcessorNodeRef.current) scriptProcessorNodeRef.current.disconnect();
                }
            }),
            signal,
            // @ts-ignore
            duplex: 'half',
        });

        if (!response.ok || !response.body) {
            throw new Error('Failed to start the live session.');
        }
        
        setStatus('recording');
        
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        nextStartTimeRef.current = outputAudioContextRef.current!.currentTime;

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                setStatus('finished');
                break;
            }
            
            const dataString = value.replace(/^data: /, '').trim();
            if (dataString) {
                try {
                    const message: LiveServerMessage = JSON.parse(dataString);
                    const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
                    if (audio) {
                        const audioBuffer = await decodeAudioData(Buffer.from(audio.data, 'base64'), outputAudioContextRef.current!, 24000, 1);
                        const source = outputAudioContextRef.current!.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNodeRef.current!);
                        const scheduledTime = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
                        source.start(scheduledTime);
                        nextStartTimeRef.current = scheduledTime + audioBuffer.duration;
                        sourcesRef.current.add(source);
                        source.onended = () => sourcesRef.current.delete(source);
                    }
                    
                    const aiText = message.serverContent?.modelTurn?.parts.find(p => p.text)?.text;
                    if (aiText) {
                         transcriptRef.current.push({ speaker: 'ai', text: aiText });
                    }
                    const userText = message.serverContent?.userTurn?.parts.find(p => p.text)?.text;
                    if (userText) {
                        transcriptRef.current.push({ speaker: 'user', text: userText });
                    }

                } catch (e) {
                    console.error("Error parsing SSE message:", e);
                }
            }
        }
    } catch (err: any) {
        if (err.name !== 'AbortError') {
            console.error('Interview Error:', err);
            setError(err.message || 'An unknown error occurred during the interview.');
            setStatus('error');
        }
    } finally {
        cleanupMedia();
    }
  }, [isMuted, cleanupMedia, searchParams]);

   const finishInterviewAndSave = useCallback(async () => {
    if (timerIntervalIdRef.current) clearInterval(timerIntervalIdRef.current);
    setStatus('processing');
    cleanupMedia();

    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company') || '';

    if (user && interviewId) {
        try {
            const activity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcriptRef.current,
                feedback: 'Feedback will be generated on the results page.',
                details: { topic: searchParams.get('topic') || "Live Interview", role, company }
            };
            await addActivity(user.uid, activity);
            toast({
                title: "Interview Complete!",
                description: "Your session has been saved. Generating feedback now...",
            });
            router.push(`/dashboard/interview/${interviewId}/results`);
        } catch (error) {
            console.error('Failed to save interview activity:', error);
            toast({ title: "Save Error", description: "Could not save your interview session.", variant: "destructive" });
        }
    }
  }, [cleanupMedia, user, interviewId, router, toast, searchParams]);

  useEffect(() => {
    requestMediaAndStart();
    return () => {
      cleanupMedia();
      if (timerIntervalIdRef.current) clearInterval(timerIntervalIdRef.current);
    };
  }, [requestMediaAndStart, cleanupMedia]);
  
  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleVideo = () => {
      if (mediaStreamRef.current) {
        const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
      }
  };
  
  const renderInterviewControls = () => (
     <>
        {status === 'recording' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/30 text-white px-4 py-2 rounded-lg font-mono z-10">
                {elapsedTime}
            </div>
        )}
        <video id="user-video" ref={videoRef} autoPlay muted playsInline className="absolute bottom-5 right-5 w-[20vw] max-w-[250px] aspect-video rounded-lg border-2 border-white/20 object-cover transform -scale-x-100 z-10"></video>
        <div className="absolute bottom-[5vh] left-0 right-0 flex justify-center items-center gap-4 z-10">
            <Button onClick={toggleMute} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white/10 border-white/20 text-white backdrop-blur-md">
                {isMuted ? <MicOff size={28}/> : <Mic size={28}/>}
            </Button>
             <Button onClick={toggleVideo} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white/10 border-white/20 text-white backdrop-blur-md">
                {isVideoOff ? <VideoOff size={28}/> : <Video size={28}/>}
            </Button>
            <Button onClick={finishInterviewAndSave} variant="destructive" size="icon" className="w-16 h-16 rounded-full">
                <X size={32}/>
            </Button>
        </div>
     </>
  );

  const getStatusMessage = () => {
    switch (status) {
        case 'idle':
        case 'requesting_media':
            return 'Requesting camera and microphone access...';
        case 'ready':
        case 'starting':
            return 'Clarie is preparing for the interview...';
        case 'processing':
            return 'Processing and saving your interview...';
        case 'finished':
            return 'Interview finished!';
        default:
            return null;
    }
  }

  const renderMessages = () => {
    const statusMessage = getStatusMessage();
    return (
        <div className="absolute bottom-[20vh] left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 max-w-[80%] text-center">
            {error && <div className="bg-red-500/50 text-white p-2 px-4 rounded-md animate-in fade-in slide-in-from-bottom-5">{error}</div>}
            {statusMessage && (
                <div className="bg-black/30 text-white p-3 px-6 rounded-lg animate-in fade-in slide-in-from-bottom-5 backdrop-blur-sm">
                   {statusMessage}
                </div>
            )}
        </div>
    );
  };


  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
        <LiveAudioVisuals3D inputNode={inputNodeRef.current} outputNode={outputNodeRef.current} />
        {renderInterviewControls()}
        {renderMessages()}
    </div>
  );
};

export default LiveInterviewComponent;
