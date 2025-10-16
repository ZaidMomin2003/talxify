
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

export const GenerateInterviewFeedbackInputSchema = z.object({
  transcript: z.array(TranscriptEntrySchema).describe("The full transcript of the interview, alternating between the AI interviewer and the user."),
  topic: z.string().describe("The main topic of the interview (e.g., 'React Hooks')."),
  role: z.string().describe("The role the user was interviewing for (e.g., 'Frontend Developer')."),
  company: z.string().optional().describe("The target company for the interview, if specified (e.g., 'Google').")
});
export type GenerateInterviewFeedbackInput = z.infer<typeof GenerateInterviewFeedbackInputSchema>;

const ScoreAndFeedbackSchema = z.object({
    score: z.number().min(1).max(10).describe("A score from 1 to 10 for this category."),
    feedback: z.string().describe("Brief, constructive feedback for this category.")
});

export const GenerateInterviewFeedbackOutputSchema = z.object({
    fluency: ScoreAndFeedbackSchema,
    clarity: ScoreAndFeedbackSchema,
    vocabulary: ScoreAndFeedbackSchema,
    overall: ScoreAndFeedbackSchema,
});
export type GenerateInterviewFeedbackOutput = z.infer<typeof GenerateInterviewFeedbackOutputSchema>;


export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  // If the transcript is empty or has less than 2 entries, it's not a real interview.
  if (!input.transcript || input.transcript.length < 2) {
      return {
          fluency: { score: 0, feedback: "Not enough conversation to analyze fluency." },
          clarity: { score: 0, feedback: "Not enough conversation to analyze clarity." },
          vocabulary: { score: 0, feedback: "Not enough conversation to analyze vocabulary." },
          overall: { score: 0, feedback: "The interview was too short to provide a meaningful analysis. Try to engage in a conversation with the interviewer to get feedback." },
      }
  }
  return generateInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewFeedbackPrompt',
  input: { schema: GenerateInterviewFeedbackInputSchema },
  output: { schema: GenerateInterviewFeedbackOutputSchema },
  prompt: `Based on the following transcript of an interview for a {{role}} position focused on {{topic}}, please evaluate the user's performance.
  Focus on their English communication skills. For each category (fluency, clarity, vocabulary) and for the overall performance, provide a score from 1 to 10 and brief, constructive feedback.

  Transcript:
  {{#each transcript}}
    **{{#if (eq speaker "ai")}}Interviewer{{else}}Candidate{{/if}}**: {{text}}
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
    
    if (!output) {
      throw new Error("The AI failed to generate feedback. The output was empty.");
    }
    
    return output;
  }
);
