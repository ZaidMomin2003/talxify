
'use server';

/**
 * @fileOverview A flow to generate interview questions with answers based on role, level, company, and description.
 *
 * - generateInterviewQuestions - A function that generates interview questions and answers.
 * - GenerateInterviewQuestionsInput - The input type for the function.
 * - GenerateInterviewQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateInterviewQuestionsInputSchema = z.object({
  role: z.string().describe('The role for which interview questions are generated (e.g., "Software Engineer").'),
  description: z.string().describe('The job description, which may include required technologies and responsibilities.'),
  level: z.enum(['entry-level', 'mid-level', 'senior', 'principal']).describe('The seniority level of the role.'),
  company: z.string().optional().describe('The target company, if any (e.g., "Google", "Netflix").'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const InterviewQuestionAndAnswerSchema = z.object({
    question: z.string().describe('A single, well-defined interview question.'),
    answer: z.string().describe('A detailed, expert-level answer to the question.'),
});

export const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(InterviewQuestionAndAnswerSchema).length(15).describe('An array of exactly 15 questions and answers.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

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
  2.  Generate a mix of technical questions (covering data structures, algorithms, system design, and technologies mentioned in the description) and behavioral questions.
  3.  The difficulty and depth of the questions must be appropriate for the specified **Level**.
  4.  If a **Company** is specified, tailor some questions to reflect that company's known culture, values, and typical interview style (e.g., scalability for Netflix, algorithms for Google).
  5.  For each question, provide a comprehensive, well-explained answer that a top-tier candidate would give.
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
