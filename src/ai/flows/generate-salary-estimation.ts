
'use server';

/**
 * @fileOverview An AI flow to estimate a software developer's salary.
 *
 * - generateSalaryEstimation - A function that estimates salary based on various factors.
 * - GenerateSalaryEstimationInput - The input type for the function.
 * - GenerateSalaryEstimationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateSalaryEstimationInputSchema = z.object({
  role: z.string().describe('The job title or role, e.g., "Frontend Developer".'),
  experience: z.number().min(0).describe('Years of professional experience.'),
  skills: z.string().describe('A comma-separated list of key technical skills, e.g., "React, TypeScript, AWS".'),
  location: z.string().describe('The city and country, e.g., "San Francisco, USA" or "Bengaluru, India".'),
  companySize: z.enum(['startup', 'mid-size', 'large-enterprise']).describe('The size of the company.'),
});
export type GenerateSalaryEstimationInput = z.infer<typeof GenerateSalaryEstimationInputSchema>;

export const GenerateSalaryEstimationOutputSchema = z.object({
  estimatedSalary: z.number().describe('The most likely estimated annual salary in the local currency (e.g., USD for USA, INR for India).'),
  salaryRangeMin: z.number().describe('The lower bound of the likely salary range.'),
  salaryRangeMax: z.number().describe('The upper bound of the likely salary range.'),
  currency: z.string().length(3).describe('The 3-letter ISO currency code (e.g., USD, INR).'),
  justification: z.string().describe('A brief, 2-3 sentence explanation of the factors influencing the estimate, such as location, experience, and skill demand.'),
});
export type GenerateSalaryEstimationOutput = z.infer<typeof GenerateSalaryEstimationOutputSchema>;

export async function generateSalaryEstimation(
  input: GenerateSalaryEstimationInput
): Promise<GenerateSalaryEstimationOutput> {
  return generateSalaryEstimationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSalaryEstimationPrompt',
  input: { schema: GenerateSalaryEstimationInputSchema },
  output: { schema: GenerateSalaryEstimationOutputSchema },
  prompt: `You are an expert compensation analyst for the tech industry. Your task is to estimate the annual salary for a software development role based on the provided data.

Provide your estimate in the local currency based on the location provided (e.g., INR for India, USD for the United States).

Candidate Profile:
- Role: {{role}}
- Experience: {{experience}} years
- Skills: {{skills}}
- Location: {{location}}
- Company Size: {{companySize}}

Based on this, provide:
1.  **estimatedSalary**: Your best estimate for the annual salary.
2.  **salaryRangeMin** and **salaryRangeMax**: A reasonable range for this salary.
3.  **currency**: The appropriate 3-letter currency code.
4.  **justification**: A brief summary explaining your estimate, considering the interplay of location, experience level, and the current market demand for the specified skills.
`,
});

const generateSalaryEstimationFlow = ai.defineFlow(
  {
    name: 'generateSalaryEstimationFlow',
    inputSchema: GenerateSalaryEstimationInputSchema,
    outputSchema: GenerateSalaryEstimationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("The AI failed to generate a salary estimation.");
    }
    
    // Basic validation to ensure the numbers make sense
    if (output.salaryRangeMin > output.salaryRangeMax || output.estimatedSalary < output.salaryRangeMin || output.estimatedSalary > output.salaryRangeMax) {
        console.error("AI returned inconsistent salary numbers", output);
        // Attempt a self-correction
        output.salaryRangeMin = Math.min(output.salaryRangeMin, output.estimatedSalary);
        output.salaryRangeMax = Math.max(output.salaryRangeMax, output.estimatedSalary);
    }
    
    return output;
  }
);
