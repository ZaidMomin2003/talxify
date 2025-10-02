
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response('API key not found', { status: 500 });
  }
  
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const searchParams = req.nextUrl.searchParams;
  const topic = searchParams.get('topic') || 'General';
  const role = searchParams.get('role') || 'Software Engineer';
  const level = searchParams.get('level') || 'entry-level';
  const company = searchParams.get('company');

  // A more detailed system instruction for the AI interviewer
  const systemInstruction = `You are "Kathy," an expert technical interviewer from Talxify. Your tone is professional, encouraging, and clear. 
    Your goal is to conduct a realistic mock interview. 
    The candidate is interviewing for a ${level} ${role} role${company ? ` at ${company}`: ''}. The main topic is ${topic}.
    Ask a mix of technical questions related to the topic and at least one behavioral question.
    Keep your questions and responses concise. Wait for the user to finish speaking before you respond, unless they pause for too long.
    Start the interview by introducing yourself and the topic. For example: "Hi, I'm Kathy from Talxify. Today, we'll be discussing ${topic} for your ${role} interview. Are you ready to start?".
    When the interview feels complete (e.g., after 4-5 questions), conclude it by saying "This has been a great session. Thank you for your time. Your feedback report will be available on your dashboard shortly." and then end the conversation.`;


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
                 voiceConfig: { prebuiltVoiceConfig: { voiceName: 'gemini-2.5-flash-preview-tts/Orus' } },
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

