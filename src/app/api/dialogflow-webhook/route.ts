
import {NextRequest, NextResponse} from 'next/server';
import { generateInterviewResponse } from '@/ai/flows/generate-interview-response';
import { conductIcebreakerInterview } from '@/ai/flows/conduct-icebreaker-interview';
import type { InterviewState } from '@/lib/interview-types';

import { speechToTextWithDeepgram } from '@/ai/flows/deepgram-stt';
import { textToSpeechWithDeepgram } from '@/ai/flows/deepgram-tts';

/**
 * This is the webhook that Dialogflow CX will call.
 * It receives the current state of the conversation, including the history and any custom parameters
 * we've set (like topic, level, etc.).
 * It uses one of our Genkit AI flows to generate the next response and sends it back to Dialogflow.
 */
export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    
    const tag = requestBody.fulfillmentInfo?.tag;
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

    let userQuery = requestBody.message?.text || '';

    // Check if audio input is provided and transcribe it
    if (requestBody.message?.payload?.audio_base64) {
        const audioDataUri = `data:audio/wav;base64,${requestBody.message.payload.audio_base64}`;
        
        // Use the appropriate STT provider based on session param
        if (sessionParams.stt_provider === 'deepgram') {
             const { transcript } = await speechToTextWithDeepgram({ audioDataUri });
             userQuery = transcript;
        } else {
            // Default or Google STT would go here if implemented
            throw new Error("Unsupported STT provider specified.");
        }
    }
    
    if(userQuery) {
        currentState.history.push({ role: 'user', content: userQuery });
    }

    let aiText, newState;

    if (currentState.topic === 'Icebreaker Introduction') {
        const { response, newState: updatedState } = await conductIcebreakerInterview(sessionParams.userId, currentState);
        aiText = response;
        newState = updatedState;
    } else {
        const { response, newState: updatedState } = await generateInterviewResponse(currentState);
        aiText = response;
        newState = updatedState;
    }
    
    let audioResponsePayload = {};

    // Check if TTS is requested and generate audio
    if (sessionParams.tts_provider === 'deepgram') {
        const { audioDataUri } = await textToSpeechWithDeepgram({ text: aiText });
        const base64Audio = audioDataUri.split(',')[1];
        audioResponsePayload = {
            audio_base64: base64Audio,
            text: aiText, // It's good practice to send text fallback
        };
    }
    
    const responseJson = {
      fulfillment_response: {
        messages: [
          {
            text: { text: [aiText] },
          },
          // Conditionally add the audio response payload if it was generated
          ...(Object.keys(audioResponsePayload).length > 0 ? [{ payload: audioResponsePayload }] : []),
        ],
        tag: tag,
      },
      session_info: {
        parameters: { ...newState },
      },
      ...(newState.isComplete && {
        page_info: {
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
