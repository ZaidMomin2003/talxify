
'use server';
/**
 * @fileOverview A flow to conduct a real-time, voice-based mock interview.
 *
 * - interviewFlow - The main function to stream the interview.
 * - InterviewFlowInputSchema - The input type for the interview flow.
 * - InterviewFlowStateSchema - The streaming state for the interview.
 * - InterviewFlowOutputSchema - The final output of the interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { InterviewFlowInputSchema, InterviewFlowStateSchema, InterviewFlowOutputSchema, TranscriptEntrySchema } from '@/lib/types';

export const interviewFlow = ai.defineFlow(
  {
    name: 'interviewFlow',
    inputSchema: InterviewFlowInputSchema,
    outputSchema: InterviewFlowOutputSchema,
    streamSchema: InterviewFlowStateSchema,
  },
  async (input, streamingCallback) => {
    const persona = input.company ? `a hiring manager at ${input.company}` : 'an expert technical interviewer at Talxify';

    const systemInstruction = `You are Mark, ${persona}. You are friendly, engaging, and your responses should feel natural. You can use conversational filler like 'um' or 'ah', and expressions like laughing or gasping where appropriate to sound more human.

Your task is to conduct a 6-question interview with a candidate for the role of "${input.role}" focusing on the topic of "${input.topic}".

The interview structure MUST be as follows:
1. Start with a friendly introduction.
2. Ask 2 basic, foundational questions about the topic.
3. Ask 2 scenario-based questions where the user has to apply their knowledge. If a company was specified, tailor these scenarios to that company's likely business or products.
4. Ask 2 difficult, in-depth questions to test their expertise. For behavioral questions, evaluate them based on the company's principles (e.g., STAR method for Amazon).
5. After the 6th question is answered, provide a brief, encouraging, voice-based summary of their performance. Mention one thing they did well and one area to focus on for improvement. Keep this summary concise, under 45 seconds.
6. After giving the summary, end the conversation politely by saying something like "That's all the time we have for today. It was great speaking with you. You'll receive a detailed analysis on the results page shortly. Goodbye!"

Always wait for the user to finish speaking before you start. Your speech should be clear and concise.`;
    
    // Start the conversation flow
    const flow = await ai.experimental.conversation({
        model: 'google/gemini-2.5-flash-native-audio-preview-09-2025',
        system: systemInstruction,
        speechConfig: {
            outputFormat: 'mp3',
            voice: 'Orus',
        },
        history: input.history,
    });

    const finalTranscript: z.infer<typeof TranscriptEntrySchema>[] = input.history || [];
    let currentAiText = '';
    let currentUserText = '';

    await streamingCallback({ status: "Waiting for Mark to start..." });

    // Handle the streaming response from the conversation
    for await (const chunk of flow.stream()) {
        const {
            user,
            model,
            type,
            turn,
            ...rest
        } = chunk;
        if (type === 'chunk' && model) {
            if (model.text) {
                currentAiText += model.text;
                await streamingCallback({ aiText: model.text });
            }
            if (model.media?.url) {
                await streamingCallback({ aiAudio: model.media.url });
            }
        }
         if (type === 'chunk' && user?.text) {
            currentUserText += user.text;
            await streamingCallback({ userText: user.text });
        }
        if (type === 'turn-ended') {
            if (currentAiText) {
                finalTranscript.push({ speaker: 'ai', text: currentAiText });
            }
            if (currentUserText) {
                finalTranscript.push({ speaker: 'user', text: currentUserText });
            }
            currentAiText = '';
            currentUserText = '';
            await streamingCallback({
                userText: '',
                aiText: '',
                status: "🔴 Your turn... Speak now."
            });
        }
        if (type === 'session-ended') {
            await streamingCallback({ status: "Interview finished." });
            break;
        }
    }
    
    return { transcript: finalTranscript };
  }
);
