
'use server';

/**
 * This server action securely generates a temporary token for the AssemblyAI streaming transcription service.
 */
export async function getAssemblyAiToken(): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server.');
    throw new Error('Server configuration error: AssemblyAI API key is missing.');
  }
  
  console.log('[assemblyai.ts] Attempting to generate token via POST...');

  try {
    const response = await fetch("https://api.assemblyai.com/v2/realtime/token", {
      method: 'POST',
      headers: {
        // The "Authorization" header requires the key to be prefixed with "Bearer ".
        // This was the cause of the 401 Unauthorized error.
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expires_in: 3600 }) // This token will be valid for 1 hour.
    });

    if (!response.ok) {
        // Log the detailed error from AssemblyAI
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
    // Re-throw with a user-friendly message, but log the original for debugging.
    throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${error.message}`);
  }
}
