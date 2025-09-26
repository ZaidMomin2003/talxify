
import {
  createClient,
  LiveClient,
  LiveTranscriptionEvents,
} from '@deepgram/sdk';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const role = searchParams.get('role');
  const level = searchParams.get('level');
  const topic = searchParams.get('topic');

  if (!role || !level || !topic) {
    return NextResponse.json(
      { error: 'role, level, and topic are required' },
      { status: 400 }
    );
  }

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  let connection: LiveClient;

  const { stream, status } = await new Promise<{
    stream: ReadableStream;
    status: number;
  }>(async (resolve, reject) => {
    const readable = new ReadableStream({
      start(controller) {
        connection = deepgram.listen.live({
          model: 'nova-2',
          language: 'en-US',
          smart_format: true,
          interim_results: true,
          utterance_end_ms: 1000,
          endpointing: 250,
        });

        connection.on(LiveTranscriptionEvents.Open, () => {
          console.log('connection established');
        });

        connection.on(LiveTranscriptionEvents.Close, () => {
          console.log('connection closed');
          controller.close();
        });

        connection.on(LiveTranscriptionEvents.Error, (e) => {
          console.error(e);
        });

        connection.on(LiveTranscriptionEvents.Transcript, (data) => {
          const text = data.channel.alternatives[0].transcript;
          if (data.is_final && text.trim()) {
            console.log('received', text);
          }
        });
      },
      async pull(controller) {
        // Handle pulling data if necessary, for now we let events drive it
      },
      cancel() {
        console.log('stream cancelled');
        connection.finish();
      },
    });

    resolve({ stream: readable, status: 200 });
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
    status,
  });
}
