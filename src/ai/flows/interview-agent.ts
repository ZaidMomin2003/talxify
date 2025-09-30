
'use server';

import { ai } from '@/ai/genkit';
import { stream, z } from 'genkit';
import { MessageSchema } from 'genkit/model';
import wav from 'wav';

export const runInterviewAgent = ai.defineFlow(
  {
    name: 'runInterviewAgent',
    inputSchema: z.object({
      history: z.array(MessageSchema).describe("The history of the conversation so far."),
      role: z.string().describe("The job role the candidate is interviewing for."),
      topic: z.string().describe("The primary technical topic for the interview."),
      level: z.string().describe("The candidate's experience level."),
      company: z.string().optional().describe("The target company for the interview."),
    }),
    outputSchema: z.object({
        text: z.string(),
        audio: z.any(),
    }),
  },
  async (input) => {
    return stream(async function* (stream) {
      let prompt = `You are an expert interviewer.
        
          Your Persona:
          - You are Kathy, an expert technical interviewer at Talxify.
          - Your tone: professional, encouraging, and clear.
          - Your task: Ask the candidate a series of interview questions and determine if they are a good fit for the role.

          Candidate Profile:
          - Role: ${input.role}
          - Level: ${input.level}
          - Technologies: ${input.topic}
          ${input.company ? `- Target Company: ${input.company}`: ''}

          Interview Flow:
          - Start with a greeting and introduction.
          - Ask a mix of technical questions related to the specified technologies and level.
          - Ask at least one behavioral question to assess soft skills.
          - Keep the questions clear and to the point.
          - After the candidate answers, provide a brief acknowledgement (e.g., "Okay, thank you," or "I see.") and then ask the next question.
          - After 4-5 questions from the user, conclude the interview gracefully.`;

      if (input.history.length === 0) {
        prompt += `\n\nStart the interview now by introducing yourself and asking the first question.`
      } else {
        prompt += `\n\nThis is the conversation history. Continue the interview based on this.
          ${input.history.map((m) => `${m.role}: ${m.content[0].text}`).join('\n')}
          model:`
      }
      
      const llmResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: prompt,
        history: input.history,
        config: {
          temperature: 0.5,
        },
      });

      const responseText = llmResponse.text;
      
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: responseText,
      });

      if (!media) {
        throw new Error('TTS response did not include media.');
      }
      
      // Convert raw PCM audio from Gemini to a WAV buffer for broad browser compatibility
      const pcmData = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      const wavBuffer = await toWav(pcmData);

      const response = {
        text: responseText,
        audio: wavBuffer,
      }

      stream.yield(response);
    });
  }
);


// Helper function to convert raw PCM audio data to a WAV file buffer.
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const buffers: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (chunk) => buffers.push(chunk));
    writer.on('end', () => resolve(Buffer.concat(buffers)));

    writer.write(pcmData);
    writer.end();
  });
}
