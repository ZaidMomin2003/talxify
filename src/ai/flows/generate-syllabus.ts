
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
  syllabus: z.array(SyllabusDaySchema).describe('An array of daily learning topics for the requested period.'),
});
export type GenerateSyllabusOutput = z.infer<typeof GenerateSyllabusOutputSchema>;

export async function generateSyllabus(input: GenerateSyllabusInput): Promise<GenerateSyllabusOutput> {
  return generateSyllabusFlow(input);
}


const SyllabusChunkInputSchema = GenerateSyllabusInputSchema.extend({
    startDay: z.number(),
    endDay: z.number(),
});

const generateSyllabusChunkPrompt = ai.definePrompt({
  name: 'generateSyllabusChunkPrompt',
  input: {schema: SyllabusChunkInputSchema},
  output: {schema: GenerateSyllabusOutputSchema},
  config: {
    model: 'googleai/gemini-1.5-flash-latest',
     safetySettings: [
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
        },
    ],
  },
  prompt: `You are an expert career coach and technical interviewer who has worked at FAANG companies.
  Your task is to generate a structured interview preparation syllabus for a candidate for days {{startDay}} to {{endDay}}.

  **Candidate Profile:**
  - Roles: {{roles}}
  - Target Companies: {{companies}}

  **Instructions:**
  1.  Generate a plan for the period from day {{startDay}} to day {{endDay}}.
  2.  The plan MUST be tailored to the types of questions and priorities of the specified companies. For example, if "Google" is a target, include more algorithm and data structure topics. If "Netflix" is included, add system design for scalability.
  3.  Structure the topics logically, starting with fundamentals and progressing to more advanced concepts.
  4.  For each day, provide the day number, a specific, actionable topic (e.g., "Two Pointers & Sliding Window"), and a brief, encouraging one-sentence description of the goal for the day.
  5.  Ensure the response contains exactly {{endDay - startDay + 1}} entries in the syllabus array.
  `,
});


const generateSyllabusFlow = ai.defineFlow(
  {
    name: 'generateSyllabusFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    try {
        const [part1Result, part2Result] = await Promise.all([
            generateSyllabusChunkPrompt({ ...input, startDay: 1, endDay: 30 }),
            generateSyllabusChunkPrompt({ ...input, startDay: 31, endDay: 60 }),
        ]);

        const fullSyllabus = [
            ...(part1Result.output?.syllabus || []),
            ...(part2Result.output?.syllabus || []),
        ];

        if (fullSyllabus.length < 60) {
            throw new Error(`Incomplete syllabus generated. Only got ${fullSyllabus.length} days.`);
        }

        // Ensure syllabus from AI is sorted and day numbers are correct, just in case
        const finalSyllabus = fullSyllabus
            .sort((a, b) => a.day - b.day)
            .slice(0, 60)
            .map((day, index) => ({
                ...day,
                day: index + 1, // Re-assign day number to ensure it's sequential
            }));

        return { syllabus: finalSyllabus };

    } catch (error) {
        console.error("Syllabus generation failed, applying fallback.", error);
        
        const fallbackSyllabus: SyllabusDay[] = Array.from({ length: 60 }, (_, i) => ({
            day: i + 1,
            topic: `Review Day ${i + 1}: Core CS Fundamentals`,
            description: "Revisiting foundational concepts to build a strong base."
        }));

        return { syllabus: fallbackSyllabus };
    }
  }
);
