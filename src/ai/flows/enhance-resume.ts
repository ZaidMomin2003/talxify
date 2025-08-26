'use server';
/**
 * @fileOverview An AI flow to enhance the content of a user's resume.
 *
 * - enhanceResume - A function that takes resume data and returns an enhanced version.
 * - ResumeDataSchema - The Zod schema for the resume data structure.
 * - EnhanceResumeOutput - The return type for the enhanceResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { ResumeData } from '@/lib/types';

// Define a Zod schema that matches the ResumeData type
const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  duration: z.string(),
  description: z.string(),
});

const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
});

const SkillSchema = z.object({ name: z.string() });
const LanguageSchema = z.object({ name: z.string(), proficiency: z.string(), level: z.number() });
const HobbySchema = z.object({ name: z.string() });

export const ResumeDataSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    profession: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    linkedin: z.string(),
    github: z.string(),
    website: z.string(),
    summary: z.string(),
  }),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema),
  languages: z.array(LanguageSchema),
  hobbies: z.array(HobbySchema),
});
export type ResumeDataInput = z.infer<typeof ResumeDataSchema>;

const EnhanceResumeOutputSchema = z.object({
  enhancedSummary: z.string().describe("The rewritten, enhanced professional summary."),
  enhancedExperience: z.array(z.object({
    originalRole: z.string(),
    enhancedDescription: z.string().describe("The rewritten, enhanced description for the work experience. Use action verbs and focus on achievements."),
  })),
});
export type EnhanceResumeOutput = z.infer<typeof EnhanceResumeOutputSchema>;


export async function enhanceResume(
  input: ResumeDataInput
): Promise<EnhanceResumeOutput> {
  return enhanceResumeFlow(input);
}


const prompt = ai.definePrompt({
  name: 'enhanceResumePrompt',
  input: { schema: ResumeDataSchema },
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
    inputSchema: ResumeDataSchema,
    outputSchema: EnhanceResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
