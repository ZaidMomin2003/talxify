
'use server';

/**
 * @fileOverview A flow to power a conversational interview agent.
 *
 * - conductInterviewTurn - A function that takes the conversation history and determines the AI's next response.
 * - ConductInterviewTurnInput - The input type for the conductInterviewTurn function.
 * - ConductInterviewTurnOutput - The return type for the conductInterviewTurn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ConductInterviewTurnInputSchema = z.object({
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  questionContext: z.string().describe('The overall topic or role for the interview, e.g., "React Developer".'),
});
export type ConductInterviewTurnInput = z.infer<typeof ConductInterviewTurnInputSchema>;

const ConductInterviewTurnOutputSchema = z.object({
  response: z.string().describe("The AI interviewer's next response in the conversation."),
});
export type ConductInterviewTurnOutput = z.infer<typeof ConductInterviewTurnOutputSchema>;

export async function conductInterviewTurn(
  input: ConductInterviewTurnInput
): Promise<ConductInterviewTurnOutput> {
  return conductInterviewTurnFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conductInterviewTurnPrompt',
  input: {schema: ConductInterviewTurnInputSchema},
  output: {schema: ConductInterviewTurnOutputSchema},
  prompt: `You are an AI interviewer conducting a temporary, single-question interview for UI testing purposes.

  Interview Topic: {{{questionContext}}}
  
  Your task is to respond based on the conversation history.
  
  {{#if (lt history.length 2)}}
  // The history only contains the initial greeting from the model.
  // Your task is to ask one single, relevant technical question based on the Interview Topic.
  Ask one question now.
  {{else}}
  // The user has responded to your question.
  // Your task is to provide a brief, concluding remark and end the interview.
  // For example: "Thank you for your answer. This concludes our single-question session."
  Acknowledge their answer and end the interview now.
  {{/if}}

  Current Conversation:
  {{#each history}}
  - {{this.role}}: {{{this.content}}}
  {{/each}}
  `,
});


const conductInterviewTurnFlow = ai.defineFlow(
  {
    name: 'conductInterviewTurnFlow',
    inputSchema: ConductInterviewTurnInputSchema,
    outputSchema: ConductInterviewTurnOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
       console.error("AI model error:", error);
       // A more specific, user-friendly error could be returned
       // For now, we'll return a generic error response
       return { response: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment." };
    }
  }
);
