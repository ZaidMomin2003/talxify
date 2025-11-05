
'use server';

/**
 * @fileOverview A flow to generate interview questions with answers based on role, level, company, and description.
 *
 * - generateInterviewQuestions - A function that generates interview questions and answers.
 */

import {ai} from '@/ai/genkit';
import { GenerateInterviewQuestionsInputSchema, GenerateInterviewQuestionsOutputSchema, type GenerateInterviewQuestionsInput, type GenerateInterviewQuestionsOutput } from '@/lib/types';


export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert technical interviewer and career coach.
  
  Your task is to generate exactly 15 interview questions, each with a detailed, expert-level answer. The questions should be highly relevant to the provided job details.

  **Job Details:**
  - **Role:** {{role}}
  - **Level:** {{level}}
  - **Company:** {{#if company}}{{company}}{{else}}Not specified{{/if}}
  - **Description:** 
    \`\`\`
    {{{description}}}
    \`\`\`

  **Instructions:**
  1.  Carefully analyze all the provided job details.
  2.  Generate a mix of technical, coding, and behavioral questions.
  3.  For each question, provide:
      a.  A `question` string.
      b.  A comprehensive, well-explained `answer`.
      c.  A `type` string, which must be one of: "Behavioral", "Technical", or "Coding".
  4.  The difficulty and depth of the questions must be appropriate for the specified **Level**.
  5.  If a **Company** is specified, tailor some questions to reflect that company's known culture, values, and typical interview style (e.g., scalability for Netflix, algorithms for Google).
  6.  Ensure the final output contains exactly 15 question-and-answer pairs.
  `,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output || !output.questions || output.questions.length < 15) {
      throw new Error(`The AI failed to generate the required 15 questions. Please try again.`);
    }

    return output;
  }
);
