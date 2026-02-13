
'use server';
/**
 * @fileOverview An AI flow to enhance the content of a user's resume.
 *
 * - enhanceResume - A function that takes resume data and returns an enhanced version.
 */

import { ai } from '@/ai/genkit';
import { ResumeDataInputSchema, EnhanceResumeOutputSchema, type ResumeDataInput, type EnhanceResumeOutput } from '@/lib/types';


export async function enhanceResume(
  input: ResumeDataInput
): Promise<EnhanceResumeOutput> {
  return enhanceResumeFlow(input);
}


const prompt = ai.definePrompt({
  name: 'enhanceResumePrompt',
  input: { schema: ResumeDataInputSchema },
  output: { schema: EnhanceResumeOutputSchema },
  prompt: `You are an expert resume writer and career coach. Your task is to enhance the provided resume content to make it more professional, impactful, and clear.

Focus on the following:
1.  **Professional Summary**: Rewrite the summary to be a powerful and concise pitch.
2.  **Work Experience Descriptions**: For each role, rewrite the description to use strong action verbs and quantify achievements where possible (e.g., "Increased sales by 10%" instead of "Responsible for sales"). Focus on results, not just duties.

Original Resume Content:
---
**Summary**:
{{{personalInfo.summary}}}

**Experience**:
{{#each experience}}
- **Role**: {{this.role}} at {{this.company}}
  **Original Description**: {{this.description}}
---
{{/each}}

Provide the enhanced summary and the enhanced description for each experience entry.
`,
});

const enhanceResumeFlow = ai.defineFlow(
  {
    name: 'enhanceResumeFlow',
    inputSchema: ResumeDataInputSchema,
    outputSchema: EnhanceResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
