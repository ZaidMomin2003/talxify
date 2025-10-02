
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response('API key not found', { status: 500 });
  }
  
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const searchParams = req.nextUrl.searchParams;
  const role = searchParams.get('role') || 'Software Engineer';
  const company = searchParams.get('company') || 'a leading tech firm';

  const systemInstruction = `Your name is Clarie. You are a senior hiring manager at "${company}" with over 10 years of experience in talent acquisition. You have a reputation for being insightful, encouraging, and highly professional. Your goal is to create a positive and supportive interview environment where candidates can showcase their best selves.

    You are interviewing a candidate for the role of "${role}".

    Your tone should be warm, calm, and encouraging throughout the conversation.

    Start the interview by introducing yourself and your role, and then ask your first question.
    Keep your questions relevant to the role and your responses concise. Always wait for the user to finish speaking before you reply.`;


  try {
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const session = await client.live.connect({
        model: 'gemini-1.5-flash-latest',
        systemInstruction: systemInstruction,
        callbacks: {
            onmessage: async (message: LiveServerMessage) => {
                const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
                if (audio) {
                    await writer.write(new Uint8Array(Buffer.from(audio.data, 'base64')));
                }
            },
            onclose: () => {
                writer.close();
            },
            onerror: (e: Error) => {
                console.error('Session Error:', e);
                writer.abort(e.message);
            },
        },
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                 voiceConfig: { prebuiltVoiceConfig: { voiceName: 'gemini-2.5-flash-preview-tts/Zephyr' } },
            },
        },
    });
    
    // This function will run in the background, piping the request body to the session
    (async () => {
        if (!req.body) return;
        const reader = req.body.getReader();
        try {
            await session.sendRealtimeInput(
                (async function* () {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            break;
                        }
                        yield { media: { data: Buffer.from(value).toString('base64'), mimeType: 'audio/pcm;rate=16000' } };
                    }
                })()
            );
        } catch (error) {
            console.error('Request Body Reading Error:', error);
        } finally {
            session.close();
        }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (e: any) {
    console.error('Error connecting to Gemini Live:', e);
    return new Response(e.message || 'Failed to connect to live session', { status: 500 });
  }
}
