
import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

export async function POST() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    return NextResponse.json({ error: 'Deepgram API key not configured on the server.' }, { status: 500 });
  }
  
  const deepgram = createClient(deepgramApiKey);

  try {
    const { key, error } = await deepgram.keys.create(
      'Temporary key for Talxify user', // Comment
      ['member'], // Permissions
      { timeToLive: 2 * 60 } // TTL in seconds (e.g., 2 minutes)
    );

    if (error) {
      console.error("Deepgram key creation error:", error);
      return NextResponse.json({ error: 'Could not create temporary Deepgram key.' }, { status: 500 });
    }

    return NextResponse.json({ key });

  } catch (e) {
    console.error("Deepgram key creation exception:", e);
    return NextResponse.json({ error: 'An exception occurred while creating Deepgram key.' }, { status: 500 });
  }
}
