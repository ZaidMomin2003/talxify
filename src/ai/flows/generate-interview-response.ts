
'use server';

/**
 * @fileOverview A flow to generate conversational responses for a mock interview.
 * This flow is designed for a streaming, low-latency setup and uses Genkit with Gemini.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { InterviewStateSchema, type InterviewState, type InterviewResponse } from '@/lib/interview-types';

const MAX_QUESTIONS = 6;

const getSystemPrompt = (state: InterviewState) => `
    You are Kathy, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview that lasts about ${MAX_QUESTIONS} questions.
    You have an excited and encouraging tone. You should speak at a slightly slower, deliberate pace, and pause briefly (like for 100ms) after full stops to make the conversation feel more natural.
    
    The candidate is interviewing for a ${state.level} ${state.role} role. The main technical topic is: ${state.topic}.
    The questions should be case-study based and relevant to the user's expertise.
    ${state.company ? `The interview is tailored for ${state.company}. Adapt your style accordingly (e.g., STAR method for Amazon, open-ended problem-solving for Google).` : ''}

    Conversation Rules:
    1.  Start with a brief, friendly greeting if the history is empty.
    2.  Ask ONE main question at a time.
    3.  After the user answers, provide a VERY brief, natural acknowledgment (like "Okkkk, that makes sense," "Hmm, interesting approach," or "Ahh, I see.") before immediately asking the next logical follow-up question. Your entire response should be just 1-2 sentences.
    4.  Your follow-up question should extend the previous topic or ask for more detail.
    5.  Keep your responses extremely concise. DO NOT speak in long paragraphs.
    6.  After you have asked ${MAX_QUESTIONS} questions and the user has responded, you MUST conclude the interview.
    7.  Your final message MUST start with "Okay, that's all the questions I have for today. Great job!". Do not provide detailed feedback, as that is handled by another flow. Just give a brief concluding statement.
    8.  Do not say "goodbye" or other pleasantries in the final message. Just give the concluding statement and end.
`;

const generateInterviewResponseFlow = ai.defineFlow(
  {
    name: 'generateInterviewResponseFlow',
    inputSchema: InterviewStateSchema,
    outputSchema: z.string(), // The output is just the AI's text response
  },
  async (state) => {
    const systemPrompt = getSystemPrompt(state);
    
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: state.history.map(msg => msg.content).join('\n\n'),
      system: systemPrompt,
      config: {
        temperature: 0.8,
      },
    });

    return llmResponse.text;
  }
);


export async function generateInterviewResponse(state: InterviewState): Promise<InterviewResponse> {
  const aiResponseText = await generateInterviewResponseFlow(state);

  const newState: InterviewState = { ...state };
  newState.history.push({ role: 'assistant', content: aiResponseText });

  const questionsAsked = newState.history.filter(m => m.role === 'assistant').length;
  
  if (questionsAsked >= MAX_QUESTIONS || aiResponseText.startsWith("Okay, that's all the questions I have")) {
      newState.isComplete = true;
  }

  return {
    response: aiResponseText,
    newState: newState,
  };
}
