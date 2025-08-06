'use server';

/**
 * @fileOverview A flow to transcribe audio to text using Deepgram.
 *
 * - speechToText - A function that takes an audio data URI and returns the transcribed text.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient } from '@deepgram/sdk';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z.string().describe("An audio snippet as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  return speechToTextFlow(input);
}

const speechToTextFlow = ai.defineFlow(
  {
    name: 'speechToTextFlow',
    inputSchema: SpeechToTextInputSchema,
    outputSchema: SpeechToTextOutputSchema,
  },
  async (input) => {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key is not set in environment variables.');
    }

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    
    const base64Audio = input.audioDataUri.split(',')[1];
    const buffer = Buffer.from(base64Audio, 'base64');
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: 'nova-2',
        smart_format: true,
      }
    );

    if (error) {
      console.error('Deepgram transcription error:', error);
      throw new Error('Failed to transcribe audio.');
    }

    return {
      transcript: result.results.channels[0].alternatives[0].transcript,
    };
  }
);
