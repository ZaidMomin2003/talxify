
'use server';
/**
 * @fileOverview A conversational AI agent for conducting mock interviews.
 * This file defines a Genkit flow that acts as a real-time voice agent,
 * managing the conversation state, interacting with an LLM for responses,
 * and handling speech-to-text and text-to-speech services.
 *
 * - interviewAgent - The main flow function that sets up and runs the agent.
 * - InterviewState - The Zod schema defining the agent's conversational state.
 */

import { ai, genkit } from '@/ai/genkit';
import { z } from 'genkit';
import { defineFlow, run, startFlow } from 'genkit';
import { onFlow } from 'genkit/next';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { textToSpeechWithDeepgramFlow } from './deepgram-tts';
import { generateInterviewQuestions } from './generate-interview-questions';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY environment variable not set.');
}
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Define the state of the interview conversation
export const InterviewStateSchema = z.object({
  topic: z.string(),
  role: z.string(),
  level: z.string(),
  company: z.string().optional(),
  questions: z.array(z.string()),
  currentQuestionIndex: z.number().default(0),
  isFinished: z.boolean().default(false),
  turn: z.enum(['user', 'agent']).default('agent'),
});
export type InterviewState = z.infer<typeof InterviewStateSchema>;

// Define the prompt for the AI interviewer
const interviewerPrompt = ai.definePrompt({
  name: 'interviewerPrompt',
  system: `You are Kathy, an expert technical interviewer at Talxify. Your tone is professional, encouraging, and clear.
  You are conducting a mock interview for a candidate.

  - The interview topic is: {{topic}}
  - Role: {{role}}
  - Level: {{level}}
  {{#if company}}- The candidate is targeting: {{company}}{{/if}}

  Follow these instructions:
  1. Start with a brief greeting.
  2. Ask the questions provided to you one by one.
  3. After the user answers a question, provide a brief, encouraging acknowledgment like "Okay, thank you for sharing that" or "I see, thanks for the explanation."
  4. After the acknowledgment, immediately ask the next question.
  5. DO NOT provide feedback or corrections during the interview. Your role is to ask questions and listen.
  6. If the user's answer is very short or unclear, you can ask a simple follow-up like "Could you elaborate on that?" before moving on.
  7. When you have asked all the questions, end the interview by saying: "That's all the questions I have for now. Thank you for your time. Your feedback report will be generated shortly."
  
  Current Question: {{currentQuestion}}
  User's Answer: {{userAnswer}}
  `,
  input: {
    schema: z.object({
      topic: z.string(),
      role: z.string(),
      level: z.string(),
      company: z.string().optional(),
      currentQuestion: z.string(),
      userAnswer: z.string().optional(),
    }),
  },
});

export const interviewAgent = onFlow(
  {
    name: 'interviewAgent',
    inputSchema: z.object({
      topic: z.string(),
      role: z.string(),
      level: z.string(),
      company: z.string().optional(),
    }),
    outputSchema: z.void(),
    authPolicy: (auth, input) => {
      // In a real app, you would enforce authentication here.
      // if (!auth) {
      //   throw new Error("User must be authenticated.");
      // }
    },
  },
  async (payload) => {
    const state: InterviewState = { ...payload, questions: [], currentQuestionIndex: 0, isFinished: false, turn: 'agent' };
    
    // 1. Generate initial questions
    const questionResult = await run("generate-questions", () => generateInterviewQuestions(payload));
    state.questions = questionResult.questions.slice(0, 4); // Limit to 4 questions

    // 2. Start the conversation
    const greeting = `Hello, I'm Kathy, your interviewer today. We'll be discussing ${state.topic} for a ${state.level} ${state.role} role. Let's begin with your first question.`;
    
    startFlow.stream(async function* (websocket) {
      let finalTranscript = '';
      
      const sendAudio = async (text: string) => {
         const { audio } = await run('tts', () => textToSpeechWithDeepgramFlow({ text }));
         websocket.send({ type: 'audio', audio: audio.toString('base64') });
      }

      const connection = deepgram.listen.live({
        model: 'nova-2-general',
        interim_results: true,
        smart_format: true,
        endpointing: 250, // ms of silence to detect end of speech
        no_delay: true,
      });

      connection.on(LiveTranscriptionEvents.Open, async () => {
        console.log('Deepgram connection opened.');
        
        // Greet and ask the first question
        websocket.send({ type: 'agentState', state: 'speaking' });
        await sendAudio(greeting);
        const firstQuestion = state.questions[state.currentQuestionIndex];
        await sendAudio(firstQuestion);
        state.currentQuestionIndex++;
      });
      
      connection.on(LiveTranscriptionEvents.Close, () => console.log('Deepgram connection closed.'));
      connection.on(LiveTranscriptionEvents.Error, (err) => console.error('Deepgram error:', err));
      
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const text = data.channel.alternatives[0].transcript;
        if (text) {
          websocket.send({ type: 'transcript', text });
        }
        if (data.is_final) {
          finalTranscript += text + ' ';
        }
      });
      
      connection.on(LiveTranscriptionEvents.UtteranceEnd, async () => {
          if (!finalTranscript.trim()) return;

          const userAnswer = finalTranscript;
          finalTranscript = '';
          state.turn = 'agent';
          websocket.send({ type: 'agentState', state: 'thinking' });

          // If all questions are asked, end the interview.
          if (state.currentQuestionIndex >= state.questions.length) {
              const farewell = "That's all the questions I have for now. Thank you for your time. Your feedback report will be generated shortly.";
              await sendAudio(farewell);
              websocket.send({ type: 'interviewComplete', text: farewell });
              connection.finish();
              return;
          }

          // Generate acknowledgment and next question
          const llmResponse = await run("generate-response", async () => (await interviewerPrompt({
              ...state,
              currentQuestion: state.questions[state.currentQuestionIndex],
              userAnswer,
          })).text);
          
          await sendAudio(llmResponse);
          state.currentQuestionIndex++;
          state.turn = 'user';
          websocket.send({ type: 'agentState', state: 'listening' });
      });

      for await (const chunk of websocket) {
        if (connection.getReadyState() === 1 /* OPEN */) {
          connection.send(chunk);
        }
      }
    });
  }
);
