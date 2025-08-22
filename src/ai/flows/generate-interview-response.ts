
'use server';

/**
 * @fileOverview A flow to generate conversational responses for a mock interview.
 *
 * - generateInterviewResponse - The main function to get the AI's next response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData } from 'genkit/model';
import type { InterviewResponse, InterviewState } from '@/lib/interview-types';
import { InterviewResponseSchema, InterviewStateSchema } from '@/lib/interview-types';


export async function generateInterviewResponse(input: InterviewState): Promise<InterviewResponse> {
  return interviewFlow(input);
}

const interviewFlow = ai.defineFlow(
  {
    name: 'interviewFlow',
    inputSchema: InterviewStateSchema,
    outputSchema: InterviewResponseSchema,
  },
  async (state) => {
    // If the interview is already marked as complete, do nothing.
    if (state.isComplete) {
      return {
        response: 'This interview has concluded. Thank you for your time.',
        newState: state,
      };
    }

    // Force the initial greeting flow to ensure a natural start.
    if (state.history.length === 0) {
      const initialGreeting = 'Hi, how are you doing today?';
      const newState: InterviewState = {
        ...state,
        history: [{ role: 'model', content: [{ text: initialGreeting }] }],
      };
      return {
        response: initialGreeting,
        newState: newState,
      };
    }

    if (state.history.length === 2 && state.history[0].role === 'model') {
        const introText = `That's good to hear. I'm Alex, your AI interviewer for this session. We'll spend about 12 minutes discussing ${state.topic} for the ${state.level} ${state.role} role. Are you ready to begin?`;
        const newState: InterviewState = {
            ...state,
            history: [...state.history, { role: 'model', content: [{ text: introText }] }],
        };
        return {
            response: introText,
            newState: newState,
        };
    }

    const MAX_QUESTIONS = 6;
    const promptContext = `
      You are an expert, friendly, and professional AI interviewer named Alex.
      Your goal is to conduct a natural, conversational mock interview that lasts about ${MAX_QUESTIONS} questions.
      The candidate is interviewing for a ${state.level} ${state.role} role.
      The main topic for this interview is: ${state.topic}.

      Current state: You have asked ${state.questionsAsked} out of ${MAX_QUESTIONS} questions.

      Conversation Rules:
      1.  **Do NOT start the conversation**. The initial greeting is handled already. Your first task is to respond to the user saying they are ready.
      2.  **Ask Questions**: Ask ONE main question at a time. The questions should be a mix of technical and behavioral, relevant to the role and topic.
      3.  **Be Conversational & Concise**: After the user answers, provide a very brief, encouraging acknowledgment (e.g., "Good approach," "Thanks, that makes sense," "Okay, I see.") before immediately asking the next question. Do not add extra conversational filler.
      4.  **Manage Flow**: Your primary goal is to ask the next logical question. If the user's response is short, you can ask a brief follow-up.
      5.  **Stay on Track**: Gently guide the conversation back to the interview if the user goes off-topic.
      6.  **Conclude Gracefully**: ONLY after you have asked ${MAX_QUESTIONS} questions and the user has responded, you MUST provide a brief, encouraging summary of the user's performance. Mention their strengths and one or two areas for improvement based on their answers. End the interview on a positive note. Only after giving this full summary should you set interviewShouldEnd to true. DO NOT conclude early.
    `;

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: promptContext,
      history: state.history as MessageData[],
      prompt: "Based on the rules and the conversation history, what is your next concise response? If you are giving the final summary, ensure it is complete before setting interviewShouldEnd to true.",
      output: {
          schema: z.object({
              thought: z.string().describe("Your reasoning for the response you are about to give."),
              response: z.string().describe("Your next response to the user. This is what will be spoken."),
              questionWasAsked: z.boolean().describe("Set to true if you asked a new main question in your response."),
              interviewShouldEnd: z.boolean().describe("Set to true ONLY after you have given the final summary and the interview is over."),
          })
      },
      config: { temperature: 0.8 },
    });

    if (!output) {
      throw new Error("The model did not return a valid response.");
    }
    
    // Update the interview state
    const newState = { ...state };

    // We add the AI's response to keep the history for the next turn.
    // The user's response will be added in the next call.
    newState.history.push({ role: 'model', content: [{ text: output.response }] });
    
    if (output.questionWasAsked && newState.questionsAsked < MAX_QUESTIONS) {
      newState.questionsAsked += 1;
    }
    
    // Check if the interview should be marked as complete
    if (output.interviewShouldEnd) {
      newState.isComplete = true;
    }

    return {
      response: output.response,
      newState: newState,
    };
  }
);
