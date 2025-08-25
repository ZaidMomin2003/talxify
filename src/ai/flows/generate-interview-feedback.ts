
'use server';

/**
 * @fileOverview A flow to analyze a user's mock interview performance.
 *
 * - generateInterviewFeedback - The main function to trigger the analysis.
 * - GenerateInterviewFeedbackInput - The input type for the analysis flow.
 * - GenerateInterviewFeedbackOutput - The output type for the analysis flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscriptEntrySchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});

const GenerateInterviewFeedbackInputSchema = z.object({
  transcript: z.array(TranscriptEntrySchema).describe("The full transcript of the interview, alternating between the AI interviewer and the user."),
  topic: z.string().describe("The main topic of the interview (e.g., 'React Hooks')."),
  role: z.string().describe("The role the user was interviewing for (e.g., 'Frontend Developer')."),
  company: z.string().optional().describe("The target company for the interview, if specified (e.g., 'Google').")
});
export type GenerateInterviewFeedbackInput = z.infer<typeof GenerateInterviewFeedbackInputSchema>;

const GenerateInterviewFeedbackOutputSchema = z.object({
    overallScore: z.number().min(0).max(100).describe("An overall score for the interview from 0 to 100."),
    summary: z.string().describe("A 2-3 sentence summary of the user's performance, highlighting their strengths and key areas for improvement."),
    strengths: z.array(z.string()).describe("A bulleted list of specific strengths the user demonstrated."),
    areasForImprovement: z.array(z.string()).describe("A bulleted list of the most important areas for the user to work on."),
    questionFeedback: z.array(z.object({
        question: z.string().describe("The question asked by the AI interviewer."),
        userAnswer: z.string().describe("The user's answer to the question."),
        feedback: z.string().describe("Specific, constructive feedback on the user's answer. Comment on technical accuracy, clarity, and structure. If a company was specified, evaluate the answer in that context (e.g., STAR method for behavioral questions at Amazon)."),
        idealAnswer: z.string().describe("An example of a concise, ideal answer to the question."),
        score: z.number().min(0).max(100).describe("A score for this specific answer from 0 to 100."),
    })).describe("A detailed analysis of each question and answer pair.")
});
export type GenerateInterviewFeedbackOutput = z.infer<typeof GenerateInterviewFeedbackOutputSchema>;


export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  return generateInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewFeedbackPrompt',
  input: { schema: GenerateInterviewFeedbackInputSchema },
  output: { schema: GenerateInterviewFeedbackOutputSchema },
  prompt: `You are an expert interview coach for software developers.
  Your task is to analyze the provided interview transcript and provide comprehensive, constructive feedback.

  The user was interviewing for a {{role}} role on the topic of {{topic}}.
  {{#if company}}
  The interview was specifically tailored for **{{company}}**. Your feedback should reflect this. For example, if it was for Amazon, you should evaluate behavioral answers against the STAR method and Leadership Principles.
  {{/if}}

  Please analyze the entire transcript and provide the following:
  1.  **Overall Score**: An integer score from 0 to 100 representing the user's overall performance.
  2.  **Summary**: A concise, 2-3 sentence summary of the user's performance.
  3.  **Strengths**: A list of 2-3 key strengths the user displayed.
  4.  **Areas for Improvement**: A list of the 2-3 most critical areas for improvement.
  5.  **Question-by-Question Feedback**: For each question the AI asked, provide:
      - The question text.
      - The user's answer.
      - Specific, actionable feedback on the answer. For technical questions, comment on correctness and depth. For behavioral questions, evaluate the structure (e.g., STAR method). Consider the target company's known preferences.
      - A well-structured, ideal answer.
      - A score for that specific answer (0-100).

  Here is the interview transcript:
  {{#each transcript}}
    **{{speaker}}**: {{text}}
  {{/each}}
  `,
});

const generateInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateInterviewFeedbackFlow',
    inputSchema: GenerateInterviewFeedbackInputSchema,
    outputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
