
'use server';

/**
 * @fileOverview A server action to generate a temporary token for AssemblyAI.
 * This is the recommended way to authenticate with the AssemblyAI SDK on the client-side.
 */
import { AssemblyAI } from 'assemblyai';

export async function getAssemblyAiToken() {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error('AssemblyAI API key is not configured in environment variables.');
  }

  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  });

  const token = await client.realtime.createTemporaryToken({ expires_in: 3600 }); // Token valid for 1 hour
  return token;
}

    