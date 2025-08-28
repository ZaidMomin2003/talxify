
'use server';

import axios from 'axios';

/**
 * @fileOverview A server action to generate a temporary token for AssemblyAI's real-time transcription.
 * This keeps the API key secure on the server.
 */

export async function getAssemblyAiToken() {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    // This is the most likely cause of the error.
    // The environment variable is not set on the server.
    throw new Error('AssemblyAI API key is not configured in environment variables.');
  }

  try {
    const response = await axios.post(
      'https://api.assemblyai.com/v2/realtime/token',
      { expires_in: 3600 }, // Token valid for 1 hour
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.ASSEMBLYAI_API_KEY,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error('Error getting AssemblyAI token:', error);
    throw new Error('Could not generate AssemblyAI session token.');
  }
}
