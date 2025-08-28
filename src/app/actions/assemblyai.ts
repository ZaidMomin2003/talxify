
'use server';

import { AssemblyAI } from 'assemblyai';

/**
 * @fileOverview A server action to generate a temporary token for AssemblyAI's real-time transcription.
 * This keeps the API key secure on the server.
 */

export async function getAssemblyAiToken(): Promise<string | null> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    // This error will be thrown if the API key is not set in .env file
    // It's critical for diagnosing deployment issues.
    throw new Error(
      'CRITICAL: ASSEMBLYAI_API_KEY is not set in your .env file. Please add it and ensure the server is restarted.'
    );
  }
  
  const client = new AssemblyAI({
    apiKey: apiKey,
  });
  
  try {
    const token = await client.realtime.createTemporaryToken({ expires_in: 3600 });
    return token;
  } catch (error) {
    console.error('Error generating AssemblyAI temporary token:', error);
    // Return null or throw a more generic error to the client
    return null;
  }
}
