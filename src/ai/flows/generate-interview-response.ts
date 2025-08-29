
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
    ${state.company ? `The interview is tailored for ${state.company}. Adapt your style accordingly (e.g., STAR method for Amazon, open-ended problem-solving for Google).` : ''}

    Conversation Rules:
    1.  **Initial Greeting**: If the history is empty, your first message MUST be a simple, friendly greeting like "Hey, how are you today?" or "Hi there, how are you doing?". Do not ask an interview question yet.
    2.  **Transition to Interview**: After the user responds to your initial greeting, your next response should acknowledge their reply and then smoothly transition into the first interview question. For example: "Great to hear. Well, let's dive right in. For your first question..."
    3.  **Core Interaction Loop**: For all subsequent turns, ask ONE main question at a time. After the user answers, provide a VERY brief, natural acknowledgment (like "Okkkk, that makes sense," "Hmm, interesting approach," or "Ahh, I see.") before immediately asking the next logical follow-up question. Your entire response should be just 1-2 sentences.
    4.  **Follow-up Style**: Your follow-up question should extend the previous topic or ask for more detail. Keep your responses extremely concise. DO NOT speak in long paragraphs.
    5.  **Concluding the Interview**: After you have asked ${MAX_QUESTIONS} questions and the user has responded, you MUST conclude the interview.
    6.  **Final Message**: Your final message MUST start with "Okay, that's all the questions I have for today. Great job!". Do not provide detailed feedback, as that is handled by another flow. Just give a brief concluding statement.
    7.  **No "Goodbye"**: Do not say "goodbye" or other pleasantries in the final message. Just give the concluding statement and end.
`;

const generateInterviewResponseFlow = ai.defineFlow(
  {
    name: 'generateInterviewResponseFlow',
    inputSchema: InterviewStateSchema,
    outputSchema: z.string(), // The output is just the AI's text response
  },
  async (state) => {
    const systemPrompt = getSystemPrompt(state);
    
    // Construct the history for the model
    const history = state.history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        content: [{ text: msg.content }]
    }));

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      history: history,
      system: systemPrompt,
      config: {
        temperature: 0.9, // Increased slightly for more natural conversation
      },
    });

    return llmResponse.text;
  }
);


export async function generateInterviewResponse(state: InterviewState): Promise<InterviewResponse> {
  const aiResponseText = await generateInterviewResponseFlow(state);

  const newState: InterviewState = { ...state };
  newState.history.push({ role: 'assistant', content: aiResponseText });

  // The number of questions asked is roughly half the assistant messages, minus the initial pleasantries.
  const assistantMessages = newState.history.filter(m => m.role === 'assistant').length;
  const questionsAsked = Math.max(0, assistantMessages - 1); 
  
  if (questionsAsked >= MAX_QUESTIONS || aiResponseText.startsWith("Okay, that's all the questions I have")) {
      newState.isComplete = true;
  }

  return {
    response: aiResponseText,
    newState: newState,
  };
}

