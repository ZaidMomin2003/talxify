
import { NextResponse } from 'next/server';

export async function POST() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    return NextResponse.json({ error: 'Deepgram API key not configured on the server.' }, { status: 500 });
  }

  // This route returns a temporary key for the client.
  // In a real production app, you might want to create a short-lived, scoped key.
  // For this example, we return the main key, but this is not recommended for production.
  return NextResponse.json({ key: deepgramApiKey });
}
