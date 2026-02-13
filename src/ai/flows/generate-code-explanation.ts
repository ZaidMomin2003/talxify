'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating explanations of code snippets.
 *
 * - generateCodeExplanation - An async function that takes code as input and returns a simplified explanation.
 * - GenerateCodeExplanationInput - The input type for the generateCodeExplanation function, containing the code to explain.
 * - GenerateCodeExplanationOutput - The output type for the generateCodeExplanation function, containing the explanation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to be explained.'),
});
export type GenerateCodeExplanationInput = z.infer<
  typeof GenerateCodeExplanationInputSchema
>;

const GenerateCodeExplanationOutputSchema = z.object({
  explanation: z.string().describe('The simplified explanation of the code.'),
});
export type GenerateCodeExplanationOutput = z.infer<
  typeof GenerateCodeExplanationOutputSchema
>;

export async function generateCodeExplanation(
  input: GenerateCodeExplanationInput
): Promise<GenerateCodeExplanationOutput> {
  return generateCodeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeExplanationPrompt',
  input: {schema: GenerateCodeExplanationInputSchema},
  output: {schema: GenerateCodeExplanationOutputSchema},
  prompt: `You are an expert code explainer. Simplify the following code snippet so that someone with limited coding knowledge can understand it.\n\nCode:\n\n{{code}}`,
});

const generateCodeExplanationFlow = ai.defineFlow(
  {
    name: 'generateCodeExplanationFlow',
    inputSchema: GenerateCodeExplanationInputSchema,
    outputSchema: GenerateCodeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
