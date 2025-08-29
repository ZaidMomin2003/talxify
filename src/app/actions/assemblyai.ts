
'use server';

/**
 * This server action securely generates a temporary token for the AssemblyAI real-time transcription service.
 */
export async function getAssemblyAiToken(): Promise<string | null> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    console.error('CRITICAL: ASSEMBLYAI_API_KEY environment variable not set on the server.');
    throw new Error('Server configuration error: AssemblyAI API key is missing.');
  }

  try {
    // Correctly append the required query parameter to the URL
    const url = "https://streaming.assemblyai.com/v3/token?expires_in_seconds=3600";
    console.log(`[assemblyai.ts] Attempting to fetch from URL: ${url}`);

    const headers = { 'Authorization': apiKey };
    console.log(`[assemblyai.ts] Using headers: ${JSON.stringify(headers, null, 2)}`);

    const response = await fetch(url, {
      method: 'POST', // The documentation shows POST for the token endpoint
      headers: headers,
    });

    const responseText = await response.text();
    console.log(`[assemblyai.ts] Raw response text: ${responseText}`);
    
    if (!response.ok) {
        // Attempt to parse JSON, but fall back to raw text if it fails
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            errorData = { detail: responseText };
        }
        console.error('[assemblyai.ts] AssemblyAI token error response:', errorData);
        throw new Error(`Failed to fetch token. Status: ${response.status}. Body: ${JSON.stringify(errorData)}`);
    }
    
    const data = JSON.parse(responseText);
    
    if (!data.token) {
        console.error('[assemblyai.ts] Token not found in successful response:', data);
        throw new Error("Token not found in the response from AssemblyAI.");
    }
    
    console.log('[assemblyai.ts] Successfully received token.');
    return data.token;
    
  } catch (error: any) {
    console.error('[assemblyai.ts] Error generating AssemblyAI temporary token:', error);
    // Re-throw a more user-friendly error to be caught by the client
    throw new Error(`Authentication Failed: Could not get an auth token for the transcription service. Original error: ${error.message}`);
  }
}
