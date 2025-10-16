
'use server';

/**
 * @fileOverview A flow to analyze a user's mock interview performance.
 *
 * - generateInterviewFeedback - The main function to trigger the analysis.
 */

import { ai } from '@/ai/genkit';
import { GenerateInterviewFeedbackInputSchema, GenerateInterviewFeedbackOutputSchema, type GenerateInterviewFeedbackInput, type GenerateInterviewFeedbackOutput } from '@/lib/types';


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
