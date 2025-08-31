
import { NextRequest, NextResponse } from 'next/server';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import type { InterviewState } from '@/lib/interview-types';

/**
 * This endpoint is the "brain" for the voice interview.
 * The client sends the user's transcript and the current state here, 
 * and this endpoint uses a Genkit/Groq flow to generate the next
 * AI response, which it sends back.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentState: InterviewState = body.state;
    const userMessage: string = body.message;

    // Add the new user message to the history.
    currentState.history.push({ role: 'user', content: userMessage });

    let aiText, newState;

    // Route to the correct interview flow based on the topic.
    if (currentState.topic === 'Icebreaker Introduction') {
      const { response, newState: updatedState } = await conductIcebreakerInterview(currentState);
      aiText = response;
      newState = updatedState;
    } else {
      const { response, newState: updatedState } = await generateInterviewResponse(currentState);
      aiText = response;
      newState = updatedState;
    }
    
    // The tag is the updated session state, which the client will hold onto.
    const responseJson = {
      text: aiText,
      newState: newState,
    };
    
    return NextResponse.json(responseJson);

  } catch (error) {
    console.error('Error in voice agent endpoint:', error);
    // Send a generic error message back to the client.
    return NextResponse.json({ text: "I'm sorry, I encountered an error. Let's try that again." }, { status: 500 });
  }
}
