
'use server';

/**
 * @fileOverview A server action to generate a temporary token for AssemblyAI's real-time transcription.
 * This keeps the API key secure on the server.
 */

export async function getAssemblyAiToken() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'CRITICAL: ASSEMBLYAI_API_KEY is not set in your .env file. Please add it and ensure the server is restarted.'
    );
  }

  try {
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify({ expires_in: 3600 }), // Token valid for 1 hour
    });
    
    const data = await response.json();

    if (!response.ok) {
        // Log the detailed error from AssemblyAI's response
        console.error('AssemblyAI API Error:', data);
        const errorMessage = data.error || 'Could not communicate with AssemblyAI. This often happens if the API key is invalid.';
        throw new Error(`Could not generate AssemblyAI session token: ${errorMessage}`);
    }

    if (!data.token) {
        console.error('AssemblyAI API Error: Token was not present in the successful response.', data);
        throw new Error('Authentication with AssemblyAI succeeded, but no token was returned.');
    }

    return data.token;
    
  } catch (error) {
    console.error('Error getting AssemblyAI token:', error);
    // Re-throw a generic error to the client to avoid exposing internal details
    throw new Error(`Could not generate AssemblyAI session token. ${(error as Error).message}`);
  }
}
