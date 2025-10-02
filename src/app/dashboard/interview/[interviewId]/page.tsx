
'use client';

import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Session,
} from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createBlob, decode, decodeAudioData } from '@/lib/utils';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2 } from 'lucide-react';
import { addActivity, updateUserFromIcebreaker } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry, IcebreakerData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function LiveInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [status, setStatus] = useState('Click the mic to start your interview');
  const [error, setError] = useState('');
  const [currentUserTranscription, setCurrentUserTranscription] = useState('');
  const [currentAiTranscription, setCurrentAiTranscription] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userVideoEl = useRef<HTMLVideoElement>(null);
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const clientRef = useRef<GoogleGenAI | null>(null);
  const isInitializedRef = useRef(false);

  // Use refs for audio nodes to maintain stable references across renders
  const inputNodeRef = useRef<GainNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  // Separate state to trigger re-render of visualizer when nodes are ready
  const [audioNodesReady, setAudioNodesReady] = useState(false);


  const updateStatus = (msg: string) => { setStatus(msg); setError(''); };
  const updateError = (msg: string) => { setError(msg); console.error(msg); };
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (isInterviewing) {
      setElapsedTime(0); // Reset timer
      timerInterval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timerInterval);
    };
  }, [isInterviewing]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const stopAllPlayback = useCallback(() => {
    if (!outputAudioContextRef.current) return;
    for (const source of sourcesRef.current.values()) { source.stop(); }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const playAudio = useCallback(async (base64EncodedAudioString: string) => {
    if (!outputAudioContextRef.current || !outputNodeRef.current) return;
    await outputAudioContextRef.current.resume();
    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
    const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContextRef.current, 24000, 1);
    const source = outputAudioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNodeRef.current);
    source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    sourcesRef.current.add(source);
  }, []);


  const initSession = useCallback(() => {
    if (!clientRef.current) return;
    const topic = searchParams.get('topic') || 'general software engineering';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company');

    let systemInstruction = `Your name is Kathy, you are an expert technical interviewer at Talxify.
    You are interviewing a candidate for the role of "${role}". The main topic for this interview is "${topic}".
    Your tone must be professional, encouraging, and clear.
    Start with a brief, friendly introduction and then begin the interview by asking your first question.
    Keep your questions relevant and your responses concise. Always wait for the user to finish speaking before you reply.
    `;

    if (company) {
        systemInstruction += ` The candidate is specifically interested in ${company}, so you can tailor behavioral questions to their leadership principles if applicable (e.g., STAR method for Amazon).`;
    }

    if (topic === 'Icebreaker Introduction') {
        systemInstruction = `Your name is Kathy, a friendly career coach at Talxify. Your goal is to conduct a short, 2-minute icebreaker session.
        Start by warmly welcoming the user.
        Ask them about their name, what city they are from, their college, their skills, and their hobbies.
        Keep the conversation light and encouraging.
        After gathering this information, respond with a JSON object containing the extracted data. The JSON object should follow this format:
        { "isIcebreaker": true, "name": "User's Name", "city": "User's City", "college": "User's College", "skills": ["skill1", "skill2"], "hobbies": ["hobby1", "hobby2"] }
        Wrap the JSON object within <JSON_DATA> tags. For example: <JSON_DATA>{"isIcebreaker": true, ...}</JSON_DATA>.
        Do not add any other text before or after the JSON data block. This is your final response.
        `;
    }
    
    updateStatus('Initializing session...');
    try {
      sessionPromiseRef.current = clientRef.current.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => updateStatus('Session Opened. Ready for interview.'),
          onmessage: async (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            if (audio?.data) { playAudio(audio.data); }
            if (message.serverContent?.interrupted) { stopAllPlayback(); }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setCurrentAiTranscription(prev => prev + text);
            }
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setCurrentUserTranscription(prev => prev + text);
            }
            if (message.serverContent?.turnComplete) {
                if (currentUserTranscription.trim()) {
                    transcriptRef.current.push({ speaker: 'user', text: currentUserTranscription.trim() });
                }
                if (currentAiTranscription.trim()) {
                    transcriptRef.current.push({ speaker: 'ai', text: currentAiTranscription.trim() });

                    // Check for icebreaker JSON
                    const jsonMatch = currentAiTranscription.match(/<JSON_DATA>(.*?)<\/JSON_DATA>/);
                    if (jsonMatch && jsonMatch[1]) {
                        try {
                            const icebreakerData: IcebreakerData = JSON.parse(jsonMatch[1]);
                            if (user && icebreakerData.isIcebreaker) {
                                await updateUserFromIcebreaker(user.uid, icebreakerData);
                                toast({ title: "Icebreaker Complete!", description: "Your profile has been updated with the info you provided."});
                            }
                        } catch (e) {
                            console.error("Failed to parse icebreaker JSON", e);
                        }
                    }
                }
              setCurrentUserTranscription('');
              setCurrentAiTranscription('');
            }
          },
          onerror: (e: ErrorEvent) => updateError(e.message),
          onclose: (e: CloseEvent) => updateStatus('Session Closed.'),
        },
        config: {
          responseModalities: [Modality.AUDIO, Modality.TEXT],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction,
        },
      });
      sessionPromiseRef.current.catch((e) => updateError(e.message));
    } catch (e: any) {
      updateError(e.message);
    }
  }, [playAudio, stopAllPlayback, searchParams, user, toast, currentAiTranscription, currentUserTranscription]);
  
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      updateError("Gemini API Key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
      return;
    }

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
        inputNodeRef.current = inputAudioContextRef.current.createGain();
    }
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);
    }
    
    if (!clientRef.current) {
        clientRef.current = new GoogleGenAI({ apiKey });
    }
    
    setAudioNodesReady(true);
    startInterview();

    // Cleanup on component unmount
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      sessionPromiseRef.current?.then((session) => session.close());
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const startInterview = async () => {
    if (isInterviewing) return;
    if (!inputAudioContextRef.current || !inputNodeRef.current) {
        updateError("Audio context not ready.");
        return;
    }
    await inputAudioContextRef.current.resume();
    updateStatus('Requesting device access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      if (userVideoEl.current) { userVideoEl.current.srcObject = stream; userVideoEl.current.play(); }
      updateStatus('Access granted. Starting...');
      const inputCtx = inputAudioContextRef.current!;
      sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);
      sourceNodeRef.current.connect(inputNodeRef.current);
      const bufferSize = 4096;
      scriptProcessorNodeRef.current = inputCtx.createScriptProcessor(bufferSize, 1, 1);
      scriptProcessorNodeRef.current.onaudioprocess = (e) => {
        if (isInterviewing && !isMuted) {
            sessionPromiseRef.current?.then((s) => s.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) }));
        }
      };
      inputNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputCtx.destination);
      setIsInterviewing(true);
      updateStatus('🔴 Interview in progress...');
      initSession();
    } catch (err: any) {
      updateError(`Error starting interview: ${err.message}`);
      await endInterview();
    }
  };

  const endInterview = async () => {
    if (!isInterviewing && !mediaStreamRef.current) {
      router.push('/dashboard');
      return;
    }

    setIsInterviewing(false);
    updateStatus('Interview ended. Navigating to results...');

    const interviewId = params.interviewId as string;
    
    // Immediately navigate to the results page
    router.push(`/dashboard/interview/${interviewId}/results`);

    // Clean up media and audio resources in the background
    scriptProcessorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    if (userVideoEl.current) { userVideoEl.current.srcObject = null; }

    // Close the Gemini session
    sessionPromiseRef.current?.then((s) => s.close());

    // Save activity in the background
    if (user) {
        // Ensure there is at least one entry in the transcript to avoid empty analysis
        if (transcriptRef.current.length === 0) {
            transcriptRef.current.push({ speaker: 'ai', text: 'Interview ended prematurely.' });
        }

        const activity: InterviewActivity = {
            id: interviewId,
            type: 'interview',
            timestamp: new Date().toISOString(),
            transcript: transcriptRef.current,
            feedback: "Feedback will be generated on the results page.",
            details: {
                topic: searchParams.get('topic') || 'General',
                role: searchParams.get('role') || undefined,
                level: searchParams.get('level') || undefined,
                company: searchParams.get('company') || undefined,
            }
        };
        
        // This will now run without blocking navigation
        addActivity(user.uid, activity).catch(error => {
            console.error("Failed to save activity in background:", error);
            // Optionally, show a non-blocking toast notification about the save failure
            toast({
                title: "Could not save interview results",
                description: "There was an issue saving your interview data, but you can still view the results.",
                variant: "destructive"
            });
        });
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  }

  const toggleVideo = () => {
    const nextVideoOn = !isVideoOn;
    setIsVideoOn(nextVideoOn);
     if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(track => {
            track.enabled = nextVideoOn;
        });
    }
  }

  const captionText = currentAiTranscription || currentUserTranscription;

  return (
    <div className="meet-layout">
        <div id="status">
            <div className="flex items-center gap-4">
                <span>{error || status}</span>
                {isInterviewing && (
                <div className="font-mono bg-background/50 border rounded-full px-3 py-1 text-sm">
                    {formatTime(elapsedTime)}
                </div>
                )}
            </div>
        </div>
      <div className="main-view">
        <video id="user-video" className={isInterviewing ? 'active' : ''} ref={userVideoEl} muted playsInline></video>
        <div className={`captions-overlay ${captionText ? 'active' : ''}`}>
          {currentAiTranscription
            ? <><b>Kathy:</b> {currentAiTranscription}</>
            : <><b>You:</b> {currentUserTranscription}</>
          }
        </div>
      </div>
      <div className="control-bar">
        <Button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'} size="icon" className="w-14 h-14" variant={isMuted ? 'destructive' : 'secondary'}>
            {isMuted ? <MicOff /> : <Mic />}
        </Button>

         <Button onClick={toggleVideo} aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'} size="icon" className="w-14 h-14" variant={!isVideoOn ? 'destructive' : 'secondary'}>
            {isVideoOn ? <Video /> : <VideoOff />}
        </Button>

        <Button className="end-call w-14 h-14" onClick={endInterview} aria-label="End Interview">
           <Phone />
        </Button>
      </div>
    </div>
  );
}
