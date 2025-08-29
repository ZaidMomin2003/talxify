
'use server';

import { AssemblyAI } from 'assemblyai';

/**
 * This server action securely generates a temporary token for the AssemblyAI real-time transcription service.
 * It uses the official AssemblyAI Node.js SDK.
 */
export async function getAssemblyAiToken(): Promise<string | null> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server.');
    throw new Error('Server configuration error: AssemblyAI API key is missing.');
  }

  try {
    const client = new AssemblyAI({ apiKey });
    // This now correctly uses 'expires_in' as per the SDK's expectation for the V3 API.
    // The previous error was due to a mismatch between the raw API param (`expires_in_seconds`)
    // and the SDK's parameter name.
    const token = await client.streaming.createTemporaryToken({ expires_in: 3600 });
    
    if (!token) {
        throw new Error("SDK returned a null or undefined token.");
    }
    
    return token;
    
  } catch (error: any) {
    console.error('Error generating AssemblyAI temporary token:', error);
    // Re-throw a more user-friendly error to be caught by the client
    throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${error.message}`);
  }
}
