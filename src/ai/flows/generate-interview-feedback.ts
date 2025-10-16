
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
  // Directly call the flow, letting the AI handle all transcript lengths.
  return generateInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewFeedbackPrompt',
  input: { schema: GenerateInterviewFeedbackInputSchema },
  output: { schema: GenerateInterviewFeedbackOutputSchema },
  prompt: `You are an expert interview coach. Based on the following transcript of an interview for a {{role}} position focused on {{topic}}, please evaluate the candidate's English communication skills.

Your task is to provide a score from 1 to 10 and brief, constructive feedback for each category (fluency, clarity, vocabulary) and for the overall performance.

**CRITICAL INSTRUCTIONS:**
1.  **If the candidate provides a poor answer or no answer at all**, your feedback MUST reflect this. State that the candidate struggled or did not provide a response, and assign a very low score (e.g., 1 or 2).
2.  **If the transcript is empty or contains only the interviewer speaking**, you MUST return a score of 0 for all categories and state that the interview was too short to provide any meaningful analysis.
3.  **If the candidate's response is good**, provide positive and constructive feedback with a corresponding high score.

**Transcript:**
{{#if transcript.length}}
  {{#each transcript}}
    **{{#if (eq speaker "ai")}}Interviewer{{else}}Candidate{{/if}}**: {{text}}
  {{/each}}
{{else}}
  (The transcript is empty. The candidate did not participate.)
{{/if}}
  `,
});

const generateInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateInterviewFeedbackFlow',
    inputSchema: GenerateInterviewFeedbackInputSchema,
    outputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async (input) => {
    // If the transcript is empty, we can short-circuit here to be safe,
    // though the prompt also handles this.
    if (!input.transcript || input.transcript.length === 0) {
        return {
          fluency: { score: 0, feedback: "No response from the candidate to analyze." },
          clarity: { score: 0, feedback: "No response from the candidate to analyze." },
          vocabulary: { score: 0, feedback: "No response from the candidate to analyze." },
          overall: { score: 0, feedback: "The interview was too short to provide a meaningful analysis as the candidate did not speak." },
        }
    }
    
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("The AI failed to generate feedback. The output was empty.");
    }
    
    return output;
  }
);
