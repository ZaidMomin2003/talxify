
'use server';

/**
 * @fileOverview A flow to orchestrate a mock interview using Dialogflow ES for STT/TTS and Groq for LLM.
 * This flow is designed for a custom chat UI.
 */

import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import type { InterviewState } from '@/lib/interview-types';

import { generateInterviewResponse } from './generate-interview-response';
import { speechToTextWithGoogle } from './dialogflow-stt';
import { textToSpeechWithGoogle } from './dialogflow-tts';


const ConductInterviewESOutputSchema = z.object({
    userTranscript: z.string(),
    aiResponseText: z.string(),
    aiResponseAudioUri: z.string(),
    newState: z.any(), // Using any for simplicity as InterviewStateSchema is complex for Genkit output
});

export async function conductInterviewES(
    currentState: InterviewState,
    userAudioDataUri: string
): Promise<z.infer<typeof ConductInterviewESOutputSchema>> {
    return conductInterviewESFlow({ currentState, userAudioDataUri });
}

const conductInterviewESFlow = ai.defineFlow(
  {
    name: 'conductInterviewESFlow',
    inputSchema: z.object({
        currentState: z.any(),
        userAudioDataUri: z.string(),
    }),
    outputSchema: ConductInterviewESOutputSchema,
  },
  async ({ currentState, userAudioDataUri }) => {
    
    // 1. Transcribe user's audio to text
    const { transcript: userTranscript } = await speechToTextWithGoogle({ audioDataUri: userAudioDataUri });
    
    // Add user's transcribed message to history
    const stateForLlm = { ...currentState };
    stateForLlm.history.push({ role: 'user', content: userTranscript });

    // 2. Get AI's text response from Groq
    const { response: aiResponseText, newState } = await generateInterviewResponse(stateForLlm);

    // 3. Convert AI's text response to audio
    const { audioDataUri: aiResponseAudioUri } = await textToSpeechWithGoogle({ text: aiResponseText });

    return {
        userTranscript,
        aiResponseText,
        aiResponseAudioUri,
        newState,
    };
  }
);
