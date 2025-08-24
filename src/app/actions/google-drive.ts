
'use server';

/**
 * @fileOverview A server action to securely retrieve Google API credentials.
 * This prevents exposing sensitive keys on the client-side.
 */

export async function getGoogleApiKeys() {
  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google API credentials are not configured in environment variables.');
  }

  return {
    apiKey: process.env.GOOGLE_API_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID,
  };
}
