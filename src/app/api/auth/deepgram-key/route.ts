
import { NextResponse } from 'next/server';
import { createClient, VDN } from '@deepgram/sdk';

export async function POST() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  if (!deepgramApiKey) {
    return NextResponse.json({ error: 'Deepgram API key not configured on the server.' }, { status: 500 });
  }

  try {
    const deepgram = createClient(deepgramApiKey);
    const { key, error } = await deepgram.keys.create(
      "talxify_temp_key", // A comment to identify the key
      ['member'], // Scopes for the key
      { timeToLiveInSeconds: 60 * 5 } // Key is valid for 5 minutes
    );

    if (error) {
      console.error("Deepgram key creation error:", error);
      throw new Error("Could not create temporary key.");
    }
    
    if (!key) {
        throw new Error("Created key is null.");
    }

    return NextResponse.json({ key: key.key });
  } catch (e) {
    console.error("Error creating Deepgram temp key:", e);
    return NextResponse.json({ error: 'Failed to create temporary Deepgram key.' }, { status: 500 });
  }
}
