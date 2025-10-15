
'use server';

/**
 * @fileOverview A flow to analyze a user's mock interview performance.
 *
 * - generateInterviewFeedback - The main function to trigger the analysis.
 * - GenerateInterviewFeedbackInput - The input type for the analysis flow.
 * - GenerateInterviewFeedbackOutput - The output type for the analysis flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscriptEntrySchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});

const GenerateInterviewFeedbackInputSchema = z.object({
  transcript: z.array(TranscriptEntrySchema).describe("The full transcript of the interview, alternating between the AI interviewer (Mark) and the user."),
  topic: z.string().describe("The main topic of the interview (e.g., 'React Hooks')."),
  role: z.string().describe("The role the user was interviewing for (e.g., 'Frontend Developer')."),
  company: z.string().optional().describe("The target company for the interview, if specified (e.g., 'Google').")
});
export type GenerateInterviewFeedbackInput = z.infer<typeof GenerateInterviewFeedbackInputSchema>;

const QuestionFeedbackSchema = z.object({
    question: z.string().describe("The question asked by the AI interviewer."),
    userAnswer: z.string().describe("The user's answer to the question."),
    feedback: z.string().describe("Specific, constructive feedback on the user's answer. Comment on technical accuracy, clarity, and structure. If a company was specified, evaluate the answer in that context (e.g., STAR method for behavioral questions at Amazon)."),
    idealAnswer: z.string().describe("An example of a concise, ideal answer to the question."),
    score: z.number().min(0).max(100).describe("A score for this specific answer from 0 to 100."),
});

const GenerateInterviewFeedbackOutputSchema = z.object({
    likelihoodToCrack: z.number().min(0).max(100).describe("The user's likelihood of cracking a real interview, as a percentage."),
    englishProficiency: z.number().min(0).max(100).describe("A score from 0-100 for the user's English proficiency, grammar, and clarity."),
    confidenceScore: z.number().min(0).max(100).describe("A score from 0-100 for the user's apparent confidence level."),
    summary: z.string().describe("A 2-3 sentence summary of the user's performance, highlighting their strengths and key areas for improvement."),
    strengths: z.array(z.string()).describe("A bulleted list of 2-3 specific strengths the user demonstrated."),
    areasForImprovement: z.array(z.string()).describe("A bulleted list of the 2-3 most important areas for the user to work on."),
    questionFeedback: z.array(QuestionFeedbackSchema).describe("A detailed analysis of each question and answer pair.")
});
export type GenerateInterviewFeedbackOutput = z.infer<typeof GenerateInterviewFeedbackOutputSchema>;


export async function generateInterviewFeedback(
  input: GenerateInterviewFeedbackInput
): Promise<GenerateInterviewFeedbackOutput> {
  // If the transcript is empty or has less than 2 entries, it's not a real interview.
  if (!input.transcript || input.transcript.length < 2) {
      return {
          likelihoodToCrack: 0,
          englishProficiency: 0,
          confidenceScore: 0,
          summary: "The interview was too short to provide a meaningful analysis. Try to engage in a conversation with the interviewer to get feedback.",
          strengths: [],
          areasForImprovement: ["Complete a longer interview to receive feedback."],
          questionFeedback: [],
      }
  }
  return generateInterviewFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewFeedbackPrompt',
  input: { schema: GenerateInterviewFeedbackInputSchema },
  output: { schema: GenerateInterviewFeedbackOutputSchema },
  prompt: `You are an expert interview coach for software developers, analyzing a mock interview conducted by your AI colleague, Mark.
  Your task is to provide comprehensive, constructive, and encouraging feedback based on the provided transcript. The user's goal is to improve and land a job.

  The user was interviewing for a {{role}} role on the topic of {{topic}}.
  {{#if company}}
  The interview was specifically tailored for **{{company}}**. Your feedback should reflect this. For example, if it was for Amazon, you should evaluate behavioral answers against the STAR method and Leadership Principles.
  {{/if}}

  Please analyze the entire transcript and provide the following:
  1.  **Question-by-Question Feedback**: For each question Mark asked, provide:
      - The question text.
      - The user's answer.
      - Specific, actionable feedback on the answer.
      - A well-structured, ideal answer that serves as a model.
      - A score for that specific answer (0-100).
  2.  **Overall Scores**: Based on the entire conversation, provide:
      - likelihoodToCrack: An estimated percentage (0-100) of passing a real interview.
      - englishProficiency: A score from 0-100 evaluating grammar and clarity.
      - confidenceScore: A score from 0-100 based on tone and directness.
  3.  **Summary**: A concise, 2-3 sentence summary of the performance.
  4.  **Strengths**: A list of 2-3 key strengths.
  5.  **Areas for Improvement**: A list of the 2-3 most important areas to work on.

  Here is the interview transcript:
  {{#each transcript}}
    **{{#if (eq speaker "ai")}}Mark{{else}}You{{/if}}**: {{text}}
  {{/each}}
  `,
});

const generateInterviewFeedbackFlow = ai.defineFlow(
  {
    name: 'generateInterviewFeedbackFlow',
    inputSchema: GenerateInterviewFeedbackInputSchema,
    outputSchema: GenerateInterviewFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    
    if (!output) {
      throw new Error("The AI failed to generate feedback. The output was empty.");
    }
    
    // Basic validation to ensure the output structure is roughly correct
    if (!output.summary || !output.questionFeedback) {
        console.error("Incomplete feedback from AI", output);
        throw new Error("The AI returned an incomplete feedback structure.");
    }
    
    return output;
  }
);
