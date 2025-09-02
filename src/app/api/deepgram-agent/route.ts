
import { type NextRequest } from 'next/server';
import { createClient, LiveTranscriptionEvents, DeepgramClient } from '@deepgram/sdk';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { z } from 'zod';

const querySchema = z.object({
  topic: z.string().default('General Software Engineering'),
  role: z.string().default('Software Engineer'),
  level: z.string().default('Entry-level'),
  company: z.string().optional(),
  userName: z.string().default('there'),
});

class InterviewManager {
  private questions: string[] = [];
  private currentQuestionIndex = -1;
  private deepgram: DeepgramClient;
  private connection: any; // Deepgram agent connection
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private encoder = new TextEncoder();
  private isFinished = false;

  constructor(writer: WritableStreamDefaultWriter<Uint8Array>) {
    this.writer = writer;
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY is not set');
    }
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  }

  private async write(data: object) {
    try {
      if(this.isFinished) return;
      await this.writer.write(this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (e) {
      console.error("Write error:", e);
      this.finish();
    }
  }

  private setupListeners() {
    this.connection.on(LiveTranscriptionEvents.Open, () => this.write({ type: 'status', status: 'connected' }));
    
    this.connection.on('llm', (data: any) => {
      const text = data.content;
      if (!text) return;
      this.write({ type: data.from_user ? 'user_transcript' : 'ai_transcript', text });
    });

    this.connection.on('audio', async (audio: Uint8Array) => {
      const base64Audio = Buffer.from(audio).toString('base64');
      await this.write({ type: 'audio', data: base64Audio });
    });
    
    this.connection.on(LiveTranscriptionEvents.Close, () => this.finish());
    this.connection.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error('Deepgram error:', err);
      this.write({ type: 'status', status: 'error' });
      this.finish();
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      const text = data.channel.alternatives[0].transcript;
      if (text && data.is_final) {
        setTimeout(() => this.askNextQuestion(), 500); // Give a brief pause
      }
    });
  }

  public async start(params: z.infer<typeof querySchema>) {
    this.connection = this.deepgram.listen.live({
      model: 'nova-2-speech',
      smart_format: true,
      interim_results: false,
      utterance_end_ms: 1500,
      endpointing: 500,
      language: 'en-US',
      agent: {
        listen: { model: "nova-2-speech" },
        speak: { model: "aura-asteria-en" },
        llm: { model: 'llama-3-8b-8192' },
        system: `You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview for a ${params.level} ${params.role} on ${params.topic}. Greet the user by name (${params.userName}). Ask one question at a time. After they answer, provide a brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then I will inject the next question for you to ask. Do not invent your own questions. Wait for the injection.`
      },
    });

    this.setupListeners();

    try {
      await this.write({ type: 'status', status: 'generating_questions' });
      const questionResult = await generateInterviewQuestions({
        role: params.role,
        level: params.level,
        technologies: params.topic,
      });
      this.questions = questionResult.questions.slice(0, 4);

      if (this.questions.length === 0) throw new Error('Failed to generate questions.');
      
      await this.write({ type: 'status', status: 'questions_ready' });
      
      const greeting = `Hi ${params.userName}. Welcome to your mock interview on ${params.topic}. Let's start with your first question.`;
      this.connection.speak({ text: greeting });
      
      setTimeout(() => this.askNextQuestion(), 4000);

    } catch (error) {
      console.error('Error starting interview:', error);
      await this.write({ type: 'status', status: 'error' });
      this.finish();
    }
  }

  public askNextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      const question = this.questions[this.currentQuestionIndex];
      this.write({ type: 'question', text: question, index: this.currentQuestionIndex + 1, total: this.questions.length });
      this.connection.speak({ text: question });
    } else {
      this.concludeInterview();
    }
  }

  private concludeInterview() {
    const closingMessage = "That's all the questions I have. Thank you for your time. This session will now end.";
    this.connection.speak({ text: closingMessage });
    
    setTimeout(() => this.finish(), 5000);
  }
  
  public handleUserAudio(data: any) {
    if (this.connection && this.connection.getReadyState() === 1) {
      this.connection.send(data);
    }
  }
  
  public async finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    
    if (this.connection && this.connection.getReadyState() === 1) {
      this.connection.finish();
    }
    
    if (this.writer && !this.writer.closed) {
        await this.write({ type: 'finished' });
        await this.writer.close().catch(() => {});
    }
  }
}

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  if (!process.env.DEEPGRAM_API_KEY) {
    return new Response('DEEPGRAM_API_KEY is not set', { status: 500 });
  }

  const queryParseResult = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!queryParseResult.success) {
    return new Response(JSON.stringify({ error: 'Invalid query parameters' }), { status: 400 });
  }

  if (!req.body) {
    return new Response('Request body is missing', { status: 400 });
  }

  const readable = new ReadableStream({
    async start(controller) {
      const writer = controller.getWriter();
      const interviewManager = new InterviewManager(writer);
      
      req.body!.getReader().read().then(async function process({ done, value }) {
        if (done) {
          controller.close();
          return;
        }
        interviewManager.handleUserAudio(value);
        const next = await req.body!.getReader().read();
        process(next);
      }).catch(err => {
         console.error("Error reading from request body:", err);
         interviewManager.finish();
      });

      await interviewManager.start(queryParseResult.data);
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    },
  });
}
