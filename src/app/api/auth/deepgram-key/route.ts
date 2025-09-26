
import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function POST() {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  const deepgramProjectId = process.env.DEEPGRAM_PROJECT_ID;

  if (!deepgramApiKey || !deepgramProjectId) {
    return NextResponse.json(
      { error: "Deepgram API key or Project ID not configured on the server." },
      { status: 500 }
    );
  }

  const deepgram = createClient(deepgramApiKey);

  try {
    const { key, error } = await deepgram.keys.create(
      deepgramProjectId,
      "Temporary key for interview",
      ["member"], // Scopes
      { timeToLiveInSeconds: 120 } // Options
    );

    if (error) {
      console.error("Deepgram key creation error:", error);
      throw new Error(error.message);
    }
    
    return NextResponse.json({ key });

  } catch (e: any) {
    console.error("An exception occurred while creating the Deepgram key:", e);
    return NextResponse.json(
      { error: "An exception occurred while creating the Deepgram key." },
      { status: 500 }
    );
  }
}
