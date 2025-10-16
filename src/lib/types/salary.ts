
import { z } from 'zod';

export const GenerateSalaryEstimationInputSchema = z.object({
  role: z.string().min(1, 'Job role is required.').describe('The job title or role, e.g., "Frontend Developer".'),
  experience: z.number().min(0).describe('Years of professional experience.'),
  skills: z.string().min(1, 'Skills are required.').describe('A comma-separated list of key technical skills, e.g., "React, TypeScript, AWS".'),
  location: z.string().min(1, 'Location is required.').describe('The city and country, e.g., "San Francisco, USA" or "Bengaluru, India".'),
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
