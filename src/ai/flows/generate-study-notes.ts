
'use server';

/**
 * @fileOverview An AI agent to generate detailed study notes on a given technical topic.
 *
 * - generateStudyNotes - A function that generates comprehensive study materials.
 * - GenerateStudyNotesInput - The input type.
 * - GenerateStudyNotesOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TerminologySchema = z.object({
  term: z.string().describe('The technical term.'),
  definition: z.string().describe('A clear and concise definition of the term.'),
});

const ExampleSchema = z.object({
  title: z.string().describe('A descriptive title for the code example.'),
  code: z.string().describe('A functional code snippet demonstrating the concept.'),
  explanation: z.string().describe('A step-by-step explanation of how the code works.'),
});

const InterviewQuestionSchema = z.object({
  question: z.string().describe('A common interview question related to the topic.'),
  answer: z.string().describe('A detailed, expert-level answer to the question.'),
});

const GenerateStudyNotesInputSchema = z.object({
  topic: z.string().describe('The technical topic for which to generate study notes (e.g., "React Hooks", "JavaScript Promises", "CSS Flexbox").'),
});
export type GenerateStudyNotesInput = z.infer<typeof GenerateStudyNotesInputSchema>;

const GenerateStudyNotesOutputSchema = z.object({
  topic: z.string().describe('The main topic of the notes.'),
  introduction: z.string().describe('A brief, engaging introduction to the topic, explaining its importance and what the user will learn.'),
  terminology: z.array(TerminologySchema).describe('A list of key terms and their definitions.'),
  coreConcepts: z.array(z.object({
    concept: z.string().describe("A core concept or sub-topic."),
    description: z.string().describe("A detailed, bullet-point description of the concept.")
  })).describe('A breakdown of the fundamental concepts, organized from basic to advanced.'),
  examples: z.array(ExampleSchema).describe('A set of practical, real-world code examples with explanations.'),
  useCases: z.array(z.string()).describe('A bulleted list of common use cases and scenarios where this topic is applied.'),
  interviewQuestions: z.array(InterviewQuestionSchema).describe('A list of potential interview questions with sample answers.'),
});
export type GenerateStudyNotesOutput = z.infer<typeof GenerateStudyNotesOutputSchema>;

export async function generateStudyNotes(input: GenerateStudyNotesInput): Promise<GenerateStudyNotesOutput> {
  return generateStudyNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyNotesPrompt',
  input: {schema: GenerateStudyNotesInputSchema},
  output: {schema: GenerateStudyNotesOutputSchema},
  prompt: `You are an expert technical writer and educator. Your task is to create a comprehensive, detailed, and easy-to-understand study guide for a developer on the topic of: "{{topic}}".

Structure the guide in the following manner, starting from fundamental concepts and progressing to more complex ones.

1.  **Introduction**: Write a brief, engaging introduction. Explain what {{topic}} is and why it's important for a developer to know.
2.  **Core Concepts**: Break down the topic into its most critical concepts. Present them in a logical order, from easy to difficult. For each concept, provide a detailed description using bullet points for clarity.
3.  **Key Terminology**: Define the essential terms a developer must know related to {{topic}}.
4.  **Practical Examples**: Provide at least two clear, practical code examples. For each, include a title, the code snippet, and a step-by-step explanation.
5.  **Common Use Cases**: List the most common real-world scenarios and use cases for {{topic}}.
6.  **Interview Questions**: List potential interview questions related to the topic, along with well-explained, expert answers.

Generate a rich, detailed, and well-structured response that will genuinely help someone master this topic for a technical interview.
`,
});

const generateStudyNotesFlow = ai.defineFlow(
  {
    name: 'generateStudyNotesFlow',
    inputSchema: GenerateStudyNotesInputSchema,
    outputSchema: GenerateStudyNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    
