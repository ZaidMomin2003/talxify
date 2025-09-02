
import { DeepgramClient, createClient } from "@deepgram/sdk";
import { type NextRequest } from "next/server";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY environment variable not set");
}

let deepgram: DeepgramClient;
let agent: any;

export async function GET(request: NextRequest) {
  if (!request.headers.get("upgrade")) {
    return new Response("Expected Upgrade request", { status: 426 });
  }

  const { response, socket } = Deno.upgradeWebSocket(request);

  if (!deepgram) {
    deepgram = createClient(DEEPGRAM_API_KEY);
  }

  if (!agent) {
    agent = deepgram.listen.live({
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
  }

  socket.onopen = () => {
    agent.on("open", () => {
      console.log("Deepgram agent connection open.");
    });
    
    agent.on("close", () => {
      console.log("Deepgram agent connection closed.");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    });

    agent.on("error", (e: any) => console.error("Deepgram agent error:", e));

    agent.on("transcript", (data: any) => {
        if (data.channel?.alternatives[0]?.transcript) {
            const transcript = data.channel.alternatives[0].transcript;
            if (transcript) {
                socket.send(JSON.stringify({ type: 'transcript', speaker: 'user', text: transcript }));
            }
        }
    });
    
    agent.on("llm", (data: any) => {
        if (!data.from_user && data.content) {
            socket.send(JSON.stringify({ type: 'transcript', speaker: 'ai', text: data.content }));
        }
    });
    
    agent.on("listening", (data: any) => {
       socket.send(JSON.stringify({ type: 'listening', value: data.value }));
    });
    
    agent.on("speaking", (data: any) => {
       socket.send(JSON.stringify({ type: 'speaking', value: data.value }));
    });

    agent.on("audio", (data: Uint8Array) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(data);
        }
    });
  };

  socket.onmessage = (event) => {
    agent.send(event.data);
  };

  socket.onclose = () => {
    agent.finish();
  };

  return response;
}
