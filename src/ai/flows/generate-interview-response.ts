
'use server';

/**
 * @fileOverview An AI flow for generating interview responses using Groq.
 */

import { z } from 'genkit';
import Groq from 'groq-sdk';
import { ai } from '@/ai/genkit';
import { InterviewState, InterviewResponse } from '@/lib/interview-types';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables.');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


const generateInterviewResponseFlow = ai.defineFlow(
  {
    name: 'generateInterviewResponseFlow',
    inputSchema: InterviewState,
    outputSchema: InterviewResponse,
  },
  async (state) => {
    const { topic, role, level, company, history } = state;
    
    const systemPrompt = `
      You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview.
      The candidate is interviewing for a ${level} ${role} role. 
      The main technical topic is: ${topic}.
      ${company ? `The interview is tailored for ${company}. Adapt your style and questions accordingly (e.g., for Amazon, focus on STAR method for behavioral questions).` : ''}

      Conversation Rules:
      1. Start with a brief, friendly greeting and state the topic.
      2. Ask ONE main question at a time. It can be a mix of technical and behavioral questions related to the role and topic.
      3. Keep your responses concise (1-3 sentences).
      4. After the user answers, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then ask the next question. Do not provide feedback during the interview.
      5. After you have asked about 6-7 questions, you MUST conclude the interview.
      6. Your final message MUST begin with the exact phrase: "Okay, that's all the questions I have. Thank you for your time.".
    `;

    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts[0].text
      }))
    ];
    
    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192", // A fast and capable model
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I seem to be having trouble thinking of a response.";

    const updatedHistory = [
      ...history,
      { role: 'model' as const, parts: [{ text: aiResponse }] }
    ];

    const isComplete = aiResponse.startsWith("Okay, that's all the questions I have.");

    return {
      response: aiResponse,
      newState: {
        ...state,
        history: updatedHistory,
        isComplete: isComplete,
      },
    };
  }
);


export async function generateInterviewResponse(
  state: z.infer<typeof InterviewState>
): Promise<z.infer<typeof InterviewResponse>> {
  return generateInterviewResponseFlow(state);
}
