
'use server';

/**
 * @fileOverview A flow to transcribe audio to text using Deepgram.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient, LiveClient } from '@deepgram/sdk';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

const speechToTextWithDeepgramFlow = ai.defineFlow(
  {
    name: 'speechToTextWithDeepgramFlow',
    inputSchema: z.object({
      audioDataUri: z.string().describe("An audio snippet as a data URI."),
    }),
    outputSchema: z.object({
      transcript: z.string().describe('The transcribed text from the audio.'),
    }),
  },
  async (input) => {
    // Extract base64 content from data URI
    const base64Audio = input.audioDataUri.split(',')[1];
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    
    const { result, error } = await deepgramClient.listen.prerecorded.analyze(
        { buffer: audioBuffer },
        { model: 'nova-2', smart_format: true }
    );

    if (error) {
        console.error('Deepgram STT Error:', error);
        throw new Error('Failed to transcribe audio with Deepgram.');
    }

    return {
      transcript: result.results.channels[0].alternatives[0].transcript,
    };
  }
);

// Exported wrapper function
export async function speechToTextWithDeepgram(input: z.infer<typeof speechToTextWithDeepgramFlow.inputSchema>): Promise<z.infer<typeof speechToTextWithDeepgramFlow.outputSchema>> {
  return speechToTextWithDeepgramFlow(input);
}
