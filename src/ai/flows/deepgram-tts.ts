
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SpeakSchema } from '@deepgram/sdk';

if (!process.env.DEEPGRAM_API_KEY) {
    console.warn("DEEPGRAM_API_KEY environment variable not set. Deepgram TTS may not work.");
}

export const textToSpeechWithDeepgramFlow = ai.defineFlow(
  {
    name: 'textToSpeechWithDeepgramFlow',
    inputSchema: z.object({
      text: z.string().describe('The text to be converted to speech.'),
    }),
    outputSchema: z.object({
      audioBuffer: z.any().describe("The audio buffer in MP3 format."),
    }),
  },
  async (input) => {
    const payload: SpeakSchema = {
      text: input.text,
    };
    
    const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Deepgram TTS Error:", errorBody);
        throw new Error(`Deepgram API request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    
    return {
      audioBuffer: buffer,
    };
  }
);
