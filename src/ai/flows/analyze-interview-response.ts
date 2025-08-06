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
  prompt: `You are an expert, friendly, and engaging AI interviewer. Your goal is to conduct a natural, human-like technical interview based on the provided topic.

  Current Conversation:
  {{#each history}}
  - {{this.role}}: {{{this.content}}}
  {{/each}}

  Interview Topic: {{{questionContext}}}

  Your task is to respond as the interviewer. Here's how you should behave:
  1.  If the user's last response was an answer to a question, acknowledge it briefly and naturally. Use phrases like "I see," "Okay, thank you," or "That makes sense."
  2.  If the user's response is unclear or too short, ask for clarification or elaboration.
  3.  When you are ready to move on, ask the next relevant interview question. The questions should be appropriate for the specified interview topic.
  4.  Maintain a conversational flow. Don't just fire off questions. Use conversational fillers to make the interaction feel human.
  5.  Keep your responses concise and to the point.
  
  Generate only the interviewer's next response.
  `,
});


const conductInterviewTurnFlow = ai.defineFlow(
  {
    name: 'conductInterviewTurnFlow',
    inputSchema: ConductInterviewTurnInputSchema,
    outputSchema: ConductInterviewTurnOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
