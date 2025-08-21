
'use server';

/**
 * @fileOverview An AI agent to generate a personalized 30-day interview prep syllabus.
 *
 * - generateSyllabus - A function that generates the syllabus.
 * - GenerateSyllabusInput - The input type.
 * - GenerateSyllabusOutput - The return type.
 * - SyllabusDay - The schema for a single day in the syllabus.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyllabusDaySchema = z.object({
  day: z.number().int().describe('The day number (1-30).'),
  topic: z.string().describe('The main technical topic for the day (e.g., "Arrays and Strings", "Dynamic Programming", "System Design Basics").'),
  description: z.string().describe('A brief, one-sentence description of the goal for the day.'),
});
export type SyllabusDay = z.infer<typeof SyllabusDaySchema>;

const GenerateSyllabusInputSchema = z.object({
  roles: z.string().describe('The desired job roles, comma-separated (e.g., "Frontend Developer, Full-Stack Developer").'),
  companies: z.string().describe('The target companies, comma-separated (e.g., "Google, Netflix").'),
});
export type GenerateSyllabusInput = z.infer<typeof GenerateSyllabusInputSchema>;

const GenerateSyllabusOutputSchema = z.object({
  syllabus: z.array(SyllabusDaySchema).describe('An array of daily learning topics for a 30-day period.'),
});
export type GenerateSyllabusOutput = z.infer<typeof GenerateSyllabusOutputSchema>;

export async function generateSyllabus(input: GenerateSyllabusInput): Promise<GenerateSyllabusOutput> {
  return generateSyllabusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSyllabusPrompt',
  input: {schema: GenerateSyllabusInputSchema},
  output: {schema: GenerateSyllabusOutputSchema},
  prompt: `You are an expert career coach and technical interviewer. Your task is to generate a personalized 30-day interview preparation syllabus for a candidate.

The candidate is targeting the following roles: {{roles}}
And is interested in these companies: {{companies}}

Create a structured, 30-day plan that covers essential topics. Start with fundamentals and gradually move to more advanced concepts. Include a mix of data structures, algorithms, system design, and role-specific topics.

Generate a plan for exactly 30 days. For each day, provide:
- day: The day number.
- topic: The specific topic to focus on.
- description: A short, encouraging sentence about the day's goal.

The plan should be comprehensive and logically sequenced to maximize the candidate's chances of success.
`,
});

const generateSyllabusFlow = ai.defineFlow(
  {
    name: 'generateSyllabusFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
