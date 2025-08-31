
'use server';

/**
 * @fileOverview A flow to generate conversational responses for a mock interview using Deepgram's LLM.
 * This flow is designed for a streaming, low-latency setup.
 */

import { z } from 'genkit';
import { createClient } from '@deepgram/sdk';
import { InterviewStateSchema, type InterviewState, type InterviewResponse } from '@/lib/interview-types';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const MAX_QUESTIONS = 6;

const getSystemPrompt = (state: InterviewState) => `
    You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview that lasts about ${MAX_QUESTIONS} questions.
    The candidate is interviewing for a ${state.level} ${state.role} role. The main technical topic is: ${state.topic}.
    ${state.company ? `The interview is tailored for ${state.company}. Adapt your style accordingly (e.g., STAR method for Amazon, open-ended problem-solving for Google).` : ''}

    Conversation Rules:
    1.  Start with a brief, friendly greeting if the history is empty.
    2.  Ask ONE main question at a time.
    3.  After the user answers, provide a VERY brief, natural acknowledgment (like "Okkkk, that makes sense," or "Hmm, interesting approach.") before immediately asking the next logical follow-up question. Your entire response should be just 1-2 sentences.
    4.  Your follow-up question should extend the previous topic or ask for more detail.
    5.  Keep your responses extremely concise. DO NOT speak in long paragraphs.
    6.  After you have asked ${MAX_QUESTIONS} questions and the user has responded, you MUST conclude the interview.
    7.  Your final message MUST be a fair and realistic review of the user's performance based on the entire conversation. Start with "Okay, that's all the questions I have. Here's my feedback...". Provide specific examples of their strengths and weaknesses, and list concrete topics to learn or review for improvement. Be direct and constructive.
    8.  Do not say "goodbye" or other pleasantries in the final review. Just give the feedback and end.

    Current Conversation History:
    ${state.history.map(m => `${m.role === 'user' ? 'User' : 'Alex'}: ${m.content}`).join('\n')}
    Alex:
`;

export async function generateInterviewResponse(state: InterviewState): Promise<InterviewResponse> {
  const systemPrompt = getSystemPrompt(state);
  
  const response = await deepgram.listen.asynclive.fromUrl(
    { url: 'https://placeholder.url/for/text/generation' }, // URL is not used for text-only generation
    {
      model: 'aura-asteria-en',
      punctuate: true,
      smart_format: true,
      prompt: systemPrompt,
    }
  );

  const aiResponseText = response.result?.results.channels[0].alternatives[0].transcript || "I'm sorry, I seem to be having trouble responding.";

  const newState: InterviewState = { ...state };
  newState.history.push({ role: 'assistant', content: aiResponseText });

  const questionsAsked = Math.floor(newState.history.length / 2);
  
  if (questionsAsked >= MAX_QUESTIONS || aiResponseText.startsWith("Okay, that's all the questions I have.")) {
      newState.isComplete = true;
  }

  return {
    response: aiResponseText,
    newState: newState,
  };
}
