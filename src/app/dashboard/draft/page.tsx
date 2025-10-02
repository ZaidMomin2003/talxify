
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '@/lib/live-audio/utils';
import LiveAudioVisuals3D from './live-audio-visuals-3d';

type AppState = 'form' | 'interview';

const GdmLiveAudio = () => {
  const [appState, setAppState] = useState<AppState>('form');
  const [jobRole, setJobRole] = useState('');
  const [company, setCompany] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00');

  const clientRef = useRef<GoogleGenAI>();
  const sessionPromiseRef = useRef<Promise<any>>();
  const interviewStartTimeRef = useRef(0);
  const timerIntervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const inputAudioContextRef = useRef<AudioContext>();
  const outputAudioContextRef = useRef<AudioContext>();
  const [inputNode, setInputNode] = useState<GainNode | null>(null);
  const [outputNode, setOutputNode] = useState<GainNode | null>(null);
  
  const nextStartTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const initClient = useCallback(() => {
    if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        setInputNode(inputAudioContextRef.current.createGain());
    }
    if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const outNode = outputAudioContextRef.current.createGain();
        outNode.connect(outputAudioContextRef.current.destination);
        setOutputNode(outNode);
    }
    
    if (!clientRef.current) {
        clientRef.current = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
    }
  }, []);

  useEffect(() => {
    initClient();
  }, [initClient]);

  const updateStatus = (msg: string) => {
    setStatus(msg);
    if (msg) console.log(msg);
  };

  const updateError = (msg: string) => {
    setError(msg);
    if (msg) console.error(msg);
  };
  
  const endInterview = useCallback(async () => {
    if (!isRecording && !mediaStreamRef.current) return;
    updateStatus('Ending interview...');
    setIsRecording(false);

    if (timerIntervalIdRef.current) {
      clearInterval(timerIntervalIdRef.current);
      timerIntervalIdRef.current = null;
    }

    try {
      const session = await sessionPromiseRef.current;
      session?.close();
    } catch (e) {
      console.error('Error closing session', e);
    }
    
    if (scriptProcessorNodeRef.current && sourceNodeRef.current) {
      scriptProcessorNodeRef.current.disconnect();
      sourceNodeRef.current.disconnect();
      scriptProcessorNodeRef.current = null;
      sourceNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;

    setAppState('form');
    setJobRole('');
    setCompany('');
    setStatus('');
    setError('');
    setElapsedTime('00:00');
    interviewStartTimeRef.current = 0;
  }, [isRecording]);

  const startCapture = useCallback(async () => {
    if (isRecording) return;
    
    await inputAudioContextRef.current?.resume();
    updateStatus('Requesting media access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      updateStatus('Clarie is preparing for the interview...');
      
      sourceNodeRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
      sourceNodeRef.current.connect(inputNode!);

      scriptProcessorNodeRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
      scriptProcessorNodeRef.current.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecording) return;
        const pcmData = audioProcessingEvent.inputBuffer.getChannelData(0);
        sessionPromiseRef.current?.then((session) => {
          session.sendRealtimeInput({ media: createBlob(pcmData) });
        });
      };
      
      sourceNodeRef.current.connect(scriptProcessorNodeRef.current);
      scriptProcessorNodeRef.current.connect(inputAudioContextRef.current!.destination);

      setIsRecording(true);

    } catch (err) {
      console.error('Error starting capture:', err);
      updateError((err as Error).message);
      endInterview();
    }
  }, [inputNode, isRecording, endInterview]);

  const initSession = useCallback(async () => {
    if (!clientRef.current) return;
    
    const model = 'gemini-1.5-flash-latest';
    const systemInstruction = `Your name is Clarie. You are a senior hiring manager at "${company}" with over 10 years of experience in talent acquisition. You have a reputation for being insightful, encouraging, and highly professional. Your goal is to create a positive and supportive interview environment where candidates can showcase their best selves.

    You are interviewing a candidate for the role of "${jobRole}".

    Your tone should be warm, calm, and encouraging throughout the conversation.

    Start the interview by introducing yourself and your role, and then ask your first question.
    Keep your questions relevant to the role and your responses concise. Always wait for the user to finish speaking before you reply.`;

    try {
      sessionPromiseRef.current = clientRef.current.live.connect({
        model,
        callbacks: {
          onopen: () => updateStatus(''),
          onmessage: async (message: LiveServerMessage) => {
            if (status) updateStatus('');
            
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            if (audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(audio.data),
                outputAudioContextRef.current!,
                24000, 1
              );
              const source = outputAudioContextRef.current!.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode!);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => updateError(e.message),
          onclose: (e: CloseEvent) => updateStatus(''),
        },
        config: {
          responseModalities: ['AUDIO', 'TEXT'], // Request both to get text transcript
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction,
        },
      });
    } catch (e) {
      console.error(e);
      updateError((e as Error).message);
    }
  }, [company, jobRole, status, outputNode]);

  const startInterview = useCallback(async () => {
    if (!jobRole || !company) {
      updateError('Please fill out both role and company.');
      return;
    }
    setError('');
    setAppState('interview');
    await outputAudioContextRef.current?.resume();

    interviewStartTimeRef.current = Date.now();
    timerIntervalIdRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - interviewStartTimeRef.current) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
      const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);

    await initSession();
    await startCapture();
  }, [jobRole, company, initSession, startCapture]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMutedState;
      });
    }
  };

  const renderForm = () => (
    <div className="form-container">
      <div className="card">
        <h2>AI Interview Practice</h2>
        <input id="role" type="text" placeholder="Job Role (e.g., Software Engineer)" value={jobRole} onChange={e => setJobRole(e.target.value)} />
        <input id="company" type="text" placeholder="Company (e.g., Google)" value={company} onChange={e => setCompany(e.target.value)} />
        <button onClick={startInterview}>Start Interview</button>
      </div>
    </div>
  );
  
  const micOnIcon = <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ffffff"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35ZM280-200v-53q-93-22-151.5-95.5T70-520H150q0 88 56 153t144 75v52H280Zm400 0v-52q88-10 144-75T920-520h80q0 92-58.5 171.5T790-253v53H680ZM480-480Z"/></svg>;
  const micOffIcon = <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ffffff"><path d="m656-324-56-56q32-35 48.5-79.5T665-560H580v-80h85q0-75-43-134.5T503-840l-57-57q71-29 148-29q125 0 212.5 87.5T890-540v80q0 63-28.5 118.5T790-253l-74 53-60-54Zm-376 0L123-481q-22-24-34.5-52.5T76-600v-80q0-125 87.5-212.5T376-980q68 0 128 29l-55 55q-42-16-89-16-88 0-149 61.5T150-700v80q0 38 15.5 73.5T204-484l220 220-96-96-56 56Zm200 44L120-640v80h83l349 349-42 41Zm-80-80Z"/></svg>;
  const endCallIcon = <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#ffffff"><path d="M382-320q-88-1-150-63.5T169-534q-2-12-2.5-23.5T166-581q0-92 64-156.5T386-804q16-1 31 1.5t28 8.5L297-646q-16 19-14 44t21 41q26 26 62 40t73 17q4-1 7.5-1.5T480-600q105 0 182-73l57 56q-58 64-135 99.5T382-320Z"/></svg>;

  const renderInterview = () => (
    <>
      <div className="timer">{elapsedTime}</div>
      <video id="user-video" ref={videoRef} autoPlay muted playsInline></video>
      <div className="controls">
        <button id="muteButton" onClick={toggleMute}>
          {isMuted ? micOffIcon : micOnIcon}
        </button>
        <button id="endButton" className="end-call" onClick={endInterview}>
          {endCallIcon}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#100c14' }}>
      {appState === 'form' && renderForm()}
      {appState === 'interview' && renderInterview()}
      
      <div id="messages">
        {error && <div className="error-message">{error}</div>}
        {!error && status && <div className="status-message">{status}</div>}
      </div>

      <LiveAudioVisuals3D inputNode={inputNode} outputNode={outputNode} />
      
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'SF Pro Text', 'SF Pro Icons', 'Helvetica Neue', 'Helvetica',
            'Arial', sans-serif;
          background-color: #100c14;
          color: white;
        }

        #messages {
          position: absolute;
          bottom: 15vh;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          text-align: center;
          max-width: 80%;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .error-message,
        .status-message {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 16px;
          animation: fadeIn 0.5s ease-in-out;
        }

        .error-message {
          background: rgba(255, 76, 76, 0.5);
          color: white;
        }

        .status-message {
          background: rgba(0, 0, 0, 0.3);
          color: white;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .controls {
          z-index: 10;
          position: absolute;
          bottom: 5vh;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .controls button {
          outline: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          width: 64px;
          height: 64px;
          cursor: pointer;
          font-size: 24px;
          padding: 0;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .controls button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .controls button.end-call {
          background-color: #ff4c4c;
        }
        .controls button.end-call:hover {
          background-color: #ff6a6a;
        }

        .form-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .card {
          background: rgba(40, 40, 40, 0.8);
          padding: 30px 40px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          width: 400px;
          text-align: center;
        }

        .card h2 {
          margin-top: 0;
        }

        .card input {
          width: calc(100% - 20px);
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 8px;
          border: 1px solid #555;
          background: #333;
          color: white;
          font-size: 16px;
        }

        .card button {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: #4a90e2;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .card button:hover {
          background: #5aa1f2;
        }

        #user-video {
          position: absolute;
          bottom: 5vh;
          right: 2vw;
          width: 20vw;
          max-width: 250px;
          height: auto;
          aspect-ratio: 4 / 3;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          object-fit: cover;
          transform: scaleX(-1); /* Mirror effect */
          z-index: 5;
        }

        .timer {
          position: absolute;
          top: 2vh;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 16px;
          font-family: 'monospace', monospace;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default GdmLiveAudio;
