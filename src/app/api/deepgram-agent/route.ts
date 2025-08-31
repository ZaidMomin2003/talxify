
import { NextRequest, NextResponse } from 'next/server';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import type { InterviewState } from '@/lib/interview-types';

/**
 * This endpoint is the "brain" for the Deepgram Voice Agent.
 * The client sends the user's transcript here, and this endpoint
 * uses Genkit/Groq to generate a text response, which it sends back.
 * The client is then responsible for converting this text to speech.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.messages.at(-1)?.transcript;
    const currentState: InterviewState = JSON.parse(body.tag);

    // If there's no user message, it's the initial connection.
    if (!userMessage || userMessage.toLowerCase() === 'hello') {
        const greeting = `Hello ${currentState.interviewId}! I'm Alex, your AI interviewer. Let's start with your ${currentState.topic}.`;
        currentState.history.push({ role: 'assistant', content: greeting });
        return NextResponse.json({ text: greeting, tag: JSON.stringify(currentState) });
    }

    // Add the new user message to the history.
    currentState.history.push({ role: 'user', content: userMessage });

    let aiText, newState;

    // Route to the correct interview flow based on the topic.
    if (currentState.topic === 'Icebreaker Introduction') {
      // For the icebreaker, we need a user ID, which we get from the interviewId.
      const { response, newState: updatedState } = await conductIcebreakerInterview(currentState.interviewId, currentState);
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
      tag: JSON.stringify(newState),
    };
    
    return NextResponse.json(responseJson);

  } catch (error) {
    console.error('Error in Deepgram agent endpoint:', error);
    // Send a generic error message back to the client.
    return NextResponse.json({ text: "I'm sorry, I encountered an error. Let's try that again." }, { status: 500 });
  }
}
