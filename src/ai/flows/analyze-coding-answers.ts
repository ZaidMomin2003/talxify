
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
  feedback: z.string().describe('Detailed feedback on the user\'s answer, formatted as an HTML string. Explain what is right or wrong, and how to improve. Comment on logic, style, and efficiency.'),
  score: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 indicating the correctness of the answer.'),
  correctSolution: z.string().describe('An example of a correct and efficient JavaScript solution for the problem. The code should be well-commented to explain the logic.'),
});
export type AnswerAnalysis = z.infer<typeof AnswerAnalysisSchema>;


const AnalyzeCodingAnswersInputSchema = z.object({
  submissions: z.array(SubmissionSchema),
});
export type AnalyzeCodingAnswersInput = z.infer<typeof AnalyzeCodingAnswersInputSchema>;

const AnalyzeCodingAnswersOutputSchema = z.object({
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
  prompt: `You are an expert code reviewer and AI programming assistant acting as a strict judge for a JavaScript coding quiz.
  Analyze the user's submission. The user's code is expected to be in JavaScript.

  Your evaluation must be strict. Do not give points for effort. The code must be functionally correct and solve the problem efficiently.

  For each submission, provide the following:
  1.  **isCorrect**: A boolean. This must be TRUE only if the solution is completely correct. If there are any logical errors, edge case failures, or significant inefficiencies, it is FALSE.
  2.  **feedback**: Constructive feedback. Format this as a valid HTML string, using <ul> and <li> for lists. Explain exactly why the code is correct or incorrect. If incorrect, point out the specific flaws. Comment on logic, style, and efficiency.
  3.  **score**: A float between 0.0 (completely wrong) and 1.0 (perfectly correct). Base this score on correctness, efficiency, and adherence to best practices. An almost correct answer should not get a score above 0.75.
  4.  **correctSolution**: Provide one ideal, correct, and well-commented JavaScript solution for the problem. The code should be clean and ready for display in a <pre><code> block.

  Here is the user's submission data:
  {{#each submissions}}
  ---
  Question: {{this.question.questionText}}
  User's Answer (in JavaScript):
  \`\`\`javascript
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
