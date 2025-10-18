'use server';

/**
 * @fileOverview A flow to analyze a user's mock interview performance using Genkit tools.
 *
 * - generateInterviewFeedback - The main function to trigger the analysis.
 */

import { ai } from '@/ai/genkit';
import { GenerateInterviewFeedbackOutputSchema } from '@/lib/types';
import { z } from 'zod';

const GenerateInterviewFeedbackInputSchema = z.object({
  transcript: z.array(z.object({
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
  })),
  topic: z.string(),
  role: z.string(),
  company: z.string().optional(),
});
export type GenerateInterviewFeedbackInput = z.infer<typeof GenerateInterviewFeedbackInputSchema>;


// Define the tool that the AI will be instructed to use.
const recordFeedbackTool = ai.defineTool(
  {
    name: 'recordInterviewFeedback',
    description: 'Records the detailed feedback for an interview performance.',
    inputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async (input) => input // The tool simply returns the structured data.
);


// Define the prompt that uses the tool.
const prompt = ai.definePrompt(
  {
    name: 'interviewFeedbackPrompt',
    // We now expect a pre-formatted string for the transcript
    input: { schema: z.object({
      formattedTranscript: z.string(),
      topic: z.string(),
      role: z.string(),
      company: z.string().optional(),
    }) },
    tools: [recordFeedbackTool],
    config: {
      temperature: 0.3,
    },
    prompt: `You are an expert interview coach. Based on the following transcript for a {{role}} position focused on {{topic}}, your task is to provide a detailed evaluation of the candidate's English communication skills.

Your evaluation MUST be provided by calling the \`recordInterviewFeedback\` tool.

**Evaluation Criteria:**
1.  **Fluency**: How naturally and smoothly did the candidate speak? Were there many unnatural pauses?
2.  **Clarity**: How clear and easy to understand was the candidate's speech and explanations?
3.  **Vocabulary**: Did the candidate use appropriate and varied vocabulary for a professional context?
4.  **Overall**: A summary of their performance.

**Critical Instructions:**
-   **If the transcript shows the candidate did not speak or gave no meaningful answers:** You MUST call the tool with a score of 0 for all categories and provide feedback explaining that no analysis was possible.
-   **If the candidate gives a poor or irrelevant answer:** Your feedback MUST reflect this. Assign a low score and explain why the answer was weak.
-   **Be honest and constructive.** Your goal is to help the user improve.

**Interview Transcript:**
{{{formattedTranscript}}}

Now, call the \`recordInterviewFeedback\` tool with your complete evaluation.`,
  }
);

const generateInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateInterviewFeedbackFlow',
    inputSchema: GenerateInterviewFeedbackInputSchema,
    outputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async (input) => {
    
    if (!input.transcript || input.transcript.filter(t => t.speaker === 'user').length === 0) {
      return {
        fluency: { score: 0, feedback: "No response from the candidate to analyze." },
        clarity: { score: 0, feedback: "No response from the candidate to analyze." },
        vocabulary: { score: 0, feedback: "No response from the candidate to analyze." },
        overall: { score: 0, feedback: "The interview was too short to provide a meaningful analysis as the candidate did not speak." }
      };
    }

    // Pre-process the transcript into a simple string (Fix 2)
    const formattedTranscript = input.transcript
      .map(entry => `**${entry.speaker === 'ai' ? 'Interviewer' : 'Candidate'}**: ${entry.text}`)
      .join('\n');

    const llmResponse = await prompt({
      ...input,
      formattedTranscript, // Pass the formatted string to the prompt
    });

    const toolRequest = llmResponse.toolRequests()?.[0];

    if (!toolRequest || !toolRequest.input) {
      console.error("LLM did not call the tool or tool input is invalid. Response:", llmResponse.text());
      throw new Error("The AI failed to generate feedback in the required format. This might be a temporary issue. Please try again.");
    }
    
    const feedback = toolRequest.input;

    return feedback;
  }
);


export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  return generateInterviewFeedbackFlow(input);
}
