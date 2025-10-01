
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || 'Software Engineer';
  const topic = searchParams.get('topic') || 'General';
  const level = searchParams.get('level') || 'Entry-level';
  const company = searchParams.get('company') || '';

  if (!process.env.GEMINI_API_KEY) {
    return new Response('API key not found', { status: 500 });
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // This is a pass-through ReadableStream
  const passthrough = new TransformStream<Uint8Array, Uint8Array>();

  // A controller is used to send data to the Gemini API
  let forwardController: ReadableStreamDefaultController<any>;
  const forwardStream = new ReadableStream({
    start(controller) {
      forwardController = controller;
    },
  });

  // Pipe the request body to the forwardStream controller
  req.body
    ?.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          forwardController.enqueue({ media: { data: chunk } });
          controller.enqueue(chunk);
        },
      })
    )
    .pipeTo(passthrough.writable)
    .catch((e) => console.error('Error piping request body', e));

  const systemInstruction = `You are an expert interviewer.
        
    Your Persona:
    - You are Kathy, an expert technical interviewer at Talxify.
    - Your tone: professional, encouraging, and clear.
    - Your task: Ask the candidate a series of interview questions and determine if they are a good fit for the role.

    Candidate Profile:
    - Role: ${role}
    - Level: ${level}
    - Technologies: ${topic}
    ${company ? `- Target Company: ${company}` : ''}

    Interview Flow:
    - Start with a greeting and introduction.
    - Ask a mix of technical questions related to the specified technologies and level.
    - Ask at least one behavioral question to assess soft skills.
    - Keep the questions clear and to the point.
    - After the candidate answers, provide a brief acknowledgement (e.g., "Okay, thank you," or "I see.") and then ask the next question.
    - After 4-5 questions from the user, conclude the interview gracefully.
    - Start the interview now by introducing yourself and asking the first question.`;

  try {
    const session = await client.live.connect({
      model: 'gemini-2.5-flash-preview-native-audio-dialog',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
        },
      },
      systemInstruction: systemInstruction,
      realtimeInput: forwardStream,
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            forwardController.enqueue({
              media: {
                data: message.serverContent.modelTurn.parts[0].inlineData.data,
              },
            });
          }
        },
        onclose: () => {
          forwardController.close();
        },
        onerror: (e) => {
          console.error('Gemini Live Error:', e);
          forwardController.error(e);
        },
      },
    });

    return new Response(passthrough.readable, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error) {
    console.error('Failed to connect to Gemini Live', error);
    return new Response('Failed to connect to Gemini Live', { status: 500 });
  }
}
