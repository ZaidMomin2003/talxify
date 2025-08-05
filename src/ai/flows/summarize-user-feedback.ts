// Summarize User Feedback Flow
'use server';

/**
 * @fileOverview This file defines a Genkit flow to summarize user feedback on practice interviews.
 *
 * - summarizeUserFeedback - A function that summarizes user feedback on practice interviews.
 * - SummarizeUserFeedbackInput - The input type for the summarizeUserFeedback function.
 * - SummarizeUserFeedbackOutput - The return type for the summarizeUserFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUserFeedbackInputSchema = z.object({
  feedback: z
    .string()
    .describe('The user feedback text to be summarized.'),
});
export type SummarizeUserFeedbackInput = z.infer<typeof SummarizeUserFeedbackInputSchema>;

const SummarizeUserFeedbackOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the user feedback, highlighting key areas for improvement.'),
});
export type SummarizeUserFeedbackOutput = z.infer<typeof SummarizeUserFeedbackOutputSchema>;

export async function summarizeUserFeedback(input: SummarizeUserFeedbackInput): Promise<SummarizeUserFeedbackOutput> {
  return summarizeUserFeedbackFlow(input);
}

const summarizeUserFeedbackPrompt = ai.definePrompt({
  name: 'summarizeUserFeedbackPrompt',
  input: {schema: SummarizeUserFeedbackInputSchema},
  output: {schema: SummarizeUserFeedbackOutputSchema},
  prompt: `You are an AI assistant designed to summarize user feedback on practice interviews.

  Please provide a concise summary of the feedback, highlighting key areas for improvement.

  Feedback:
  {{feedback}}`,
});

const summarizeUserFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeUserFeedbackFlow',
    inputSchema: SummarizeUserFeedbackInputSchema,
    outputSchema: SummarizeUserFeedbackOutputSchema,
  },
  async input => {
    const {output} = await summarizeUserFeedbackPrompt(input);
    return output!;
  }
);
