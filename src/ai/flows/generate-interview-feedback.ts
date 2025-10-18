
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
  prompt: `You are an AI interview coach. Analyze the given interview transcript and provide structured feedback.

Follow this strict JSON structure:
{
  "feedback": "Overall summary of candidate performance. If the transcript is very short or the candidate did not speak, state that a full analysis is not possible due to the brief interaction.",
  "overallScore": number (0–100),
  "categoryScores": [
    {
      "category": "Communication",
      "score": number (0–100),
      "comment": "Feedback on communication (clarity, fluency, professionalism)."
    },
    {
      "category": "Technical Knowledge",
      "score": number (0–100),
      "comment": "Feedback on technical understanding, accuracy, and depth of answers."
    },
    {
      "category": "Confidence",
      "score": number (0–100),
      "comment": "Feedback on confidence, poise, and handling of difficult questions."
    }
  ]
}

- If the candidate's responses are empty or extremely brief, provide a low score (under 10) and explain that the analysis is limited due to lack of input. Do not give a zero score unless there is absolutely no candidate speech.
- Do not include any extra text outside the JSON. Only output valid JSON. Do not explain your answer outside of the JSON fields.
---
Interview Details:
- Topic: {{topic}}
- Role: {{role}}
- Company: {{company}}

Interview Transcript:
{{{formattedTranscript}}}
`,
  config: {
    temperature: 0.3,
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
      
    if (!formattedTranscript || input.transcript.filter(t => t.speaker === 'user').length === 0) {
      return {
        feedback: "A full analysis was not possible as the candidate did not provide any responses during the interview.",
        overallScore: 0,
        categoryScores: [
            { category: "Communication", score: 0, comment: "No response from the candidate to analyze." },
            { category: "Technical Knowledge", score: 0, comment: "No response from the candidate to analyze." },
            { category: "Confidence", score: 0, comment: "No response from the candidate to analyze." },
        ]
      };
    }

    const { output } = await prompt({
      topic: input.topic,
      role: input.role,
      company: input.company,
      formattedTranscript,
    });

    if (!output) {
      console.error("LLM did not produce valid JSON output.");
      throw new Error("The AI failed to generate feedback in the required format. This might be a temporary issue. Please try again.");
    }
    
    return output;
  }
);


export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  return generateInterviewFeedbackFlow(input);
}
