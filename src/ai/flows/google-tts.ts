
'use server';

/**
 * @fileOverview A flow to convert text to speech using Google's Text-to-Speech API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// This flow requires Google Cloud authentication.
// Ensure you have `gcloud auth application-default login` run in your environment.
// It also requires the GOOGLE_CLOUD_PROJECT environment variable to be set.

if (!process.env.GOOGLE_CLOUD_PROJECT) {
    console.warn("GOOGLE_CLOUD_PROJECT environment variable not set. Google TTS may not work.");
}

const client = new TextToSpeechClient();

export const textToSpeechWithGoogleFlow = ai.defineFlow(
  {
    name: 'textToSpeechWithGoogleFlow',
    inputSchema: z.object({
      text: z.string().describe('The text to be converted to speech.'),
    }),
    outputSchema: z.object({
      audioDataUri: z.string().describe("The generated audio as a data URI in MP3 format."),
    }),
  },
  async (input) => {
    const request = {
      input: { text: input.text },
      voice: { 
        languageCode: 'en-US', 
        name: 'en-US-Wavenet-D', // A standard, high-quality male voice
        ssmlGender: 'MALE' as const
      },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent as Buffer;
    const base64Audio = audioContent.toString('base64');
    
    return {
      audioDataUri: `data:audio/mp3;base64,${base64Audio}`,
    };
  }
);

export async function textToSpeechWithGoogle(input: z.infer<typeof textToSpeechWithGoogleFlow.inputSchema>): Promise<z.infer<typeof textToSpeechWithGoogleFlow.outputSchema>> {
    return textToSpeechWithGoogleFlow(input);
}
