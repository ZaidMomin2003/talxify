
'use server';

/**
 * @fileOverview An AI flow for conducting a conversational icebreaker interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Groq from 'groq-sdk';
import { updateUserFromIcebreaker } from '@/lib/firebase-service';
import type { InterviewState, InterviewResponse } from '@/lib/interview-types';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables.');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Define a schema for data extraction
const ExtractedInfoSchema = z.object({
  college: z.string().optional().describe("The user's college or university."),
  city: z.string().optional().describe("The user's current city."),
  skills: z.array(z.string()).optional().describe("A list of the user's technical skills."),
  hobbies: z.array(z.string()).optional().describe("A list of the user's hobbies."),
});


const conductIcebreakerInterviewFlow = ai.defineFlow(
  {
    name: 'conductIcebreakerInterviewFlow',
    inputSchema: InterviewState,
    outputSchema: InterviewResponse,
  },
  async (state) => {
    const systemPrompt = `
      You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational icebreaker interview.
      Your primary goal is to learn about the user's background. Ask questions to discover the following information, one by one:
      - Their current city.
      - Their college or university.
      - Their main technical skills.
      - Their hobbies.

      Conversation Rules:
      1.  Keep your responses concise and friendly (1-2 sentences).
      2.  Ask only ONE question at a time.
      3.  Be natural. Don't just list questions. Engage with the user's answers briefly before moving to the next topic.
      4.  After you have asked about all the topics (city, college, skills, hobbies), you MUST end the conversation.
      5.  Your final message MUST begin with the exact phrase: "Okay, that's all the questions I have. It was great chatting with you!".
    `;
    
    const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...state.history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts[0].text
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama3-8b-8192", // Fast and capable model
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I seem to be having trouble thinking of a response.";

    const updatedHistory = [
      ...state.history,
      { role: 'model' as const, parts: [{ text: aiResponse }] }
    ];

    let isComplete = false;
    if (aiResponse.startsWith("Okay, that's all the questions I have.")) {
        isComplete = true;

        // After the interview is complete, extract the information
        try {
            const extractionPrompt = ai.definePrompt({
                name: 'extractIcebreakerInfo',
                input: { schema: z.object({ conversation: z.string() }) },
                output: { schema: ExtractedInfoSchema },
                prompt: \`Extract the following information from the conversation: college, city, skills, hobbies.
                
                Conversation:
                {{{conversation}}}
                \`,
            });
            const conversationText = state.history.map(h => \`\${h.role}: \${h.parts[0].text}\`).join('\\n');
            const { output } = await extractionPrompt({ conversation: conversationText });

            if (output) {
                // We use the interviewId as the userId here
                await updateUserFromIcebreaker(state.interviewId, output);
            }
        } catch (error) {
            console.error("Failed to extract and save icebreaker info:", error);
            // Don't block the user response if this fails
        }
    }

    return {
      response: aiResponse,
      newState: {
        ...state,
        history: updatedHistory,
        isComplete,
      },
    };
  }
);


export async function conductIcebreakerInterview(
  state: InterviewState
): Promise<InterviewResponse> {
  return conductIcebreakerInterviewFlow(state);
}
