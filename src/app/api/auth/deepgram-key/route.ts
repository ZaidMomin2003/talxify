
import { NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

export async function POST() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  const deepgramProjectId = process.env.DEEPGRAM_PROJECT_ID;

  if (!deepgramApiKey || !deepgramProjectId) {
    console.error("Deepgram API key or Project ID not configured.");
    return NextResponse.json({ error: 'Deepgram API key or Project ID not configured on the server.' }, { status: 500 });
  }
  
  const deepgram = createClient(deepgramApiKey);

  try {
    const { key, error } = await deepgram.keys.create(
      deepgramProjectId,
      'Temporary key for Talxify interview user',
      ['member'],
      { timeToLive: 60 * 2 } // 2 minutes
    );

    if (error) {
      console.error("Deepgram key creation error:", error);
      return NextResponse.json({ error: 'Could not create temporary Deepgram key.' }, { status: 500 });
    }

    return NextResponse.json({ key });

  } catch (e) {
    // Log the specific exception from Deepgram for better debugging
    console.error("Exception creating Deepgram key:", e);
    return NextResponse.json({ error: 'An exception occurred while creating the Deepgram key.' }, { status: 500 });
  }
}
