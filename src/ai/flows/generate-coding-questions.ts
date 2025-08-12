
'use server';

/**
 * @fileOverview An AI agent to generate coding questions for a quiz.
 *
 * - generateCodingQuestions - A function that generates coding questions.
 * - GenerateCodingQuestionsInput - The input type.
 * - GenerateCodingQuestionsOutput - The return type.
 * - CodingQuestion - The schema for a single coding question.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodingQuestionSchema = z.object({
  questionText: z.string().describe('The text of the coding question.'),
});
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;

const GenerateCodingQuestionsInputSchema = z.object({
  topics: z.string().describe('The topics for the coding questions, e.g., "React, JavaScript, Algorithms".'),
  language: z.string().describe('The programming language for the questions.'),
  difficulty: z.enum(['easy', 'moderate', 'difficult']).describe('The difficulty level of the questions.'),
  count: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
});
export type GenerateCodingQuestionsInput = z.infer<typeof GenerateCodingQuestionsInputSchema>;

const GenerateCodingQuestionsOutputSchema = z.object({
  questions: z.array(CodingQuestionSchema).describe('An array of generated coding questions.'),
});
export type GenerateCodingQuestionsOutput = z.infer<typeof GenerateCodingQuestionsOutputSchema>;

export async function generateCodingQuestions(input: GenerateCodingQuestionsInput): Promise<GenerateCodingQuestionsOutput> {
  return generateCodingQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodingQuestionsPrompt',
  input: {schema: GenerateCodingQuestionsInputSchema},
  output: {schema: GenerateCodingQuestionsOutputSchema},
  prompt: `You are an expert programmer and interview question creator. Generate {{count}} coding questions for a quiz.

Topics: {{topics}}
Language: {{language}}
Difficulty: {{difficulty}}

Each question should be a clear, self-contained problem.
`,
});

const generateCodingQuestionsFlow = ai.defineFlow(
  {
    name: 'generateCodingQuestionsFlow',
    inputSchema: GenerateCodingQuestionsInputSchema,
    outputSchema: GenerateCodingQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
