
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = 'edge';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY environment variable not set");
}

export async function GET(request: NextRequest) {
  // This is a WebSocket endpoint.
  // We need to upgrade the connection.
  const { searchParams } = new URL(request.url);

  // This is a hack to get the upgrade to work in Next.js Edge Runtime
  // @ts-ignore
  const { response, socket } = Deno.upgradeWebSocket(request);

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  
  const dgConnection = deepgram.listen.live({
    model: "nova-2",
    smart_format: true,
    interim_results: false,
    utterance_end_ms: 1000,
    endpointing: 300,
    language: 'en-US',
    agent: {
        listen: { model: "nova-2" },
        speak: { model: "aura-asteria-en" },
        llm: { model: 'llama-3-8b-8192' },
        system: `You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview for a general software engineering role. Greet the user warmly and ask them to tell you about themselves. Then, ask 2-3 interview questions one by one. After the user answers, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and move to the next question. Keep your responses concise.`
    },
  });

  // Handle incoming messages from the client and forward them to Deepgram
  socket.onmessage = (event: MessageEvent) => {
    if (dgConnection.getReadyState() === 1 /* OPEN */) {
      dgConnection.send(event.data);
    }
  };

  // Handle messages from Deepgram and forward them to the client
  dgConnection.on(LiveTranscriptionEvents.Open, () => {
    socket.send(JSON.stringify({ type: 'status', status: 'listening' }));
  });

  dgConnection.on(LiveTranscriptionEvents.Close, () => {
    socket.close();
  });

  dgConnection.on(LiveTranscriptionEvents.Error, (e) => {
    console.error("Deepgram error:", e);
    socket.send(JSON.stringify({ type: 'error', message: e.message }));
  });

  dgConnection.on("transcript", (data) => {
      if (data.channel?.alternatives[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
                socket.send(JSON.stringify({ type: 'transcript', speaker: 'user', text: transcript }));
            }
        }
  });

  dgConnection.on("llm", (data) => {
      if (!data.from_user && data.content) {
          socket.send(JSON.stringify({ type: 'transcript', speaker: 'ai', text: data.content }));
      }
  });

  dgConnection.on("listening", (data) => {
     socket.send(JSON.stringify({ type: 'status', status: 'listening' }));
  });
  
  dgConnection.on("speaking", (data) => {
     socket.send(JSON.stringify({ type: 'status', status: 'speaking' }));
  });
  
  dgConnection.on("thinking", (data) => {
     socket.send(JSON.stringify({ type: 'status', status: 'thinking' }));
  });

  dgConnection.on("audio", (audioData) => {
      // Forward raw audio data to the client
      if (socket.readyState === 1 /* OPEN */) {
         socket.send(audioData);
      }
  });
  
  socket.onclose = () => {
    dgConnection.finish();
  };

  return response;
}
