
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
  questionText: z.string().describe('The text of the coding question, formatted as an HTML string for direct rendering. Use tags like <strong>, <ul>, <li>, <code>, and <pre> for proper structure.'),
});
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;

const GenerateCodingQuestionsInputSchema = z.object({
  topics: z.string().describe('The topics for the coding questions, e.g., "React, JavaScript, Algorithms".'),
  language: z.string().describe('The programming language for the questions.'),
  difficulty: z.enum(['easy', 'moderate', 'difficult']).describe('The difficulty level of the questions.'),
  count: z.number().int().min(1).max(10).describe('The number of questions to generate.'),
  example: z.string().optional().describe('An example question to guide the AI, e.g., "Write a function to reverse a string."'),
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
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ],
  },
  prompt: `You are an expert programmer and interview question creator. Your task is to generate exactly {{count}} coding questions for a quiz. The required programming language for the solution is {{language}}.

Topics: {{topics}}
Language: {{language}}
Difficulty: {{difficulty}}

{{#if example}}
Here is an example of a good, well-defined question: "{{example}}"
{{/if}}

Each question you generate must be a clear, self-contained problem that a developer can solve in {{language}}.
IMPORTANT: Your entire response for each question must be formatted as a single, valid HTML string.
- Use tags like <strong> for bold text, <ul> and <li> for lists, and <code> for inline code.
- For multi-line code blocks, you MUST wrap the code in <pre><code>...</code></pre> tags.

Here is an example of the required HTML formatting for a question:
<p>Write a function <code>myFunction(arr)</code> that takes an array of numbers and returns a new array with only the even numbers.</p><strong>Example:</strong><pre><code>const numbers = [1, 2, 3, 4, 5];
const evens = myFunction(numbers);
console.log(evens); // Output: [2, 4]</code></pre>
Follow this formatting structure precisely.
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
