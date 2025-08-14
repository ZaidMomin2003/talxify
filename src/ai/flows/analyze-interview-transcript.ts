
'use server';

/**
 * @fileOverview A flow to analyze a full mock interview transcript.
 *
 * - analyzeInterviewTranscript - The main function to trigger the analysis.
 * - AnalyzeInterviewTranscriptInput - The input type for the analysis flow.
 * - InterviewAnalysis - The output type (the analysis itself).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AnalyzeInterviewTranscriptInputSchema = z.object({
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  interviewContext: z.object({
      company: z.string().describe('The target company for the interview.'),
      role: z.string().describe('The target role for the interview.'),
      type: z.enum(['technical', 'behavioural']).describe('The type of interview being conducted.'),
  }),
});
export type AnalyzeInterviewTranscriptInput = z.infer<typeof AnalyzeInterviewTranscriptInputSchema>;

const InterviewAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(10).describe('An overall score for the interview from 0 to 10.'),
  overallFeedback: z.string().describe('A summary of the candidate\'s performance, highlighting strengths and key weaknesses.'),
  questionAnalysis: z.array(z.object({
    question: z.string().describe("The question asked by the interviewer."),
    userAnswer: z.string().describe("The user's answer to the question."),
    feedback: z.string().describe('Specific feedback on the user\'s answer. Comment on clarity, structure (e.g., STAR method for behavioral), and technical accuracy.'),
    suggestedAnswer: z.string().describe('An example of a better or more complete answer.'),
  })),
});
export type InterviewAnalysis = z.infer<typeof InterviewAnalysisSchema>;

export async function analyzeInterviewTranscript(
  input: AnalyzeInterviewTranscriptInput
): Promise<InterviewAnalysis> {
  return analyzeInterviewTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInterviewTranscriptPrompt',
  input: {schema: AnalyzeInterviewTranscriptInputSchema},
  output: {schema: InterviewAnalysisSchema},
  prompt: `You are an expert interview coach reviewing a mock interview transcript. The interview was for a {{interviewContext.role}} position at {{interviewContext.company}}.

  Your task is to provide a detailed analysis of the user's performance.

  Here is the transcript:
  {{#each history}}
  - {{role}}: {{{content}}}
  {{/each}}

  Please provide the following analysis:
  1.  **overallScore**: A score from 0-10, where 10 is outstanding.
  2.  **overallFeedback**: A paragraph summarizing the candidate's performance. Mention their strengths (e.g., good use of examples, clear communication) and main areas for improvement.
  3.  **questionAnalysis**: An array of feedback for each question the user answered. For each, provide:
      - The question asked by the model.
      - The user's answer.
      - Specific, constructive feedback on their answer.
      - A suggested or ideal answer.

  Focus on providing actionable advice that will help the user improve for their next real interview.
  `,
});


const analyzeInterviewTranscriptFlow = ai.defineFlow(
  {
    name: 'analyzeInterviewTranscriptFlow',
    inputSchema: AnalyzeInterviewTranscriptInputSchema,
    outputSchema: InterviewAnalysisSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
