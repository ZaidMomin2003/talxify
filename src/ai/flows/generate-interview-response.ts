
'use server';

/**
 * @fileOverview A flow to generate conversational responses for a mock interview using Groq and Deepgram.
 * This flow is designed for a streaming, low-latency setup.
 */
import { Groq } from 'groq-sdk';
import { createClient } from '@deepgram/sdk';
import type { LiveClient } from '@deepgram/sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables.');
}
if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

interface InterviewState {
  interviewId: string;
  topic: string;
  level: string;
  role: string;
  company?: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  questionsAsked: number;
  isComplete: boolean;
}

const MAX_QUESTIONS = 7; // Approx 6-8 questions total

export async function handleInterviewStream(ws: any) {
  let interviewState: InterviewState | null = null;
  let ttsConnection: LiveClient | null = null;

  const getSystemPrompt = (state: InterviewState) => `
    You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview that lasts about ${MAX_QUESTIONS} questions.
    The candidate is interviewing for a ${state.level} ${state.role} role. The main technical topic is: ${state.topic}.
    ${state.company ? `The interview is tailored for ${state.company}. Adapt your style accordingly (e.g., STAR method for Amazon, open-ended problem-solving for Google).` : ''}

    Conversation Rules:
    1.  Start with a brief, friendly greeting.
    2.  Ask ONE main question at a time. The questions must be relevant to the topic, role, and level.
    3.  After the user answers, provide a very brief, encouraging acknowledgment (e.g., "Good approach," "Thanks, that makes sense.") before immediately asking the next question.
    4.  Keep your responses concise and conversational.
    5.  After you have asked ${MAX_QUESTIONS} questions and the user has responded, you MUST conclude the interview.
    6.  The final message must be a harsh but fair and realistic review of the user's performance based on the entire conversation. Start with "Okay, that's all the questions I have. Here's my feedback...". Provide specific examples of their strengths and weaknesses. Be direct and constructive.
    7.  Do not say "goodbye" or other pleasantries in the final review. Just give the feedback and end.
  `;
  
  const connectToDeepgramTTS = () => {
    ttsConnection = deepgram.speak.live({
        model: 'aura-asteria-en',
        encoding: 'mp3',
        sample_rate: 24000,
        container: 'wave',
    });

    ttsConnection.on('open', () => console.log('Deepgram TTS connection opened.'));
    ttsConnection.on('error', (e) => console.error('Deepgram TTS error:', e));
    ttsConnection.on('close', () => console.log('Deepgram TTS connection closed.'));
    ttsConnection.on('message', (message) => {
        const audioData = message.data;
        if (audioData) {
            ws.send(JSON.stringify({ type: 'ai_audio', audio: Array.from(audioData) }));
        }
    });
  };

  const processAndRespond = async () => {
    if (!interviewState || !ttsConnection) return;

    try {
        const stream = await groq.chat.completions.create({
            model: 'llama3-70b-8192',
            messages: [
                { role: 'system', content: getSystemPrompt(interviewState) },
                ...interviewState.history
            ],
            stream: true,
        });
        
        let fullResponse = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                ttsConnection.send(content);
            }
        }

        interviewState.history.push({ role: 'assistant', content: fullResponse });
        
        // Send the full text for transcript purposes
        ws.send(JSON.stringify({ type: 'ai_text', text: fullResponse }));

        if (interviewState.questionsAsked < MAX_QUESTIONS) {
             interviewState.questionsAsked++;
        } else {
             interviewState.isComplete = true;
             ws.send(JSON.stringify({ type: 'interview_complete' }));
             if (ttsConnection) ttsConnection.finish();
        }

    } catch (error) {
        console.error("Error with Groq or Deepgram:", error);
    }
  };
  
  // WebSocket message handler
  ws.on('message', async (message: string) => {
    const data = JSON.parse(message);
    
    if (data.type === 'start_interview') {
        interviewState = {
            ...data.config,
            history: [],
            questionsAsked: 0,
            isComplete: false,
        };
        connectToDeepgramTTS();
        // Wait for TTS connection to open before sending first message
        setTimeout(processAndRespond, 1000); 
    }

    if (data.type === 'user_speech') {
        if (interviewState && !interviewState.isComplete) {
            interviewState.history.push({ role: 'user', content: data.text });
            await processAndRespond();
        }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from interview stream.');
    if (ttsConnection) {
        ttsConnection.finish();
    }
  });
}
