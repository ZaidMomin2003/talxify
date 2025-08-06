
'use server';

/**
 * @fileOverview A flow to convert text to speech using Deepgram.
 *
 * - textToSpeech - A function that takes text and returns an audio data URI.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient } from '@deepgram/sdk';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
  voice: z.string().optional().describe('The voice model to use for the speech synthesis.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI in MP3 format. Format: 'data:audio/mp3;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key is not set in environment variables.');
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const voiceModel = input.voice || 'aura-asteria-en';

    const response = await deepgram.speak.request(
      { text: input.text },
      {
        model: voiceModel,
        encoding: 'mp3',
      }
    );

    const stream = await response.getStream();
    if (!stream) {
      throw new Error('Failed to get audio stream from Deepgram.');
    }
    const buffer = await stream.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');
    
    return {
      audioDataUri: `data:audio/mp3;base64,${base64Audio}`,
    };
  }
);
