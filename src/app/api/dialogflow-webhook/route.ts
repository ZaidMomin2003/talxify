
import {NextRequest, NextResponse} from 'next/server';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import type { InterviewState } from '@/lib/interview-types';

/**
 * This is the webhook that Dialogflow CX will call.
 * It receives the current state of the conversation, including the history and any custom parameters
 * we've set (like topic, level, etc.).
 * It uses one of our Genkit AI flows to generate the next response and sends it back to Dialogflow.
 */
export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    
    // The 'tag' is crucial for Dialogflow to correctly process the response.
    // It's sent by Dialogflow and we must return it.
    const tag = requestBody.fulfillmentInfo?.tag;

    // The user's query is in message.text
    const userQuery: string = requestBody.message?.text || '';
    
    // Our custom state is passed in sessionInfo.parameters
    const sessionParams = requestBody.sessionInfo?.parameters || {};
    
    // Reconstruct the full interview state from the session parameters.
    const currentState: InterviewState = {
        interviewId: sessionParams.interviewId || 'default-session',
        topic: sessionParams.topic || 'general',
        level: sessionParams.level || 'entry-level',
        role: sessionParams.role || 'Software Engineer',
        company: sessionParams.company || undefined,
        // History is passed as an array of structs (role, content)
        history: sessionParams.history || [],
        isComplete: sessionParams.isComplete || false,
    };
    const userId: string = sessionParams.userId || '';

    // Add the latest user message to the history for context in the next turn.
    if(userQuery) {
        currentState.history.push({ role: 'user', content: userQuery });
    }

    let aiText, newState;

    // Route to the correct interview flow based on the topic.
    if (currentState.topic === 'Icebreaker Introduction') {
        const { response, newState: updatedState } = await conductIcebreakerInterview(userId, currentState);
        aiText = response;
        newState = updatedState;
    } else {
        const { response, newState: updatedState } = await generateInterviewResponse(currentState);
        aiText = response;
        newState = updatedState;
    }
    
    // If the flow marks the interview as complete, trigger the 'END_SESSION' event.
    // Otherwise, send the AI's response back to the user.
    const responseJson = {
      fulfillment_response: {
        messages: [
          {
            text: {
              text: [aiText],
            },
          },
        ],
        // IMPORTANT: We must include the tag in the response.
        tag: tag,
      },
      // Pass the entire updated state back to Dialogflow to maintain context.
      session_info: {
        parameters: {
          ...newState,
        },
      },
      ...(newState.isComplete && {
        page_info: {
            // This is a custom event defined in the Dialogflow agent.
            // It tells Dialogflow to end the session gracefully.
            form_info: {
                parameter_info: [{
                    "displayName": "end_session_event",
                    "required": false,
                    "state": "VALID",
                    "value": true
                }]
            }
        },
      }),
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
