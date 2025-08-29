
'use server';

/**
 * This server action securely generates a temporary token for the AssemblyAI real-time transcription service.
 * It uses a direct fetch call to the AssemblyAI token endpoint to ensure reliability.
 */
export async function getAssemblyAiToken(): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server.');
    throw new Error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server. Please add it to your .env file and restart the server.');
  }

  try {
    const url = new URL("https://api.assemblyai.com/v2/realtime/token");
    url.search = new URLSearchParams({
      expires_in: '3600', // Expires in 1 hour
    }).toString();

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('AssemblyAI token generation failed:', errorData);
        throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.token) {
        console.error('AssemblyAI token response did not contain a token:', data);
        throw new Error('Authentication Failed: Invalid token response from service.');
    }
    
    return data.token;

  } catch (error: any) {
    console.error('Error generating AssemblyAI token:', error.message);
    throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${error.message}`);
  }
}
