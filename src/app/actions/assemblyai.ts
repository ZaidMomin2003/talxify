
'use server';

import axios, { isAxiosError } from 'axios';

/**
 * @fileOverview A server action to generate a temporary token for AssemblyAI's real-time transcription.
 * This keeps the API key secure on the server.
 */

export async function getAssemblyAiToken() {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    // This is the most likely cause of the error.
    // The environment variable is not set on the server.
    throw new Error('CRITICAL: ASSEMBLYAI_API_KEY is not set in your .env file. Please add it and restart the server.');
  }

  try {
    const response = await axios.post(
      'https://api.assemblyai.com/v2/realtime/token',
      { expires_in: 3600 }, // Token valid for 1 hour
      {
        headers: {
          'Authorization': process.env.ASSEMBLYAI_API_KEY,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    if (isAxiosError(error)) {
        // Log the detailed error from AssemblyAI's response
        console.error('AssemblyAI API Error:', error.response?.data);
        // Provide a more specific error message to the user
        const assemblyError = error.response?.data?.error || 'Could not communicate with AssemblyAI. This often happens if the API key is invalid.';
        throw new Error(`Could not generate AssemblyAI session token: ${assemblyError}`);
    }
    // Fallback for non-Axios errors
    console.error('Error getting AssemblyAI token:', error);
    throw new Error('Could not generate AssemblyAI session token.');
  }
}
