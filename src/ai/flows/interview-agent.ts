'use server';

import { ai } from '@/ai/genkit';
import { stream } from 'genkit/stream';
import { z } from 'genkit';
import { textToSpeechWithDeepgramFlow } from './deepgram-tts';
import {
  InterviewResponseSchema,
  InterviewState,
  InterviewStateSchema,
} from '@/lib/interview-types';

export const runInterviewAgent = ai.defineFlow(
  {
    name: 'runInterviewAgent',
    inputSchema: z.object({
      text: z.string(),
      role: z.string(),
      topic: z.string(),
      level: z.string(),
    }),
    outputSchema: z.any(),
  },
  async (prompt) => {
    return stream(async function* (stream) {
      let state: InterviewState = {
        interviewId: '123',
        topic: prompt.topic,
        level: prompt.level,
        role: prompt.role,
        history: [],
        isComplete: false,
      };

      const llmResponse = await ai.generate({
        prompt: `You are an expert interviewer.
        
          Your Persona:
          - You are Kathy, an expert technical interviewer at Talxify.
          - Your tone: professional, encouraging, and clear.
          - Your task: Ask the candidate a series of interview questions and determine if they are a good fit for the role.

          Candidate Profile:
          - Role: ${prompt.role}
          - Level: ${prompt.level}
          - Technologies: ${prompt.topic}

          Interview Flow:
          - Start with a greeting and introduction.
          - Ask a mix of technical questions related to the specified technologies and level.
          - Ask at least one behavioral question to assess soft skills.
          - Keep the questions clear and to the point.
          - After the candidate answers, provide a brief acknowledgement (e.g., "Okay, thank you," or "I see.") and then ask the next question.
          - After 4-5 questions, conclude the interview gracefully.
        
          Conversation History:
          ${state.history.map((m) => `${m.role}: ${m.content[0].text}`).join('\n')}
          user: ${prompt.text}
          model:`,
        history: state.history,
        config: {
          temperature: 0.5,
        },
      });

      const response = llmResponse.text;
      state = {
        ...state,
        history: [
          ...state.history,
          { role: 'user', content: [{ text: prompt.text }] },
          { role: 'model', content: [{ text: response }] },
        ],
      };

      const ttsResponse = await textToSpeechWithDeepgramFlow({
        text: llmResponse.text,
      });

      stream.yield(ttsResponse.audioBuffer);
    });
  }
);
