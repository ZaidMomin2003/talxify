
'use server';
/**
 * @fileOverview An AI flow to extract structured information from a user's introduction.
 *
 * - extractIcebreakerInfo - A function that takes a user's self-introduction and extracts key details.
 */
import { ai } from '@/ai/genkit';
import { IcebreakerDataSchema, type IcebreakerData } from '@/lib/types';
import { z } from 'zod';

export async function extractIcebreakerInfo(
  introductionText: string
): Promise<IcebreakerData> {
  return extractInfoFlow(introductionText);
}

const prompt = ai.definePrompt({
  name: 'extractIcebreakerInfoPrompt',
  input: { schema: z.string() },
  output: { schema: IcebreakerDataSchema },
  prompt: `You are an information extraction expert. Analyze the following self-introduction from a candidate and extract the specified entities.

If a piece of information is not mentioned, leave the corresponding field null.

**Candidate's Introduction:**
"{{input}}"

Based on this text, extract the following:
- The candidate's first name.
- Their college or university.
- The city they are from.
- A list of their technical skills.
- A list of their hobbies.
`,
});

const extractInfoFlow = ai.defineFlow(
  {
    name: 'extractInfoFlow',
    inputSchema: z.string(),
    outputSchema: IcebreakerDataSchema,
  },
  async (input) => {
    // If the introduction is very short, it's likely not a real intro.
    if (input.trim().length < 10) {
      return { isIcebreaker: false };
    }

    const { output } = await prompt(input);

    if (!output) {
      return { isIcebreaker: false };
    }

    // A simple heuristic: if at least a name or college is found, it's likely an intro.
    const isIcebreaker = !!(output.name || output.college);

    return {
      ...output,
      isIcebreaker,
    };
  }
);
