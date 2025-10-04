
'use server';

/**
 * @fileOverview A server action to securely retrieve the Gemini API key.
 * This prevents exposing the sensitive key on the client-side.
 */

export async function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Gemini API key is not configured in environment variables.');
    return null; // Return null or throw an error, but don't expose the absence of the key in detail
  }

  return apiKey;
}
