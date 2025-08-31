
import {NextRequest, NextResponse} from 'next/server';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
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

    // Extract the user's transcribed text from the Dialogflow request.
    // The exact path might need adjustment based on the final Dialogflow agent setup.
    const userQuery: string = requestBody.text || '';
    
    // The 'sessionInfo.parameters' object from Dialogflow will contain our interview state.
    // We will need to define what parameters to pass in the Dialogflow console.
    const sessionParams = requestBody.sessionInfo?.parameters || {};

    // Placeholder for building the interview state. This will be more complex.
    const currentState: InterviewState = {
        interviewId: sessionParams.interviewId || 'default-session',
        topic: sessionParams.topic || 'general',
        level: sessionParams.level || 'entry-level',
        role: sessionParams.role || 'Software Engineer',
        company: sessionParams.company || undefined,
        history: sessionParams.history || [],
        isComplete: sessionParams.isComplete || false,
    };
    
    // Add the latest user message to the history
    currentState.history.push({ role: 'user', content: userQuery });

    // Call our existing Genkit flow to get the AI's intelligent response.
    const { response: aiText, newState } = await generateInterviewResponse(currentState);

    // Format the response in the way Dialogflow expects.
    const responseJson = {
      fulfillment_response: {
        messages: [
          {
            text: {
              text: [aiText],
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
    // Return a generic error message to Dialogflow
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
