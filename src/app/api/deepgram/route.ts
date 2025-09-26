
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
} from '@deepgram/sdk';
import { NextResponse, NextRequest } from 'next/server';
import { runInterviewAgent } from '@/ai/flows/interview-agent';

export async function POST(request: NextRequest) {
  const req = await request.json();
  const { role, topic, level } = req;

  if (!role || !topic || !level) {
    return NextResponse.json(
      { error: 'role, topic, and level are required' },
      { status: 400 }
    );
  }

  // Note: This POST handler is not currently used by the "hold-to-speak" client,
  // but is kept for potential future use or alternative connection methods.
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  const { key } = await deepgram.keys.create(
    process.env.DEEPGRAM_PROJECT_ID!,
    'Temporary key',
    ['member'],
    { timeToLiveInSeconds: 10 }
  );

  return NextResponse.json({ key });
}

export async function GET(request: NextRequest) {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  let connection: LiveClient;
  let text = '';

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role') || 'Software Engineer';
  const topic = searchParams.get('topic') || 'General';
  const level = searchParams.get('level') || 'Entry-level';

  const stream = new ReadableStream({
    async start(controller) {
      connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        endpointing: 250,
      });

      connection.on(LiveTranscriptionEvents.Open, async () => {
        console.log('Deepgram connection established');
        const { stream } = await runInterviewAgent({
          text: '',
          role,
          topic,
          level,
        });

        for await (const chunk of stream) {
          controller.enqueue(chunk);
        }
      });

      connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
        text = data.channel.alternatives[0].transcript ?? '';
        if (data.is_final && text.trim()) {
          console.log('User transcript:', text);
          const { stream } = await runInterviewAgent({
            text,
            role,
            topic,
            level,
          });

          for await (const chunk of stream) {
            controller.enqueue(chunk);
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
        controller.close();
      });

      connection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram error:', err);
        controller.error(err);
      });
    },
    async pull(controller) {
      // This is handled by the event listeners
    },
    cancel() {
      console.log('Stream cancelled');
      if (connection) {
        connection.finish();
      }
    },
  });

  // This is the crucial part: return a Response object with the stream
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
}
