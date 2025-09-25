
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const DG_API_KEY = process.env.DEEPGRAM_API_KEY;

    if (!DG_API_KEY) {
        return NextResponse.json({ error: "Deepgram API Key not configured on server" }, { status: 500 });
    }

    const url = new URL("https://api.deepgram.com/v1/listen?model=nova-2-general&smart_format=true&encoding=webm&talk=true");
    
    // Create a new Headers object and copy headers from the incoming request
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Token ${DG_API_KEY}`);
    headers.set("X-Deepgram-Options", JSON.stringify({
        "callback": "http://localhost:3000/api/deepgram/callback",
        "callback_method": "POST"
    }));

    try {
        const response = await fetch(url.toString(), {
            method: 'GET', // Method must be GET for upgrade requests
            headers,
            // @ts-ignore
            duplex: "half" 
        });

        return response;

    } catch (error) {
        console.error("Error proxying to Deepgram:", error);
        return NextResponse.json({ error: "Failed to connect to Deepgram" }, { status: 500 });
    }
}
