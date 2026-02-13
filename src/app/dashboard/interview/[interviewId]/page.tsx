'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Phone, BrainCircuit, Loader2, Play, Radio, Signal, Cpu, Activity, User as UserIcon } from 'lucide-react';
import { addActivity, checkAndIncrementUsage, updateUserFromIcebreaker } from '@/lib/firebase-service';
import { useAuth } from '@/context/auth-context';
import type { InterviewActivity, TranscriptEntry, UsageType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GoogleGenAI, LiveServerMessage, Modality, Session } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '@/lib/utils';
import { extractIcebreakerInfo } from '@/ai/flows/extract-icebreaker-info';
import { interviewerPersonalities } from '@/lib/interviewer-personalities';
import { motion, AnimatePresence } from 'framer-motion';


// --- Memoized Sub-components for better performance ---
const InterviewHeader = React.memo(({ status, isInterviewing }: { status: string; isInterviewing: boolean }) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-6 left-6 z-50 flex items-center gap-4"
    >
      <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-4 py-2 backdrop-blur-xl shadow-xl">
        <div className="relative flex items-center justify-center">
          <div className={cn("w-2 h-2 rounded-full", status.toLowerCase().includes('your turn') ? 'bg-red-500 animate-pulse' : (status.toLowerCase().includes('error') ? 'bg-destructive' : 'bg-green-500'))} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">{status}</span>
        {isInterviewing && <Timer />}
      </div>
    </motion.div>
  );
});
InterviewHeader.displayName = 'InterviewHeader';

const Timer = React.memo(() => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return <span className="text-[11px] font-mono text-white/40 border-l border-white/10 pl-3 ml-1">{formatTime(elapsedTime)}</span>;
});
Timer.displayName = 'Timer';

const AIPanel = React.memo(({ characterName, isAISpeaking }: { characterName: string, isAISpeaking: boolean; }) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl h-[70vh] bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner group transition-all duration-500 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-20" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className={cn(
            "relative flex items-center justify-center w-56 h-56 rounded-full transition-all duration-700",
            isAISpeaking ? 'scale-105' : 'scale-100'
          )}>
            {/* Soft Glow */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-primary/20 blur-3xl transition-all duration-1000",
              isAISpeaking ? 'opacity-100' : 'opacity-0'
            )} />

            <Avatar className={cn(
              "w-full h-full border-4 border-zinc-800 transition-all duration-500",
              isAISpeaking && "border-primary/40 shadow-[0_0_40px_rgba(var(--primary),0.2)]"
            )}>
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white">
                <BrainCircuit className={cn("w-20 h-20 transition-all duration-500", isAISpeaking ? "text-primary scale-110" : "text-zinc-500")} />
              </div>
            </Avatar>

            {/* Speaking Waveform (Simple) */}
            {isAISpeaking && (
              <div className="absolute -bottom-4 flex gap-1 h-8 items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-primary rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-3xl font-bold tracking-tight text-white">{characterName}</p>
          <p className="text-zinc-500 font-medium">Interviewer</p>
        </div>
      </div>
    </div>
  );
});
AIPanel.displayName = 'AIPanel';

const UserVideo = React.memo(({ videoRef, isVideoOn }: { videoRef: React.RefObject<HTMLVideoElement>; isVideoOn: boolean; }) => {
  return (
    <div className={cn(
      "absolute bottom-24 right-8 w-72 h-44 rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl z-40 transition-all duration-500",
      !isVideoOn && "flex items-center justify-center"
    )}>
      <video
        ref={videoRef}
        muted
        playsInline
        className={cn(
          "w-full h-full object-cover transform -scale-x-100",
          !isVideoOn && "hidden"
        )}
      ></video>
      {!isVideoOn && (
        <div className="flex flex-col items-center gap-2">
          <Avatar className="w-16 h-16 border-2 border-zinc-800">
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
              <UserIcon className="w-8 h-8" />
            </div>
          </Avatar>
        </div>
      )}

      {/* Name Tag */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/5 text-[10px] text-white/80 font-medium">
        You
      </div>
    </div>
  );
});
UserVideo.displayName = 'UserVideo';

const ControlBar = React.memo(({ onMuteToggle, onVideoToggle, onEndCall, isMuted, isVideoOn, isSessionLive }: {
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
  isMuted: boolean;
  isVideoOn: boolean;
  isSessionLive: boolean;
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 backdrop-blur-2xl bg-zinc-900/80 border border-white/10 p-2 rounded-2xl shadow-2xl"
    >
      <Button
        onClick={onMuteToggle}
        size="icon"
        variant="ghost"
        className={cn("w-12 h-12 rounded-xl transition-all", isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-white hover:bg-white/5')}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      <Button
        onClick={onVideoToggle}
        size="icon"
        variant="ghost"
        className={cn("w-12 h-12 rounded-xl transition-all", !isVideoOn ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-white hover:bg-white/5')}
      >
        {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </Button>

      <div className="w-[1px] h-8 bg-white/10 mx-2" />

      <Button
        onClick={onEndCall}
        className="h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg"
        disabled={!isSessionLive}
      >
        <Phone className="mr-2 w-4 h-4 fill-current rotate-[135deg]" />
        Leave Call
      </Button>
    </motion.div>
  );
});
ControlBar.displayName = 'ControlBar';


export default function LiveInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const character = useMemo(() => {
    const charId = searchParams.get('character') || interviewerPersonalities[0].id;
    return interviewerPersonalities.find(p => p.id === charId) || interviewerPersonalities[0];
  }, [searchParams]);

  const [isInterviewing, setIsInterviewing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const candidateName = useRef<string | null>(null);

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userVideoEl = useRef<HTMLVideoElement>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);

  const nextAudioStartTimeRef = useRef(0);
  const audioBufferSources = useRef(new Set<AudioBufferSourceNode>());
  // We no longer need timerIntervalRef or elapsedTime here as it's handled by the Timer component

  const getSystemInstruction = useCallback((stage: 'icebreaker' | 'main' = 'icebreaker', userName: string | null = null, skills: string[] = []) => {
    const topic = searchParams.get('topic') || 'general software engineering';
    const role = searchParams.get('role') || 'Software Engineer';
    const company = searchParams.get('company') || undefined;

    let baseInstruction = character.systemInstruction;
    const candidateDisplayName = userName || user?.displayName || 'Candidate';

    if (stage === 'icebreaker') {
      return `${baseInstruction} Your first task is to start the interview with a friendly icebreaker. You MUST speak first. Start by saying "Hello, ${candidateDisplayName}" and then ask the candidate to briefly introduce themselves, including their name, skills, and hobbies. Keep your introduction very brief and direct.`;
    }

    // After icebreaker
    const skillText = skills.length > 0 ? `The candidate mentioned skills in: ${skills.join(', ')}.` : '';
    let instruction = `${baseInstruction} You are continuing an interview with ${candidateDisplayName}. ${skillText} You must follow this multi-stage interview format precisely:
1.  **Skill Follow-up (1 question):** Ask one simple, open-ended question related to their stated skills.
2.  **Behavioral Section (2 questions):** Ask two linked behavioral questions (e.g., "Tell me about a difficult project," followed by "How did you handle disagreements with your team on that project?"). After each user response, provide a brief, natural conversational comment like "Thanks for sharing that" or "That's an interesting approach" before asking the next question.
3.  **Technical Section (2 questions):** Present two situational technical problems (e.g., "Imagine our user database is slow. How would you diagnose the issue?").
4.  **Conclusion (1 response):** After the final technical question, you must end the interview. Provide a brief, encouraging verbal summary of their performance. Mention one specific strength you observed and one area for improvement. Do not ask any more questions. End by saying "That's all the questions I have for you. Thank you for your time."`;

    return instruction;
  }, [searchParams, character, user]);

  const handleTurnComplete = useCallback(async () => {
    setIsAISpeaking(false);
    // This block runs after the user has finished speaking their first turn (the introduction).
    const topic = searchParams.get('topic') || '';
    if (topic.toLowerCase().includes('icebreaker') && transcriptRef.current.length === 2 && !candidateName.current) {
      setStatus("Analyzing introduction...");
      const userIntroText = transcriptRef.current.find(t => t.speaker === 'user')?.text || '';

      if (userIntroText) {
        const icebreakerData = await extractIcebreakerInfo(userIntroText);
        if (icebreakerData.isIcebreaker) {
          if (icebreakerData.name) {
            candidateName.current = icebreakerData.name;
            toast({ title: `Nice to meet you, ${icebreakerData.name}!` });
          }
          if (user) {
            await updateUserFromIcebreaker(user.uid, icebreakerData);
          }
          // Re-initialize session with the main interview flow
          await session?.reinitialize({ systemInstruction: getSystemInstruction('main', icebreakerData.name, icebreakerData.skills || []) });
          return; // Return early to let the re-initialized session take over
        }
      }

      // Fallback if icebreaker extraction fails
      await session?.reinitialize({ systemInstruction: getSystemInstruction('main', null, []) });

    }
    setStatus("🔴 Your turn... Speak now.");
  }, [getSystemInstruction, session, toast, user, searchParams]);

  useEffect(() => {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
    outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
    outputGainNodeRef.current = outputAudioContextRef.current.createGain();
    outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);

    const playAudio = async (base64Audio: string) => {
      const audioContext = outputAudioContextRef.current;
      const gainNode = outputGainNodeRef.current;
      if (!audioContext || !gainNode) return;

      if (audioContext.state === 'suspended') await audioContext.resume();

      const nextStartTime = Math.max(nextAudioStartTimeRef.current, audioContext.currentTime);

      try {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.onended = () => {
          audioBufferSources.current.delete(source);
          if (audioBufferSources.current.size === 0) {
            setIsAISpeaking(false);
          }
        };
        source.start(nextStartTime);
        nextAudioStartTimeRef.current = nextStartTime + audioBuffer.duration;
        audioBufferSources.current.add(source);
        setIsAISpeaking(true);
      } catch (e) {
        console.error("Error playing audio:", e);
      }
    };

    const stopAllPlayback = () => {
      for (const source of audioBufferSources.current.values()) {
        source.stop();
      }
      audioBufferSources.current.clear();
      nextAudioStartTimeRef.current = 0;
      setIsAISpeaking(false);
    };

    const initSession = async () => {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        setStatus("Error: Gemini API Key not configured.");
        return;
      }
      const client = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      setStatus('Connecting to AI...');

      try {
        const newSession = await client.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => setStatus('Ready to start'),
            onmessage: (message: LiveServerMessage) => {
              if (message.serverContent?.interrupted) stopAllPlayback();

              const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
              if (audio) {
                playAudio(audio.data);
                setStatus(`${character.name} is speaking...`);
              }

              const lastEntry = transcriptRef.current[transcriptRef.current.length - 1];

              if (message.serverContent?.outputTranscription) {
                const newText = message.serverContent.outputTranscription.text;
                if (lastEntry?.speaker === 'ai' && message.serverContent.outputTranscription.partial) {
                  // This is a partial update to the AI's speech, we don't add to transcript yet.
                } else if (lastEntry?.speaker === 'ai' && !message.serverContent.outputTranscription.partial) {
                  lastEntry.text += ` ${newText}`;
                } else if (!lastEntry || lastEntry.speaker !== 'ai') {
                  transcriptRef.current.push({ speaker: 'ai', text: newText });
                }
              }

              if (message.serverContent?.inputTranscription) {
                const newText = message.serverContent.inputTranscription.text;
                setStatus("🔴 Your turn... Speak now.");
                if (lastEntry?.speaker === 'user' && message.serverContent.inputTranscription.partial) {
                  // This is a partial update to the user's speech
                } else if (lastEntry?.speaker === 'user' && !message.serverContent.inputTranscription.partial) {
                  lastEntry.text += ` ${newText}`;
                } else if (!lastEntry || lastEntry.speaker !== 'user') {
                  transcriptRef.current.push({ speaker: 'user', text: newText });
                }
              }

              if (message.serverContent?.turnComplete) {
                handleTurnComplete();
              }
            },
            onerror: (e) => {
              let errorMessage = 'An unknown error occurred';
              if (e instanceof CloseEvent) errorMessage = `Session closed unexpectedly. Code: ${e.code}, Reason: ${e.reason}`;
              else if (e instanceof Error) errorMessage = e.message;
              else errorMessage = JSON.stringify(e);
              setStatus(`Error: ${errorMessage}`);
              console.error("Session Error:", e);
            },
            onclose: (e) => setStatus('Session Closed: ' + e.reason),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: character.voiceName } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: getSystemInstruction(),
            contextWindowCompression: { slidingWindow: {} },
            temperature: 0.3
          },
        });
        setSession(newSession);
      } catch (e: any) {
        console.error("Connection to Gemini failed:", e);
        setStatus(`Error: ${e.message}`);
      }
    };

    initSession();

    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      session?.close();
      inputAudioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character]);


  const startInterview = useCallback(async () => {
    if (isInterviewing || !session) {
      return;
    }
    if (!user) {
      toast({ title: 'Not Logged In', description: 'Please log in to start an interview.', variant: 'destructive' });
      router.push('/login');
      return;
    }

    const usage = await checkAndIncrementUsage(user.uid, 'interview');
    if (!usage.success) {
      toast({ title: 'Usage Limit Reached', description: usage.message, variant: 'destructive' });
      router.push('/dashboard/pricing');
      return;
    }

    await inputAudioContextRef.current?.resume();
    await outputAudioContextRef.current?.resume();

    setStatus('Requesting device access...');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'Your browser does not support media recording or you are not on a secure connection (HTTPS).';
      setStatus(`Error: ${errorMsg}`);
      toast({ title: 'Device Error', description: errorMsg, variant: 'destructive' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: true
      });
      mediaStreamRef.current = stream;

      if (userVideoEl.current) {
        userVideoEl.current.srcObject = stream;
        userVideoEl.current.play();
      }

      const inputCtx = inputAudioContextRef.current!;
      sourceNodeRef.current = inputCtx.createMediaStreamSource(stream);

      const bufferSize = 4096;
      scriptProcessorNodeRef.current = inputCtx.createScriptProcessor(bufferSize, 1, 1);

      scriptProcessorNodeRef.current.onaudioprocess = (event) => {
        if (session) {
          const pcmData = event.inputBuffer.getChannelData(0);
          session.sendRealtimeInput({ media: createBlob(pcmData) });
        }
      };

      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputCtx.destination);

      setIsInterviewing(true);

    } catch (err: any) {
      let friendlyMessage = err.message || 'Failed to start interview devices.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMessage = 'Microphone or camera access denied. Please click the camera icon in your address bar to allow access and refresh.';
        setStatus('Permission Denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMessage = 'No microphone or camera found. Please connect your devices and try again.';
        setStatus('Hardware Not Found');
      } else {
        setStatus(`Error starting interview: ${err.message}`);
      }

      toast({
        title: 'Device Access Error',
        description: friendlyMessage,
        variant: 'destructive',
      });
      console.error('Error starting interview:', err);
    }
  }, [session, user, toast, router, isInterviewing]);

  const endSession = useCallback(async (shouldNavigate = true) => {
    setIsInterviewing(false);
    if (shouldNavigate) setStatus('Interview ended. Saving transcript...');

    session?.close();
    setSession(null);

    scriptProcessorNodeRef.current?.disconnect();
    sourceNodeRef.current?.disconnect();

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    if (userVideoEl.current) userVideoEl.current.srcObject = null;

    if (shouldNavigate && user) {

      const interviewId = params.interviewId as string;

      const details: InterviewActivity['details'] = {
        topic: searchParams.get('topic') || 'General',
      };

      const role = searchParams.get('role');
      const level = searchParams.get('level');
      const company = searchParams.get('company');

      if (role) details.role = role;
      if (level) details.level = level;
      if (company) details.company = company;

      const activity: InterviewActivity = {
        id: interviewId,
        type: 'interview',
        timestamp: new Date().toISOString(),
        transcript: transcriptRef.current,
        feedback: "Feedback has not been generated for this interview.",
        details: details,
      };

      try {
        await addActivity(user.uid, activity);
        router.push(`/dashboard/interview/${interviewId}/results`);
      } catch (error: any) {
        console.error("Failed to save activity:", error);
        toast({
          title: "Could not save interview results",
          description: `There was an error saving your interview: ${error.message}. Please check your dashboard later.`,
          variant: "destructive"
        });
        router.push('/dashboard');
      }
    }
  }, [user, router, toast, session, params.interviewId, searchParams]);


  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => { track.enabled = !nextMuted; });
    }
  }, [isMuted])

  const toggleVideo = useCallback(() => {
    const nextVideoOn = !isVideoOn;
    setIsVideoOn(nextVideoOn);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => { track.enabled = nextVideoOn; });
    }
  }, [isVideoOn])

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#0a0a0a] overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/2 blur-[120px] pointer-events-none" />

      <InterviewHeader status={status} isInterviewing={isInterviewing} />

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-8">
        <AIPanel characterName={character.name} isAISpeaking={isAISpeaking} />

        {!isInterviewing && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-12 z-30 flex flex-col items-center gap-6"
          >
            <div className="text-center space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-white">Join Interview</h2>
              <p className="text-zinc-500 text-sm">Review your audio and video settings before joining the meeting.</p>
            </div>

            <Button
              onClick={startInterview}
              size="lg"
              className="h-14 rounded-xl px-10 bg-primary text-black font-bold text-lg hover:scale-105 transition-all shadow-xl"
              disabled={!session || isInterviewing}
            >
              {!session ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Enter MatchRoom'
              )}
            </Button>
          </motion.div>
        )}
      </main>

      {isInterviewing && (
        <UserVideo videoRef={userVideoEl} isVideoOn={isVideoOn} />
      )}

      <AnimatePresence>
        {isInterviewing && (
          <ControlBar
            onMuteToggle={toggleMute}
            onVideoToggle={toggleVideo}
            onEndCall={() => endSession()}
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            isSessionLive={isInterviewing}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
