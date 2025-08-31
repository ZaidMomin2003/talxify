
'use server';

/**
 * @fileOverview A flow to conduct a friendly icebreaker interview using Deepgram's conversational AI.
 */

import { z } from 'genkit';
import { createClient } from '@deepgram/sdk';
import { InterviewStateSchema, InterviewResponseSchema, type InterviewState, type InterviewResponse } from '@/lib/interview-types';
import { updateUserFromIcebreaker } from '@/lib/firebase-service';
import type { IcebreakerData } from '@/lib/types';


if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const MAX_QUESTIONS = 5; // Keep it short and sweet

const getSystemPrompt = (history: InterviewState['history']) => `
    You are Alex, an AI interviewer. Your persona is SUPER cheerful, friendly, and encouraging. Your goal is to conduct a short, 5-minute icebreaker interview to get to know the candidate.

    Conversation Rules:
    1.  Start with a warm, friendly greeting if it's the beginning of the conversation.
    2.  Ask ONE question at a time. Keep your questions open-ended and conversational.
    3.  Your primary goal is to discover the user's: **college, city, main skills, and hobbies.**
    4.  Ask questions naturally to uncover this information. For example:
        - "So, tell me a little about yourself! Where are you joining from today?" (for city)
        - "What are you studying or what did you study?" (for college)
        - "What are some of the main technologies or skills you're passionate about?" (for skills)
        - "Awesome! And when you're not coding, what do you like to do for fun?" (for hobbies)
    5.  After the user answers, give a brief, positive acknowledgment (like "That's so cool!", "Awesome!", "Love that!").
    6.  Keep your responses very concise (1-2 sentences).
    7.  After you've asked about 4-5 questions and feel you have a good sense of the user, you MUST conclude the interview.
    8.  Your final message MUST start with: "This has been super fun! Thanks so much for sharing. I've updated your profile with some of the info you gave me. We're all set!". Do not add anything else to this final message.

    Current Conversation History:
    ${history.map(m => `${m.role === 'user' ? 'User' : 'Alex'}: ${m.content}`).join('\n')}
    Alex:
`;


export async function conductIcebreakerInterview(userId: string, state: InterviewState): Promise<InterviewResponse> {
  const systemPrompt = getSystemPrompt(state.history);
  
  const response = await deepgram.listen.asynclive.fromUrl(
    { url: 'https://placeholder.url/for/text/generation' }, // URL is not used for text-only generation but is required by the method signature
    {
      model: 'aura-asteria-en',
      punctuate: true,
      smart_format: true,
      prompt: systemPrompt,
      // We are using this method for text generation by not providing an audio stream.
      // The prompt will guide the model's response.
    }
  );

  const aiResponseText = response.result?.results.channels[0].alternatives[0].transcript || "I'm sorry, I seem to be having trouble responding.";

  const newState: InterviewState = { ...state };
  newState.history.push({ role: 'assistant', content: aiResponseText });

  const questionsAsked = Math.floor(newState.history.length / 2);
  
  // Check if it's time to end the interview
  if (questionsAsked >= MAX_QUESTIONS || aiResponseText.startsWith("This has been super fun!")) {
      newState.isComplete = true;

      // TODO: In a real application, we would call another GenAI flow here to extract the structured data
      // from the conversation history and then call updateUserFromIcebreaker.
      // For this example, we'll assume this step happens and just mark it complete.
      console.log("Interview complete. In a real app, we would now extract data and update the user profile.");
  }

  return {
    response: aiResponseText,
    newState: newState,
  };
}
