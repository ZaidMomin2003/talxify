
'use server';

/**
 * @fileOverview A flow to analyze a user's answers to a coding quiz.
 *
 * - analyzeCodingAnswers - The main function to trigger the analysis.
 * - AnalyzeCodingAnswersInput - The input type for the analysis flow.
 * - AnalyzeCodingAnswersOutput - The output type for the analysis flow.
 * - AnswerAnalysis - The schema for the analysis of a single answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodingQuestionSchema = z.object({
  questionText: z.string().describe('The text of the coding question.'),
});

const SubmissionSchema = z.object({
    question: CodingQuestionSchema,
    userAnswer: z.string().describe("The user's submitted code answer."),
});

const AnswerAnalysisSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user\'s answer is functionally correct.'),
  feedback: z.string().describe('Detailed feedback on the user\'s answer, explaining what is right or wrong.'),
  score: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 indicating the correctness of the answer.'),
  correctSolution: z.string().describe('An example of a correct solution for the problem.'),
});
export type AnswerAnalysis = z.infer<typeof AnswerAnalysisSchema>;


export const AnalyzeCodingAnswersInputSchema = z.object({
  submissions: z.array(SubmissionSchema),
});
export type AnalyzeCodingAnswersInput = z.infer<typeof AnalyzeCodingAnswersInputSchema>;

export const AnalyzeCodingAnswersOutputSchema = z.object({
  analysis: z.array(AnswerAnalysisSchema),
});
export type AnalyzeCodingAnswersOutput = z.infer<typeof AnalyzeCodingAnswersOutputSchema>;


export async function analyzeCodingAnswers(
  input: AnalyzeCodingAnswersInput
): Promise<AnalyzeCodingAnswersOutput> {
  return analyzeCodingAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCodingAnswersPrompt',
  input: {schema: AnalyzeCodingAnswersInputSchema},
  output: {schema: AnalyzeCodingAnswersOutputSchema},
  prompt: `You are an expert code reviewer and AI programming assistant.
  Analyze the user's submissions for a coding quiz. For each submission, evaluate the user's answer based on the provided question.

  For each submission, provide the following:
  1.  isCorrect: A boolean indicating if the solution is functionally correct and solves the problem.
  2.  feedback: Constructive feedback on the code. Explain why it's correct or incorrect. Comment on code style, efficiency, and logic.
  3.  score: A float between 0.0 (completely wrong) and 1.0 (perfectly correct).
  4.  correctSolution: Provide one ideal, correct code solution for the problem.

  Here is the user's submission data:
  {{#each submissions}}
  ---
  Question: {{this.question.questionText}}
  User's Answer:
  \`\`\`
  {{{this.userAnswer}}}
  \`\`\`
  ---
  {{/each}}
  `,
});

const analyzeCodingAnswersFlow = ai.defineFlow(
  {
    name: 'analyzeCodingAnswersFlow',
    inputSchema: AnalyzeCodingAnswersInputSchema,
    outputSchema: AnalyzeCodingAnswersOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
