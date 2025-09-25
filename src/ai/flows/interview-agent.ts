
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

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { run } from 'genkit';
import { onFlow } from '@genkit-ai/next';
import { textToSpeechWithDeepgramFlow } from './deepgram-tts';
import { generateInterviewQuestions } from './generate-interview-questions';

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
  history: z.array(z.object({ role: z.enum(['user', 'model']), parts: z.array(z.object({ text: z.string() })) })).default([]),
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
  1. Start with a brief greeting and ask the first question.
  2. After the user answers a question, provide a brief, encouraging acknowledgment like "Okay, thank you for sharing that" or "I see, thanks for the explanation."
  3. After the acknowledgment, immediately ask the next question from your list.
  4. DO NOT provide feedback or corrections during the interview. Your role is to ask questions and listen.
  5. If the user's answer is very short or unclear, you can ask a simple follow-up like "Could you elaborate on that?" before moving on.
  6. When you have asked all the questions, end the interview by saying: "That's all the questions I have for now. Thank you for your time. Your feedback report will be generated shortly."
  
  You have already asked {{askedCount}} questions. Now, ask question number {{nextQuestionIndex}} which is: "{{nextQuestion}}".
  `,
  input: {
    schema: z.object({
      topic: z.string(),
      role: z.string(),
      level: z.string(),
      company: z.string().optional(),
      askedCount: z.number(),
      nextQuestionIndex: z.number(),
      nextQuestion: z.string(),
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
    },
    stream: true,
  },
  async function* (payload, streamingCallback) {
    // 1. Initialize State
    let state: InterviewState = {
      ...payload,
      questions: [],
      currentQuestionIndex: 0,
      isFinished: false,
      turn: 'agent',
      history: [],
    };

    try {
      // 2. Generate initial questions
      const questionResult = await run("generate-questions", () => generateInterviewQuestions(payload));
      state.questions = questionResult.questions.slice(0, 4); // Limit to 4 questions
      if (state.questions.length === 0) {
        throw new Error("Failed to generate interview questions.");
      }

      // 3. Greet the user and ask the first question
      const greeting = `Hello, I'm Kathy, your interviewer today. We'll be discussing ${state.topic} for a ${state.level} ${state.role} role. Let's begin with your first question.`;
      yield { type: 'agentResponse', text: greeting };

      const firstQuestion = state.questions[0];
      yield { type: 'agentResponse', text: firstQuestion };
      
      state.turn = 'user';
      yield { type: 'agentState', state: 'listening' };

      // 4. Main conversation loop
      for await (const chunk of this.stream()) {
          if (chunk.type === 'userTranscript') {
              const userAnswer = chunk.transcript;
              state.history.push({ role: 'user', parts: [{ text: userAnswer }] });
              state.turn = 'agent';
              yield { type: 'agentState', state: 'thinking' };

              state.currentQuestionIndex++;
              
              if (state.currentQuestionIndex >= state.questions.length) {
                  // End of interview
                  state.isFinished = true;
                  const farewell = "That's all the questions I have for now. Thank you for your time. Your feedback report will be generated shortly.";
                  yield { type: 'interviewComplete', text: farewell };
                  break; // Exit loop
              } else {
                  // Acknowledge and ask the next question
                  const llmResponse = await run("generate-response", async () => (await interviewerPrompt({
                      ...state,
                      askedCount: state.currentQuestionIndex,
                      nextQuestionIndex: state.currentQuestionIndex + 1,
                      nextQuestion: state.questions[state.currentQuestionIndex],
                  })).text);

                  state.history.push({ role: 'model', parts: [{ text: llmResponse }] });
                  yield { type: 'agentResponse', text: llmResponse };
                  state.turn = 'user';
                  yield { type: 'agentState', state: 'listening' };
              }
          }
      }
    } catch (error) {
      console.error("Interview Agent Error:", error);
      yield { type: 'error', message: (error as Error).message || "An unknown error occurred." };
    }
  }
);
