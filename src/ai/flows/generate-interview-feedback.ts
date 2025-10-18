
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

Follow this strict JSON format for your entire response. Do not include any text outside of the JSON object.

\`\`\`json
{
  "crackingChance": <A percentage (0-100) representing the candidate's likelihood of passing a real interview based on this performance. Be realistic.>,
  "fluencyScore": <A score (0-100) for the candidate's language fluency and smoothness of speech.>,
  "knowledgeScore": <A score (0-100) for the candidate's technical knowledge, accuracy, and depth of answers.>,
  "confidenceScore": <A score (0-100) for the candidate's perceived confidence and poise.>,
  "strongConcepts": ["A list of topics or concepts the candidate demonstrated strong understanding of."],
  "weakConcepts": ["A list of topics or concepts where the candidate showed weakness."],
  "summary": "A detailed summary of the candidate's overall performance, highlighting strengths, weaknesses, and providing specific, actionable advice for improvement."
}
\`\`\`

**Guidelines:**
- If the candidate's responses are empty or extremely brief, provide a low `crackingChance` (under 10) and explain in the `summary` that a full analysis is not possible due to lack of input.
- Be critical but constructive. Your goal is to help the candidate improve.
- Base your scores on the entirety of the conversation.

---
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
      
    if (!formattedTranscript || input.transcript.filter(t => t.speaker === 'user').length === 0) {
      return {
        crackingChance: 0,
        fluencyScore: 0,
        knowledgeScore: 0,
        confidenceScore: 0,
        strongConcepts: [],
        weakConcepts: ['N/A'],
        summary: "A full analysis was not possible as the candidate did not provide any responses during the interview. To get feedback, please try the interview again and answer the questions to the best of your ability."
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
