
'use server';

/**
 * @fileOverview A flow to transcribe audio to text using Google Speech-to-Text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SpeechClient } from '@google-cloud/speech';

// This is not an `ai.defineTool` because it's a direct service call, not an LLM-callable tool.
const speechToTextWithGoogleFlow = ai.defineFlow(
  {
    name: 'speechToTextWithGoogleFlow',
    inputSchema: z.object({
      audioDataUri: z.string().describe("An audio snippet as a data URI that must include a MIME type and use Base64 encoding."),
    }),
    outputSchema: z.object({
      transcript: z.string().describe('The transcribed text from the audio.'),
    }),
  },
  async (input) => {
    const speechClient = new SpeechClient();
    
    const base64Audio = input.audioDataUri.split(',')[1];
    const audioBytes = Buffer.from(base64Audio, 'base64');

    const audio = {
      content: audioBytes,
    };
    const config = {
      encoding: 'WEBM_OPUS' as const, // The browser media recorder usually outputs in webm/opus
      sampleRateHertz: 48000, // Common sample rate for webm
      languageCode: 'en-US',
    };
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0].transcript)
      .join('\n') || '';

    return {
      transcript: transcription,
    };
  }
);

// Exported wrapper function
export async function speechToTextWithGoogle(input: z.infer<typeof speechToTextWithGoogleFlow.inputSchema>): Promise<z.infer<typeof speechToTextWithGoogleFlow.outputSchema>> {
  return speechToTextWithGoogleFlow(input);
}
