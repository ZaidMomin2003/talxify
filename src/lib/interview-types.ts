
import { z } from 'genkit';
import { MessageSchema } from 'genkit/model';

export const InterviewStateSchema = z.object({
  interviewId: z.string().describe('A unique identifier for this interview session.'),
  topic: z.string().describe('The primary technical topic for the interview (e.g., "React Hooks").'),
  level: z.string().describe("The candidate's experience level (e.g., \"entry-level\", \"senior\")."),
  role: z.string().describe('The job role the candidate is interviewing for (e.g., "Frontend Developer").'),
  company: z.string().optional().describe('The target company for the interview (e.g., "Google", "Amazon").'),
  history: z.array(MessageSchema).describe('The history of the conversation so far.'),
  questionsAsked: z.number().int().describe('The number of main questions the AI has already asked.'),
  isComplete: z.boolean().describe('A flag indicating if the interview has concluded.'),
});
export type InterviewState = z.infer<typeof InterviewStateSchema>;

export const InterviewResponseSchema = z.object({
  response: z.string().describe("The AI interviewer's next response or question."),
  newState: InterviewStateSchema.describe('The updated state of the interview after this turn.'),
});
export type InterviewResponse = z.infer<typeof InterviewResponseSchema>;
