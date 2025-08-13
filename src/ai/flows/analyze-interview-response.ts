
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
  interviewContext: z.object({
      company: z.string().describe('The target company for the interview.'),
      role: z.string().describe('The target role for the interview.'),
      type: z.enum(['technical', 'behavioural']).describe('The type of interview being conducted.'),
  }),
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
  prompt: `You are an expert AI interviewer.
  
  Your goal is to conduct a mock interview for a candidate. You will ask one single, relevant question based on the provided context, wait for the user's response, and then provide a brief concluding remark to end the interview.
  
  **Interview Context:**
  - **Company:** {{{interviewContext.company}}}
  - **Role:** {{{interviewContext.role}}}
  - **Interview Type:** {{{interviewContext.type}}}
  
  **Your Task:**
  
  {{#if (lt history.length 2)}}
  // This is the beginning of the interview. The history only contains the initial greeting from the model.
  // Your task is to ask one single, relevant question based on the interview context.
  
  {{#if (eq interviewContext.type "technical")}}
  Ask a technical question that a candidate for the "{{interviewContext.role}}" role at "{{interviewContext.company}}" might receive.
  {{else}}
  Ask a behavioral question that would assess a candidate's fit for the "{{interviewContext.role}}" role at "{{interviewContext.company}}".
  {{/if}}
  
  Ask one question now.
  
  {{else}}
  // The user has responded to your question.
  // Your task is to provide a brief, concluding remark and end the interview.
  // For example: "Thank you for your answer. This concludes our single-question session."
  Acknowledge their answer and end the interview now.
  {{/if}}
  
  **Current Conversation History:**
  {{#each history}}
  - {{role}}: {{{content}}}
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

    