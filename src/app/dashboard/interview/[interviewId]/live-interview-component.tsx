
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
import { Analyser, createBlob, decode, decodeAudioData } from '@/lib/live-audio/utils';

type AppState = 'form' | 'interview';
type InterviewStatus = 'idle' | 'requesting_media' | 'ready' | 'recording' | 'processing' | 'error' | 'finished';

const LiveInterviewComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [appState, setAppState] = useState<AppState>('form');
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  
  const [status, setStatus] = useState<InterviewStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  
  // Audio & Video state
  const [isMuted, setIsMuted] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
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
  
  // Initialize AudioContexts
  useEffect(() => {
    if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
     // Initialize and connect the output node once
    if (outputAudioContextRef.current && !outputNodeRef.current) {
      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(outputAudioContextRef.current.destination);
    }
  }, []);


  const cleanupMedia = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if(videoRef.current) videoRef.current.srcObject = null;
    
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
  }, []);

  const requestMediaPermissions = useCallback(async () => {
    setStatus('requesting_media');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setHasMicPermission(true);
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
      setStatus('ready');
    } catch (err) {
      console.error('Media access denied:', err);
      setError('Microphone and camera access are required to start the interview.');
      setStatus('error');
    }
  }, []);

  const startInterview = useCallback(async () => {
    if (!jobRole || !company) {
        setError('Please fill out both role and company.');
        return;
    }
    setError('');
    setAppState('interview');
    setStatus('processing');
    
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

    const queryParams = new URLSearchParams({ role: jobRole, company }).toString();

    try {
        if (!mediaStreamRef.current) {
             throw new Error("Media stream not available.");
        }
        
        // Input node for visualisation
        const sourceNode = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
        inputNodeRef.current = inputAudioContextRef.current!.createGain();
        sourceNode.connect(inputNodeRef.current);
        
        mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, { mimeType: 'audio/webm' });

      const response = await fetch(`/api/gemini-live?${queryParams}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: new ReadableStream({
          start(controller) {
            if (!mediaRecorderRef.current) return;
            mediaRecorderRef.current.ondataavailable = (event) => {
              if (event.data.size > 0) {
                controller.enqueue(event.data);
              }
            };
            mediaRecorderRef.current.onstop = () => { try { controller.close(); } catch(e) {} };
            mediaRecorderRef.current.onerror = (err) => { try { controller.error(err); } catch(e) {} }
          },
        }),
        // @ts-ignore
        duplex: 'half',
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start the live session.');
      }
      
      setStatus('recording');
      mediaRecorderRef.current.start(250); // Send data every 250ms

      const reader = response.body.getReader();
      nextStartTimeRef.current = outputAudioContextRef.current!.currentTime;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setStatus('finished');
          break;
        }

        const audioBuffer = await decodeAudioData(value, outputAudioContextRef.current!, 24000, 1);
        const source = outputAudioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNodeRef.current!);
        
        const scheduledTime = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
        source.start(scheduledTime);
        nextStartTimeRef.current = scheduledTime + audioBuffer.duration;
        sourcesRef.current.add(source);
        source.onended = () => sourcesRef.current.delete(source);
      }
    } catch (err: any) {
      console.error('Interview Error:', err);
      setError(err.message || 'An unknown error occurred during the interview.');
      setStatus('error');
      cleanupMedia();
    }
  }, [jobRole, company, cleanupMedia]);

   const finishInterviewAndSave = useCallback(async () => {
    if (timerIntervalIdRef.current) clearInterval(timerIntervalIdRef.current);
    setStatus('processing');
    cleanupMedia();

    if (user && interviewId) {
        try {
            const activity: InterviewActivity = {
                id: interviewId,
                type: 'interview',
                timestamp: new Date().toISOString(),
                transcript: transcriptRef.current,
                feedback: 'Feedback will be generated on the results page.',
                details: { topic: "Live Interview", role: jobRole, company }
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
  }, [cleanupMedia, user, interviewId, jobRole, company, router, toast]);

  useEffect(() => {
    requestMediaPermissions();
    return () => {
      cleanupMedia();
      if (timerIntervalIdRef.current) clearInterval(timerIntervalIdRef.current);
    };
  }, [requestMediaPermissions, cleanupMedia]);
  
  const toggleMute = () => {
    setIsMuted(prev => {
        const newMuted = !prev;
        if(mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach(track => track.enabled = !newMuted);
        }
        return newMuted;
    });
  }
  
  const renderForm = () => (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-md">
        <div className="bg-gray-800/80 p-8 rounded-lg border border-white/10 shadow-2xl text-white text-center w-[400px]">
          <h2 className="text-2xl font-bold mb-4">AI Interview Practice</h2>
          <input id="role" type="text" placeholder="Job Role (e.g., Software Engineer)" className="w-full p-2 mb-4 rounded-md border border-gray-600 bg-gray-700 text-white" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />
          <input id="company" type="text" placeholder="Company (e.g., Google)" className="w-full p-2 mb-6 rounded-md border border-gray-600 bg-gray-700 text-white" value={company} onChange={(e) => setCompany(e.target.value)} />
          <Button onClick={startInterview} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">Start Interview</Button>
        </div>
      </div>
  );

  const renderInterviewControls = () => (
     <>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/30 text-white px-4 py-2 rounded-lg font-mono z-10">
            {elapsedTime}
        </div>
        <video id="user-video" ref={videoRef} autoPlay muted playsInline className="absolute bottom-5 right-2 w-[20vw] max-w-[250px] aspect-4/3 rounded-lg border border-white/20 object-cover transform -scale-x-100 z-10"></video>
        <div className="absolute bottom-[5vh] left-0 right-0 flex justify-center items-center gap-4 z-10">
            <Button onClick={toggleMute} variant="outline" size="icon" className="w-16 h-16 rounded-full bg-white/10 border-white/20 text-white backdrop-blur-md">
                {isMuted ? <MicOff size={28}/> : <Mic size={28}/>}
            </Button>
            <Button onClick={finishInterviewAndSave} variant="destructive" size="icon" className="w-16 h-16 rounded-full">
                <X size={32}/>
            </Button>
        </div>
     </>
  );

  const renderMessages = () => (
    <div className="absolute bottom-[15vh] left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 max-w-[80%] text-center">
        {error && <div className="bg-red-500/50 text-white p-2 px-4 rounded-md animate-in fade-in slide-in-from-bottom-5">{error}</div>}
        {!error && status && status !== 'recording' && <div className="bg-black/30 text-white p-2 px-4 rounded-md animate-in fade-in slide-in-from-bottom-5">{status}</div>}
    </div>
  );


  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
        <LiveAudioVisuals3D inputNode={inputNodeRef.current} outputNode={outputNodeRef.current} />
        {appState === 'form' && renderForm()}
        {appState === 'interview' && renderInterviewControls()}
        {renderMessages()}
    </div>
  );
};

export default LiveInterviewComponent;
