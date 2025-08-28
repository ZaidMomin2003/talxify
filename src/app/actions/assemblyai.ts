
'use server';

import { AssemblyAI } from 'assemblyai';

/**
 * This server action securely generates a temporary token for the AssemblyAI real-time transcription service.
 * It uses the official AssemblyAI SDK and ensures the API key is never exposed to the client.
 */
export async function getAssemblyAiToken(): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set.');
    throw new Error('AssemblyAI API key is not configured on the server.');
  }

  const client = new AssemblyAI({ apiKey });

  try {
    // The SDK handles the API call to generate the token.
    const token = await client.realtime.createTemporaryToken({ expires_in: 3600 }); // Token is valid for 1 hour
    return token;
  } catch (error) {
    console.error('Error generating AssemblyAI token:', error);
    // Re-throw the error to be caught by the client-side caller.
    throw new Error('Failed to get a session token from AssemblyAI. Please check server logs.');
  }
}
