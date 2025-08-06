
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/analyze-interview-response.ts';
import '@/ai/flows/summarize-user-feedback.ts';
import '@/ai/flows/generate-code-explanation.ts';
import '@/ai/flows/generate-code-snippet.ts';
import '@/ai/flows/generate-coding-questions.ts';
import '@/ai/flows/analyze-coding-answers.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/speech-to-text.ts';
