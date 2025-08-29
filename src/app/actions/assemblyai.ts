
'use server';

/**
 * This server action securely generates a temporary token for the AssemblyAI streaming transcription service.
 * It now uses the correct v3 endpoint and a GET request as per the latest documentation.
 */
export async function getAssemblyAiToken(): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server.');
    throw new Error('Server configuration error: AssemblyAI API key is missing.');
  }
  
  // Manually construct the URL with the required query parameter.
  const url = 'https://streaming.assemblyai.com/v3/token?expires_in_seconds=600';

  console.log(`[assemblyai.ts] Attempting to generate token via GET from: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${apiKey}`, // The v3 token endpoint does not require the "Bearer" prefix.
      },
      cache: 'no-store', // Disable caching to ensure a fresh request every time
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`[assemblyai.ts] AssemblyAI token error (Status: ${response.status}):`, errorData);
        throw new Error(`Failed to fetch token. Status: ${response.status}. Body: ${errorData}`);
    }
    
    const data = await response.json();
    
    if (!data.token) {
        console.error('[assemblyai.ts] Token not found in successful response:', data);
        throw new Error("Token not found in the response from AssemblyAI.");
    }
    
    console.log('[assemblyai.ts] Successfully received temporary token.');
    return data.token;
    
  } catch (error: any) {
    console.error('[assemblyai.ts] Error in getAssemblyAiToken:', error);
    throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${error.message}`);
  }
}
