
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

const ChunkSyllabusInputSchema = z.object({
    roles: z.string(),
    companies: z.string(),
    count: z.number().int(),
    startDay: z.number().int(),
});

const prompt = ai.definePrompt({
  name: 'generateSyllabusPrompt',
  input: {schema: ChunkSyllabusInputSchema},
  output: {schema: GenerateSyllabusOutputSchema},
  config: {
    model: 'googleai/gemini-1.5-pro-latest',
    safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ],
  },
  prompt: `You are an expert career coach and technical interviewer who has worked at FAANG companies.
  Your task is to generate a portion of a structured interview preparation syllabus for a candidate.

  **Candidate Profile:**
  - Roles: {{roles}}
  - Target Companies: {{companies}}

  **Instructions:**
  1.  Generate a plan for **exactly {{count}} days**, starting from day {{startDay}}.
  2.  The plan MUST be tailored to the types of questions and priorities of the specified companies.
  3.  Structure the topics logically.
  4.  For each day, provide the day number, a specific topic, and a brief, encouraging one-sentence description of the goal.
  `,
});

export async function generateSyllabus(input: GenerateSyllabusInput): Promise<GenerateSyllabusOutput> {
  return generateSyllabusFlow(input);
}


const generateSyllabusFlow = ai.defineFlow(
  {
    name: 'generateSyllabusFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    const totalDays = 60;
    const chunkSize = 20;
    let allDays: SyllabusDay[] = [];

    for (let i = 0; i < Math.ceil(totalDays / chunkSize); i++) {
        const startDay = i * chunkSize + 1;
        
        try {
            const { output } = await prompt({
                ...input,
                count: chunkSize,
                startDay: startDay,
            });

            if (output && output.syllabus) {
                allDays = allDays.concat(output.syllabus);
            } else {
                 console.error(`Syllabus generation returned no output for chunk starting at day ${startDay}.`);
            }
        } catch(error) {
             console.error(`Syllabus generation failed for chunk starting at day ${startDay}:`, error);
        }
    }
    
    // Fallback to ensure we always have 60 days.
    if (allDays.length < totalDays) {
        const remainingDays = totalDays - allDays.length;
        const fallbackTopics = [
            "Review: Data Structures",
            "Practice: Algorithms",
            "System Design: Scalability",
            "Behavioral Interview Practice",
            "Review: Company-specific Questions"
        ];
        for (let i = 0; i < remainingDays; i++) {
            allDays.push({
                day: allDays.length + 1,
                topic: fallbackTopics[i % fallbackTopics.length],
                description: "Reviewing key concepts and practicing problems."
            });
        }
    }

    // Ensure the output contains exactly 60 days and days are numbered correctly.
    const finalSyllabus = allDays.slice(0, totalDays).map((day, index) => ({
      ...day,
      day: index + 1,
    }));

    if (finalSyllabus.length === 0) {
        throw new Error(`Syllabus generation failed completely. Please try again.`);
    }

    return { syllabus: finalSyllabus };
  }
);
