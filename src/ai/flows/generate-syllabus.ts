
'use server';

/**
 * @fileOverview An AI agent to generate a personalized 60-day interview prep syllabus.
 *
 * - generateSyllabus - A function that generates the syllabus.
 * - GenerateSyllabusInput - The input type.
 * - GenerateSyllabusOutput - The return type.
 * - SyllabusDay - The schema for a single day in the syllabus.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyllabusDaySchema = z.object({
  day: z.number().int().describe('The day number.'),
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
  syllabus: z.array(SyllabusDaySchema).describe('An array of daily learning topics for a 60-day period.'),
});
export type GenerateSyllabusOutput = z.infer<typeof GenerateSyllabusOutputSchema>;

// Input for the weekly prompt
const WeeklySyllabusInputSchema = GenerateSyllabusInputSchema.extend({
    week: z.number().int(),
    startDay: z.number().int(),
});

// Output for the weekly prompt
const WeeklySyllabusOutputSchema = z.object({
  weekSyllabus: z.array(SyllabusDaySchema).describe('An array of 7 daily learning topics for the specified week.')
});


export async function generateSyllabus(input: GenerateSyllabusInput): Promise<GenerateSyllabusOutput> {
  return generateSyllabusFlow(input);
}

const weeklyPrompt = ai.definePrompt({
  name: 'generateWeeklySyllabusPrompt',
  input: {schema: WeeklySyllabusInputSchema},
  output: {schema: WeeklySyllabusOutputSchema},
  config: {
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ],
  },
  prompt: `You are an expert career coach and technical interviewer who has worked at FAANG companies. Your task is to generate a personalized 7-day interview preparation syllabus for a candidate for a specific week.

The candidate is targeting the following roles: {{roles}}
And is interested in these specific companies: {{companies}}

This is for **Week {{week}}** of their preparation plan, starting on **Day {{startDay}}**.

Create a structured, 7-day plan that covers essential topics for this week. The plan MUST be tailored to the types of questions and priorities of the specified companies. For example, if they list Google, focus more on algorithms and data structures. If they list Netflix, include system design.

For each day, provide:
- day: The correct day number, from {{startDay}} to {{startDay}}+6.
- topic: The specific topic to focus on.
- description: A short, encouraging sentence about the day's goal.
`,
});

const generateSyllabusFlow = ai.defineFlow(
  {
    name: 'generateSyllabusFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    const totalDays = 60;
    const weeks = Math.ceil(totalDays / 7);
    let fullSyllabus: SyllabusDay[] = [];

    for (let i = 0; i < weeks; i++) {
        const startDay = i * 7 + 1;
        const weeklyInput = {
            ...input,
            week: i + 1,
            startDay,
        };

        const { output } = await weeklyPrompt(weeklyInput);
        if (output?.weekSyllabus) {
            fullSyllabus = fullSyllabus.concat(output.weekSyllabus);
        } else {
            // Handle the case where a week fails, maybe retry or throw an error
            throw new Error(`Failed to generate syllabus for week ${i + 1}`);
        }
    }

    // Ensure we only return the required number of days
    const finalSyllabus = fullSyllabus.slice(0, totalDays);
    
    // Re-assign day numbers to ensure they are sequential from 1 to 60
    const correctlyNumberedSyllabus = finalSyllabus.map((day, index) => ({
      ...day,
      day: index + 1,
    }));


    return { syllabus: correctlyNumberedSyllabus };
  }
);
