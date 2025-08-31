
'use server';

/**
 * @fileOverview A flow to convert text to speech using Google Text-to-Speech.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';


const textToSpeechWithGoogleFlow = ai.defineFlow(
  {
    name: 'textToSpeechWithGoogleFlow',
    inputSchema: z.object({
      text: z.string().describe('The text to be converted to speech.'),
    }),
    outputSchema: z.object({
      audioDataUri: z.string().describe("The generated audio as a data URI in MP3 format. Format: 'data:audio/mp3;base64,<encoded_data>'."),
    }),
  },
  async (input) => {
    const ttsClient = new TextToSpeechClient();

    const request = {
      input: { text: input.text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' as const },
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioContent = response.audioContent;

    if (!audioContent) {
        throw new Error("Failed to synthesize speech.");
    }
    
    const base64Audio = Buffer.from(audioContent as Uint8Array).toString('base64');
    
    return {
      audioDataUri: `data:audio/mp3;base64,${base64Audio}`,
    };
  }
);

// Exported wrapper function
export async function textToSpeechWithGoogle(input: z.infer<typeof textToSpeechWithGoogleFlow.inputSchema>): Promise<z.infer<typeof textToSpeechWithGoogleFlow.outputSchema>> {
    return textToSpeechWithGoogleFlow(input);
}

