
import {NextRequest, NextResponse} from 'next/server';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import type { InterviewState } from '@/lib/interview-types';

/**
 * This is the webhook that Dialogflow CX will call for text-only interactions.
 * It receives the current state of the conversation from a custom-built client,
 * uses our custom Genkit AI flow to generate the next response,
 * and sends that response back to the client.
 * The 'tag' is no longer required as we are not using the df-messenger component.
 */
export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();

    // The user's text is in the `text` field of the request.
    const userQuery: string = requestBody.text || '';
    const userId: string = requestBody.sessionInfo?.userId || '';
    
    // The 'sessionInfo' object from our custom client contains our interview state.
    const sessionParams = requestBody.sessionInfo || {};

    const currentState: InterviewState = {
        interviewId: sessionParams.interviewId || 'default-session',
        topic: sessionParams.topic || 'general',
        level: sessionParams.level || 'entry-level',
        role: sessionParams.role || 'Software Engineer',
        company: sessionParams.company || undefined,
        history: sessionParams.history || [],
        isComplete: sessionParams.isComplete || false,
    };
    
    // Add the latest user message to the history.
    if(userQuery) {
        currentState.history.push({ role: 'user', content: userQuery });
    }

    let aiText, newState;

    // We can reuse the same backend flows
    if (currentState.topic === 'Icebreaker Introduction') {
        const { response, newState: updatedState } = await conductIcebreakerInterview(userId, currentState);
        aiText = response;
        newState = updatedState;
    } else {
        const { response, newState: updatedState } = await generateInterviewResponse(currentState);
        aiText = response;
        newState = updatedState;
    }

    // Format the response for our custom client.
    const responseJson = {
      response: aiText,
      sessionInfo: newState,
    };

    return NextResponse.json(responseJson);

  } catch (error) {
    console.error('Error in custom text webhook:', error);
    const errorResponse = {
      response: "I'm sorry, I encountered a technical issue. Could you please repeat that?",
      sessionInfo: {},
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
