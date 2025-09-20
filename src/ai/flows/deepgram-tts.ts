
'use server';

/**
 * @fileOverview A flow to convert text to speech using Deepgram's Text-to-Speech API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient, SpeakSchema } from '@deepgram/sdk';

if (!process.env.DEEPGRAM_API_KEY) {
    console.warn("DEEPGRAM_API_KEY environment variable not set. Deepgram TTS may not work.");
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || '');

export const textToSpeechWithDeepgramFlow = ai.defineFlow(
  {
    name: 'textToSpeechWithDeepgramFlow',
    inputSchema: z.object({
      text: z.string().describe('The text to be converted to speech.'),
    }),
    outputSchema: z.object({
      audioDataUri: z.string().describe("The generated audio as a data URI in MP3 format."),
    }),
  },
  async (input) => {
    const payload: SpeakSchema = {
      text: input.text,
    };
    
    // Note: Deepgram's Node SDK currently returns a Readable stream.
    // For client-side playback, we need the raw data.
    // We make a direct fetch call to get the audio buffer.
    const response = await deepgram.speak.request(
      { url: 'https://api.deepgram.com/v1/speak?model=aura-asteria-en' },
      payload
    );

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    
    return {
      audioDataUri: `data:audio/mp3;base64,${base64Audio}`,
    };
  }
);

export async function textToSpeechWithDeepgram(input: z.infer<typeof textToSpeechWithDeepgramFlow.inputSchema>): Promise<z.infer<typeof textToSpeechWithDeepgramFlow.outputSchema>> {
    return textToSpeechWithDeepgramFlow(input);
}
