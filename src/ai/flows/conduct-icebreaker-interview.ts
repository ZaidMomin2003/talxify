
'use server';

/**
 * @fileOverview A flow to conduct a friendly icebreaker interview, gather basic user info, and update their profile.
 * This flow is designed for a streaming, low-latency setup.
 */

import { z } from 'genkit';
import { Groq } from 'groq-sdk';
import { InterviewStateSchema, InterviewResponseSchema, type InterviewState, type InterviewResponse } from '@/lib/interview-types';
import { updateUserFromIcebreaker } from '@/lib/firebase-service';
import type { IcebreakerData } from '@/lib/types';


if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables.');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MAX_QUESTIONS = 5; // Keep it short and sweet

// Schema for the data we want to extract from the conversation
const ExtractedInfoSchema = z.object({
    isDataFound: z.boolean().describe("Set to true if you could extract any of the requested information. Otherwise, set to false."),
    college: z.string().optional().describe("The user's college or university."),
    city: z.string().optional().describe("The city the user lives in."),
    skills: z.array(z.string()).optional().describe("A list of the user's top technical skills."),
    hobbies: z.array(z.string()).optional().describe("A list of the user's hobbies or interests."),
});


const getSystemPrompt = () => `
    You are Alex, an AI interviewer. Your persona is SUPER cheerful, friendly, and encouraging. Your goal is to conduct a short, 5-minute icebreaker interview to get to know the candidate.

    Conversation Rules:
    1.  Start with a warm, friendly greeting.
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
`;

// A separate prompt just for extracting the structured data at the end.
const getExtractionPrompt = (conversationHistory: string) => `
    Analyze the following conversation and extract the user's college, city, skills, and hobbies.
    If any piece of information is not mentioned, leave it out.

    Conversation:
    ${conversationHistory}
`;


export async function conductIcebreakerInterview(userId: string, state: InterviewState): Promise<InterviewResponse> {
  const systemPrompt = getSystemPrompt();
  
  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192',
    messages: [
      { role: 'system', content: systemPrompt },
      ...state.history,
    ],
    temperature: 0.8, // Slightly more creative for a friendly chat
    max_tokens: 150,
  });

  const aiResponseText = response.choices[0]?.message?.content || "I'm sorry, I seem to be having trouble responding.";

  const newState: InterviewState = { ...state };
  newState.history.push({ role: 'assistant', content: aiResponseText });

  const questionsAsked = Math.floor(newState.history.length / 2);
  
  // Check if it's time to end the interview
  if (questionsAsked >= MAX_QUESTIONS || aiResponseText.startsWith("This has been super fun!")) {
      newState.isComplete = true;

      // After the interview is complete, run the extraction flow.
      const fullConversation = state.history.map(m => `${m.role}: ${m.content}`).join('\n');
      const extractionResponse = await groq.chat.completions.create({
        model: 'llama3-8b-8192', // Use a smaller model for extraction
        messages: [{ role: 'system', content: getExtractionPrompt(fullConversation) }],
        temperature: 0,
        response_format: { type: 'json_object', schema: ExtractedInfoSchema },
      });

      const extractedJson = extractionResponse.choices[0]?.message?.content;
      if (extractedJson) {
        try {
            const extractedData: IcebreakerData = JSON.parse(extractedJson);
            // Save the extracted data to Firebase
            await updateUserFromIcebreaker(userId, extractedData);
        } catch (e) {
            console.error("Failed to parse or save extracted data:", e);
        }
      }
  }

  return {
    response: aiResponseText,
    newState: newState,
  };
}
