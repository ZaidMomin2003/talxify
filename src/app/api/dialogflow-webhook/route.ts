
import {NextRequest, NextResponse} from 'next/server';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import type { InterviewState } from '@/lib/interview-types';

/**
 * This is the webhook that Dialogflow CX will call.
 * It receives the current state of the conversation from Dialogflow,
 * uses our custom Genkit AI flow to generate the next response,
 * and sends that response back to Dialogflow to be spoken to the user.
 */
export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();

    // The user's transcribed text is in the `text` field of the request.
    const userQuery: string = requestBody.text || '';
    const userId: string = requestBody.sessionInfo?.parameters?.userId || '';
    
    // The 'sessionInfo.parameters' object from Dialogflow contains our interview state.
    const sessionParams = requestBody.sessionInfo?.parameters || {};

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

    if (currentState.topic === 'Icebreaker Introduction') {
        const { response, newState: updatedState } = await conductIcebreakerInterview(userId, currentState);
        aiText = response;
        newState = updatedState;
    } else {
        const { response, newState: updatedState } = await generateInterviewResponse(currentState);
        aiText = response;
        newState = updatedState;
    }

    // Format the response in the way Dialogflow expects.
    const responseJson = {
      fulfillment_response: {
        messages: [
          {
            text: {
              text: [aiText],
              allow_playback_interruption: true, // Allow user to interrupt
            },
          },
        ],
      },
      session_info: {
        parameters: {
          ...newState, // Pass the entire new state back to Dialogflow
        },
      },
    };

    return NextResponse.json(responseJson);

  } catch (error) {
    console.error('Error in Dialogflow webhook:', error);
    const errorResponse = {
      fulfillment_response: {
        messages: [
          {
            text: {
              text: ["I'm sorry, I encountered a technical issue. Could you please repeat that?"],
            },
          },
        ],
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
