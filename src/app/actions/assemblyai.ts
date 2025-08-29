
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
    throw new Error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server. Please add it to your .env file and restart the server.');
  }

  const client = new AssemblyAI({ apiKey });

  try {
    // Correctly generate the token using the 'streaming' namespace as per official docs.
    const token = await client.streaming.createTemporaryToken({ expires_in: 3600 }); // expires_in is correct, not expires_in_seconds for the SDK
    return token;
  } catch (error: any) {
    console.error('Error generating AssemblyAI token:', error);
    // Provide a more specific error message to the client.
    throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${error.message}`);
  }
}
