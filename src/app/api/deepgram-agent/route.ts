
import { NextRequest, NextResponse } from 'next/server';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import type { InterviewState } from '@/lib/interview-types';

/**
 * This endpoint is the "brain" for the Deepgram Voice Agent.
 * Deepgram sends events (like user speech) here, and this endpoint
 * uses Genkit/Groq to generate a response, which it sends back to Deepgram.
 */
export async function POST(req: NextRequest) {
  try {
    // Deepgram sends a JSON payload. We extract the text transcript and the session state (tag).
    const body = await req.json();
    const userMessage = body.messages.at(-1)?.transcript;
    
    // The 'tag' from Deepgram holds our stringified session state.
    const currentState: InterviewState = JSON.parse(body.tag);

    if (!userMessage) {
        // If there's no user message, it might be the initial connection.
        // Send a greeting.
        return NextResponse.json({ text: "Hello! I'm Alex, your AI interviewer. Are you ready to begin?" });
    }

    // Add the new user message to the history.
    currentState.history.push({ role: 'user', content: userMessage });

    let aiText, newState;

    // Route to the correct interview flow based on the topic.
    if (currentState.topic === 'Icebreaker Introduction') {
      const { response, newState: updatedState } = await conductIcebreakerInterview(currentState.interviewId, currentState); // Assuming interviewId can be userId for this
      aiText = response;
      newState = updatedState;
    } else {
      const { response, newState: updatedState } = await generateInterviewResponse(currentState);
      aiText = response;
      newState = updatedState;
    }

    // Prepare the response for Deepgram.
    // We send back the text to be spoken and the updated session state in the 'tag'.
    const responseJson = {
      text: aiText,
      tag: JSON.stringify(newState),
      end_of_speech: true, // Tell Deepgram TTS to start speaking immediately
      end_conversation: newState.isComplete, // Tell Deepgram to hang up if the interview is over
    };
    
    return NextResponse.json(responseJson);

  } catch (error) {
    console.error('Error in Deepgram agent endpoint:', error);
    // Send a generic error message back to Deepgram to be spoken to the user.
    return NextResponse.json({ text: "I'm sorry, I encountered an error. Let's try that again." }, { status: 500 });
  }
}
