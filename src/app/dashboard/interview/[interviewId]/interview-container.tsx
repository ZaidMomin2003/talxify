
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useMeeting, usePubSub } from '@videosdk.live/react-sdk';
import { useSearchParams } from 'next/navigation';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { textToSpeech, TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { speechToText, SpeechToTextInput } from '@/ai/flows/speech-to-text';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { addActivity } from '@/lib/firebase-service';
import type { InterviewActivity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, MicOff, Video, VideoOff, Phone, Loader2, MessageSquare, Bot } from 'lucide-react';
import { MessageData } from 'genkit/model';
import type { InterviewState } from '@/lib/interview-types';

type TranscriptEntry = {
  speaker: 'user' | 'ai';
  text: string;
};

export function InterviewContainer({ interviewId }: { interviewId: string }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [interviewState, setInterviewState] = useState<InterviewState>({
    interviewId: interviewId,
    topic: searchParams.get('topic') || 'general',
    level: searchParams.get('level') || 'entry-level',
    role: searchParams.get('role') || 'Software Engineer',
    history: [],
    questionsAsked: 0,
    isComplete: false,
  });

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { join, leave, toggleMic, toggleWebcam, localWebcamOn, localMicOn } = useMeeting();

  const processUserSpeech = useCallback(async (audioBlob: Blob) => {
      setIsRecording(false);
      setIsUserSpeaking(false);
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (!base64Audio) return;

          try {
              const { transcript: userTranscript } = await speechToText({ audioDataUri: base64Audio });
              if (userTranscript) {
                  setTranscript(prev => [...prev, { speaker: 'user', text: userTranscript }]);
                  
                  const newHistory: MessageData[] = [...interviewState.history, { role: 'user', content: [{ text: userTranscript }] }];
                  const updatedState = { ...interviewState, history: newHistory };
                  
                  // Get AI response
                  const aiResult = await generateInterviewResponse(updatedState);
                  setInterviewState(aiResult.newState);
                  setTranscript(prev => [...prev, { speaker: 'ai', text: aiResult.response }]);
                  
                  // Convert AI response to speech
                  const { audioDataUri } = await textToSpeech({ text: aiResult.response });
                  if (audioPlayerRef.current) {
                      setIsAiSpeaking(true);
                      audioPlayerRef.current.src = audioDataUri;
                      audioPlayerRef.current.play();
                  }

                  if (aiResult.newState.isComplete) {
                     // End of interview logic
                    if(user){
                       const finalTranscript = transcript.map(t => ({speaker: t.speaker, text: t.text}));
                       const interviewActivity: InterviewActivity = {
                            id: interviewId,
                            type: 'interview',
                            timestamp: new Date().toISOString(),
                            transcript: finalTranscript,
                            feedback: aiResult.response, // The final response is the feedback
                            details: {
                                topic: interviewState.topic,
                                role: interviewState.role,
                                level: interviewState.level,
                            }
                       }
                       await addActivity(user.uid, interviewActivity);
                    }
                    setTimeout(() => setIsSessionActive(false), 5000);
                  }
              }
          } catch (error) {
              console.error("Error processing speech:", error);
              toast({ variant: "destructive", title: "Transcription Error", description: "Could not process your audio." });
          }
      };
  }, [interviewState, toast, user, interviewId, transcript]);
  
  const startRecording = useCallback(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = event => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    processUserSpeech(audioBlob);
                    audioChunksRef.current = [];
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            })
            .catch(err => console.error("Mic access error:", err));
    }
  }, [processUserSpeech]);


  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);


  // VAD logic - simplified for demo
  useEffect(() => {
    let silenceTimeout: NodeJS.Timeout;
    if(isSessionActive && !isAiSpeaking) {
        // This is a simplified VAD. A real implementation would analyze the audio stream.
        // For now, we use a button to start/stop recording.
    }

    return () => clearTimeout(silenceTimeout);
  }, [isAiSpeaking, isUserSpeaking, stopRecording, isSessionActive]);


  useEffect(() => {
      const player = audioPlayerRef.current;
      if (!player) return;

      const handleAudioEnd = () => {
          setIsAiSpeaking(false);
      };

      player.addEventListener('ended', handleAudioEnd);
      return () => player.removeEventListener('ended', handleAudioEnd);
  }, []);

  const startSession = async () => {
    join();
    setIsSessionActive(true);
    try {
        const result = await generateInterviewResponse(interviewState);
        setInterviewState(result.newState);
        setTranscript(prev => [...prev, { speaker: 'ai', text: result.response }]);
        const { audioDataUri } = await textToSpeech({ text: result.response });
        if (audioPlayerRef.current) {
            setIsAiSpeaking(true);
            audioPlayerRef.current.src = audioDataUri;
            audioPlayerRef.current.play();
        }
    } catch (error) {
         console.error("Failed to start interview:", error);
         toast({ variant: "destructive", title: "Interview Start Error", description: "Could not start the interview session." });
         setIsSessionActive(false);
    }
  }

  const handleToggleRecording = () => {
    if(isRecording) {
        stopRecording();
        setIsUserSpeaking(false);
    } else {
        startRecording();
        setIsUserSpeaking(true);
    }
  }


  if (!isSessionActive) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Card className="max-w-lg text-center">
            <CardHeader>
              <CardTitle>Ready for your mock interview?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Click the button below to start your session. Make sure your microphone is enabled.
              </p>
              <Button onClick={startSession} size="lg">Start Session</Button>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col p-4 gap-4">
        <audio ref={audioPlayerRef} hidden />
        
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main content - User Video */}
            <div className="md:col-span-2 bg-muted rounded-lg overflow-hidden relative">
                <video
                    ref={(ref) => ref && ref.setAttribute('playsinline', 'true')}
                    autoPlay
                    className="w-full h-full object-cover"
                />
                 {!localWebcamOn && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <VideoOff className="w-16 h-16 mb-4"/>
                        <p>Your camera is off</p>
                    </div>
                )}
            </div>

            {/* Side Panel - Transcript & AI status */}
            <div className="flex flex-col gap-4">
                <Card className="flex-grow flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare/> Transcript</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto">
                        <div className="space-y-4">
                            {transcript.map((entry, index) => (
                                <div key={index} className={`flex gap-2 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${entry.speaker === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        <p className="text-sm">{entry.text}</p>
                                    </div>
                                </div>
                            ))}
                             {isAiSpeaking && <div className="flex justify-start"><Loader2 className="h-5 w-5 animate-spin"/></div>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                       {isAiSpeaking ? (
                           <div className="flex items-center justify-center gap-2 text-primary">
                               <Bot className="h-5 w-5" />
                               <span>AI is speaking...</span>
                           </div>
                       ) : isUserSpeaking ? (
                            <div className="flex items-center justify-center gap-2 text-green-500">
                                <Mic className="h-5 w-5" />
                               <span>Listening...</span>
                           </div>
                       ) : (
                           <span className="text-muted-foreground">AI is waiting for your response.</span>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 flex justify-center items-center gap-4">
            <Button onClick={toggleWebcam} variant={localWebcamOn ? "secondary" : "destructive"} size="icon" className="rounded-full h-12 w-12">
                {localWebcamOn ? <Video /> : <VideoOff />}
            </Button>
            <Button onClick={handleToggleRecording} size="icon" className={`rounded-full h-16 w-16 transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-green-500 hover:bg-green-600'}`}>
                {isRecording ? <MicOff /> : <Mic />}
            </Button>
            <Button onClick={leave} variant="destructive" size="icon" className="rounded-full h-12 w-12">
                <Phone />
            </Button>
        </div>
    </div>
  );
}
