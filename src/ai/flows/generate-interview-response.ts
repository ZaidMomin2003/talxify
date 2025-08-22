
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
        response: 'Thank you for your time. This concludes the interview.',
        newState: state,
      };
    }

    const MAX_QUESTIONS = 6;
    const promptContext = `
      You are an expert, friendly, and professional AI interviewer named Alex.
      Your goal is to conduct a natural, conversational mock interview that lasts about 12-14 minutes.
      The candidate is interviewing for a ${state.level} ${state.role} role.
      The main topic for this interview is: ${state.topic}.

      Current state: You have asked ${state.questionsAsked} out of ${MAX_QUESTIONS} questions.

      Conversation Rules:
      1.  **Start Warmly**: If the history is empty, begin with a warm greeting, introduce yourself as Alex, and briefly explain the format (a ~12 min mock interview on ${state.topic}).
      2.  **Ask Questions**: Ask a mix of technical and behavioral questions relevant to the role and topic. Ask ONE main question at a time.
      3.  **Be Conversational & Concise**: After the user answers, provide a very brief, encouraging acknowledgment (e.g., "Good approach," "Thanks, that makes sense," "Okay, I see.") before immediately asking the next question. Do not add extra conversational filler.
      4.  **Manage Flow**: Your primary goal is to ask the next logical question. If the user's response is short, you can ask a brief follow-up.
      5.  **Stay on Track**: Gently guide the conversation back to the interview if the user goes off-topic.
      6.  **Conclude Gracefully**: After asking ${MAX_QUESTIONS} questions, provide a brief, encouraging summary of the user's performance. Mention their strengths and one or two areas for improvement based on their answers. End the interview on a positive note. Do NOT give a question-by-question breakdown. Just an overall summary.
    `;

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: promptContext,
      history: state.history as MessageData[],
      prompt: "Based on the rules and the conversation history, what is your next response? Be concise.",
      output: {
          schema: z.object({
              thought: z.string().describe("Your reasoning for the response you are about to give."),
              response: z.string().describe("Your next response to the user. This is what will be spoken."),
              questionWasAsked: z.boolean().describe("Set to true if you asked a new main question in your response."),
              interviewShouldEnd: z.boolean().describe("Set to true if you have just given the final summary and the interview is over."),
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
    newState.history.push({ role: 'model', content: [{ text: output.response }] });
    
    if (output.questionWasAsked) {
      newState.questionsAsked += 1;
    }

    if (output.interviewShouldEnd || newState.questionsAsked >= MAX_QUESTIONS) {
      newState.isComplete = true;
    }

    return {
      response: output.response,
      newState: newState,
    };
  }
);
