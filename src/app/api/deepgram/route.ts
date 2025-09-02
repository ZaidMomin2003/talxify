
import { DeepgramClient, createClient } from "@deepgram/sdk";
import { type NextRequest } from "next/server";

export const runtime = 'edge';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY environment variable not set");
}

// This function handles the WebSocket connection.
// It's a bit complex because it's creating a two-way stream.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listenOptions = JSON.parse(searchParams.get('options') || '{}');

  // Create a TransformStream to manage the data flow
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Initialize Deepgram client
  const deepgram = createClient(DEEPGRAM_API_KEY);
  const dgConnection = deepgram.listen.live({
    ...listenOptions,
    // Add any default options here
    model: "nova-2",
    smart_format: true,
    interim_results: false,
    endpointing: 300,
    utterance_end_ms: 1000,
    language: 'en-US',
    agent: {
        listen: { model: "nova-2" },
        speak: { model: "aura-asteria-en" },
        llm: { model: 'llama-3-8b-8192' },
        system: `You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview. The candidate is interviewing for a general software engineering role. Your first task is to greet the user warmly and ask them to tell you a bit about themselves. Then, ask 2-3 interview questions one by one. After the user answers a question, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then proceed to the next question. Keep your responses concise.`
    },
  });

  // Handle incoming audio from the client and send it to Deepgram
  const forwardAudioToDeepgram = async () => {
    try {
      const reader = request.body?.getReader();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        dgConnection.send(value);
      }
    } catch (e) {
      console.error("Error forwarding audio to Deepgram:", e);
    }
  };
  forwardAudioToDeepgram();


  // Handle messages from Deepgram and send them to the client
  dgConnection.on("open", () => {
    writer.write(encoder.encode('data: {"type":"open"}\n\n'));
  });

  dgConnection.on("close", () => {
    writer.write(encoder.encode('data: {"type":"close"}\n\n'));
  });

  dgConnection.on("error", (e) => {
    console.error("Deepgram error:", e);
    writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: e.message })}\n\n`));
  });

  dgConnection.on("transcript", (data) => {
      if (data.channel?.alternatives[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
                writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'transcript', speaker: 'user', text: transcript })}\n\n`));
            }
        }
  });

  dgConnection.on("llm", (data) => {
      if (!data.from_user && data.content) {
          writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'transcript', speaker: 'ai', text: data.content })}\n\n`));
      }
  });

  dgConnection.on("listening", (data) => {
     writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'listening', value: data.value })}\n\n`));
  });
  
  dgConnection.on("speaking", (data) => {
     writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'speaking', value: data.value })}\n\n`));
  });

  dgConnection.on("audio", (audioData) => {
      // Forward raw audio data to the client
      const header = encoder.encode(`data: `);
      const trailer = encoder.encode(`\n\n`);
      const message = new Uint8Array(header.length + audioData.length + trailer.length);
      message.set(header);
      message.set(audioData, header.length);
      message.set(trailer, header.length + audioData.length);
      writer.write(message);
  });
  

  // Return a streaming response
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
