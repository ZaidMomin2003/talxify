'use server';

/**
 * @fileOverview An AI agent to generate code snippets for common tasks.
 *
 * - generateCodeSnippet - A function that generates code snippets based on user requests.
 * - GenerateCodeSnippetInput - The input type for the generateCodeSnippet function.
 * - GenerateCodeSnippetOutput - The return type for the generateCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the coding task for which a code snippet is needed.'),
  language: z.string().describe('The programming language for the code snippet.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

const GenerateCodeSnippetOutputSchema = z.object({
  codeSnippet: z.string().describe('The generated code snippet for the given task.'),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippet(input: GenerateCodeSnippetInput): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: {schema: GenerateCodeSnippetInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `You are an expert coding assistant. Your task is to generate a code snippet based on the user's description of the task in the specified programming language.

Task Description: {{{taskDescription}}}
Language: {{{language}}}

Code Snippet:`, 
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
