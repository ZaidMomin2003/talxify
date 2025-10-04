
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

export async function generateSyllabus(input: GenerateSyllabusInput): Promise<GenerateSyllabusOutput> {
  return generateSyllabusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSyllabusPrompt',
  input: {schema: GenerateSyllabusInputSchema},
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
  Your task is to generate a structured 60-day interview preparation syllabus for a candidate.

  **Candidate Profile:**
  - Roles: {{roles}}
  - Target Companies: {{companies}}

  **Instructions:**
  1.  Generate a plan for **exactly 60 days**.
  2.  The plan MUST be tailored to the types of questions and priorities of the specified companies. For example, if "Google" is a target, include more algorithm and data structure topics. If "Netflix" is included, add system design for scalability.
  3.  Structure the topics logically, starting with fundamentals and progressing to more advanced concepts.
  4.  For each day, provide the day number, a specific, actionable topic (e.g., "Two Pointers & Sliding Window"), and a brief, encouraging one-sentence description of the goal for the day.
  5.  Ensure the response contains exactly 60 entries in the syllabus array.
  `,
});


const generateSyllabusFlow = ai.defineFlow(
  {
    name: 'generateSyllabusFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output || !output.syllabus || output.syllabus.length < 60) {
        console.error("Syllabus generation resulted in an incomplete plan.", output);
        // Fallback mechanism to ensure a valid 60-day plan is always returned
        const fallbackSyllabus: SyllabusDay[] = Array.from({ length: 60 }, (_, i) => ({
            day: i + 1,
            topic: `Review Day ${i + 1}: Core CS Fundamentals`,
            description: "Revisiting foundational concepts to build a strong base."
        }));
        
        // If some days were generated, merge them with the fallback
        if(output?.syllabus) {
            output.syllabus.forEach(day => {
                if (day.day >= 1 && day.day <= 60) {
                    fallbackSyllabus[day.day - 1] = day;
                }
            });
        }

        return { syllabus: fallbackSyllabus };
    }

    // Ensure syllabus is sorted and day numbers are correct
    const finalSyllabus = output.syllabus
      .sort((a, b) => a.day - b.day)
      .slice(0, 60)
      .map((day, index) => ({
        ...day,
        day: index + 1,
      }));

    return { syllabus: finalSyllabus };
  }
);
