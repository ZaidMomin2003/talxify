
'use server';

/**
 * @fileOverview An AI flow to estimate a software developer's salary.
 *
 * - generateSalaryEstimation - A function that estimates salary based on various factors.
 */

import { ai } from '@/ai/genkit';
import { GenerateSalaryEstimationInputSchema, GenerateSalaryEstimationOutputSchema, type GenerateSalaryEstimationInput, type GenerateSalaryEstimationOutput } from '@/lib/types/salary';


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
4.  **justification**: A brief, 2-3 sentence explanation of the factors influencing the estimate, such as location, experience, and skill demand.
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
