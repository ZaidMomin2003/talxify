
'use server';

/**
 * @fileOverview A flow to generate conversational responses for a mock interview.
 *
 * - generateInterviewResponse - The main function to get the AI's next response.
 * - InterviewState - The schema representing the current state of the interview.
 * - InterviewResponse - The output containing the AI's response and updated state.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData, MessageSchema } from 'genkit/model';

export const InterviewStateSchema = z.object({
  interviewId: z.string().describe('A unique identifier for this interview session.'),
  topic: z.string().describe('The primary technical topic for the interview (e.g., "React Hooks").'),
  level: z.string().describe('The candidate\'s experience level (e.g., "entry-level", "senior").'),
  role: z.string().describe('The job role the candidate is interviewing for (e.g., "Frontend Developer").'),
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  questionsAsked: z.number().int().describe('The number of main questions the AI has already asked.'),
  isComplete: z.boolean().describe('A flag indicating if the interview has concluded.'),
});
export type InterviewState = z.infer<typeof InterviewStateSchema>;

export const InterviewResponseSchema = z.object({
  response: z.string().describe('The AI interviewer\'s next response or question.'),
  newState: InterviewStateSchema.describe('The updated state of the interview after this turn.'),
});
export type InterviewResponse = z.infer<typeof InterviewResponseSchema>;

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
      3.  **Be Conversational**: After the user answers, provide a brief, encouraging acknowledgment (e.g., "Thanks for sharing that," "That's an interesting approach," "Okay, I see.") before asking the next question.
      4.  **Manage Flow**: Your primary goal is to ask the next logical question. If the user's response is short, you can ask a brief follow-up.
      5.  **Stay on Track**: Gently guide the conversation back to the interview if the user goes off-topic.
      6.  **Conclude Gracefully**: After asking ${MAX_QUESTIONS} questions, provide a brief, encouraging summary of the user's performance. Mention their strengths and one or two areas for improvement based on their answers. End the interview on a positive note. Do NOT give a question-by-question breakdown. Just an overall summary.
    `;

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      system: promptContext,
      history: state.history as MessageData[],
      prompt: "Based on the rules and the conversation history, what is your next response?",
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
    // This is a temporary placeholder to simulate the user's turn for the AI's context.
    // The actual user response is added on the client-side.
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
