
'use server';

/**
 * @fileOverview A flow to analyze a user's mock interview performance.
 *
 * - generateInterviewFeedback - The main function to trigger the analysis.
 */

import { ai } from '@/ai/genkit';
import { GenerateInterviewFeedbackOutputSchema, GenerateInterviewFeedbackInputSchema, type GenerateInterviewFeedbackInput, type GenerateInterviewFeedbackOutput } from '@/lib/types';
import { z } from 'zod';

const prompt = ai.definePrompt({
  name: 'generateInterviewFeedbackPrompt',
  input: { schema: z.object({
    formattedTranscript: z.string(),
    topic: z.string().optional(),
    role: z.string().optional(),
    company: z.string().optional(),
  }) },
  output: { schema: GenerateInterviewFeedbackOutputSchema },
  prompt: `
You are an expert AI interview coach. Your task is to analyze the provided interview transcript and provide a detailed, structured evaluation.

Your entire response MUST be a single, valid JSON object that conforms to the specified schema. Do not include any text, markdown, or any characters outside of the JSON object.

**Guidelines:**
- Be critical but constructive. Your goal is to help the candidate improve.
- Base your scores on the entirety of the conversation. Even if responses are brief, provide your best assessment.
- Provide a 'crackingChance' score, even if it is very low.

**Interview Details:**
- Topic: {{topic}}
- Role: {{role}}
- Company: {{company}}

**Interview Transcript:**
{{{formattedTranscript}}}
`,
  config: {
    temperature: 0.4,
  }
});

const generateInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateInterviewFeedbackFlow',
    inputSchema: GenerateInterviewFeedbackInputSchema,
    outputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async (input) => {
    
    const formattedTranscript = input.transcript
      .map(entry => `**${entry.speaker === 'ai' ? 'Interviewer' : 'Candidate'}**: ${entry.text}`)
      .join('\n');
      
    try {
        const { output } = await prompt({
            topic: input.topic,
            role: input.role,
            company: input.company,
            formattedTranscript,
        });

        if (!output) {
            throw new Error("The AI model returned an empty response.");
        }
        
        return output;
    } catch (e: any) {
         console.error("Error in generateInterviewFeedbackFlow:", e);
         // Fallback to a structured error object to prevent client-side JSON parsing errors
         return {
            crackingChance: 0,
            fluencyScore: 0,
            knowledgeScore: 0,
            confidenceScore: 0,
            strongConcepts: [],
            weakConcepts: ['Error'],
            summary: `The AI failed to generate feedback. The error was: ${e.message || 'Unknown error'}. This is often a temporary issue with the AI model. Please try again later.`
        };
    }
  }
);


export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  return generateInterviewFeedbackFlow(input);
}
