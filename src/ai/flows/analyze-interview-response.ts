'use server';

/**
 * @fileOverview A flow to analyze interview responses and provide feedback.
 *
 * - analyzeInterviewResponse - A function that analyzes interview responses and provides feedback.
 * - AnalyzeInterviewResponseInput - The input type for the analyzeInterviewResponse function.
 * - AnalyzeInterviewResponseOutput - The return type for the analyzeInterviewResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInterviewResponseInputSchema = z.object({
  question: z.string().describe('The interview question that was asked.'),
  response: z.string().describe('The response given by the interviewee.'),
  context: z
    .string()
    .optional()
    .describe('Additional context about the interview or role.'),
});
export type AnalyzeInterviewResponseInput = z.infer<
  typeof AnalyzeInterviewResponseInputSchema
>;

const AnalyzeInterviewResponseOutputSchema = z.object({
  clarity: z
    .string()
    .describe('Feedback on the clarity of the response.'),
  completeness: z
    .string()
    .describe('Feedback on the completeness of the response.'),
  technicalAccuracy: z
    .string()
    .describe('Feedback on the technical accuracy of the response.'),
  overallFeedback: z
    .string()
    .describe('Overall feedback on the interview response.'),
});
export type AnalyzeInterviewResponseOutput = z.infer<
  typeof AnalyzeInterviewResponseOutputSchema
>;

export async function analyzeInterviewResponse(
  input: AnalyzeInterviewResponseInput
): Promise<AnalyzeInterviewResponseOutput> {
  return analyzeInterviewResponseFlow(input);
}

const analyzeInterviewResponsePrompt = ai.definePrompt({
  name: 'analyzeInterviewResponsePrompt',
  input: {schema: AnalyzeInterviewResponseInputSchema},
  output: {schema: AnalyzeInterviewResponseOutputSchema},
  prompt: `You are an AI interview coach providing feedback on interview responses.

  Analyze the following interview response for clarity, completeness, and technical accuracy.
  Provide specific feedback in each of these areas, as well as overall feedback.

  Interview Question: {{{question}}}
  Interview Response: {{{response}}}

  {{#if context}}
  Additional Context: {{{context}}}
  {{/if}}

  Format your response as a JSON object with the following keys:
  - clarity: Feedback on the clarity of the response.
  - completeness: Feedback on the completeness of the response.
  - technicalAccuracy: Feedback on the technical accuracy of the response.
  - overallFeedback: Overall feedback on the interview response.
  `,
});

const analyzeInterviewResponseFlow = ai.defineFlow(
  {
    name: 'analyzeInterviewResponseFlow',
    inputSchema: AnalyzeInterviewResponseInputSchema,
    outputSchema: AnalyzeInterviewResponseOutputSchema,
  },
  async input => {
    const {output} = await analyzeInterviewResponsePrompt(input);
    return output!;
  }
);
