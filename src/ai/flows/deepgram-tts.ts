
'use server';

/**
 * @fileOverview A flow to convert text to speech using Deepgram Aura.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient } from '@deepgram/sdk';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const textToSpeechWithDeepgramFlow = ai.defineFlow(
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
    const response = await deepgram.speak.request(
        { text: input.text },
        { model: 'aura-asteria-en', encoding: 'mp3' }
    );

    const stream = await response.getStream();
    if (stream) {
        const buffer = await stream.arrayBuffer();
        const base64Audio = Buffer.from(buffer).toString('base64');
        return {
             audioDataUri: `data:audio/mp3;base64,${base64Audio}`,
        }
    } else {
        console.error("Error generating speech: No stream returned");
        throw new Error("Failed to synthesize speech with Deepgram.");
    }
  }
);

// Exported wrapper function
export async function textToSpeechWithDeepgram(input: z.infer<typeof textToSpeechWithDeepgramFlow.inputSchema>): Promise<z.infer<typeof textToSpeechWithDeepgramFlow.outputSchema>> {
    return textToSpeechWithDeepgramFlow(input);
}
