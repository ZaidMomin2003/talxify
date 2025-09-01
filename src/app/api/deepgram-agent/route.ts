
import { type NextRequest } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { z } from 'zod';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

// Zod schema for query parameters for validation
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
  private deepgramConnection: any;
  private clientWriter: WritableStreamDefaultWriter;
  private isFinished = false;

  constructor(deepgramConnection: any, clientWriter: WritableStreamDefaultWriter) {
    this.deepgramConnection = deepgramConnection;
    this.clientWriter = clientWriter;
    this.setupListeners();
  }

  private setupListeners() {
    this.deepgramConnection.on('open', () => {
      this.clientWriter.write(JSON.stringify({ type: 'status', status: 'connected' }));
    });
    
    this.deepgramConnection.on('llm', (data: any) => {
        if (data.from_user) {
            this.clientWriter.write(JSON.stringify({ type: 'user_transcript', text: data.content }));
        } else {
            this.clientWriter.write(JSON.stringify({ type: 'ai_transcript', text: data.content }));
        }
    });

    this.deepgramConnection.on('audio', (audio: Uint8Array) => {
      const base64Audio = Buffer.from(audio).toString('base64');
      this.clientWriter.write(JSON.stringify({ type: 'audio', audio: base64Audio }));
    });
    
    this.deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
      this.finish();
    });

    this.deepgramConnection.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error('Deepgram error:', err);
      this.clientWriter.write(JSON.stringify({ type: 'status', status: 'error' }));
      this.finish();
    });
  }

  public async start(topic: string, role: string, level: string, company: string | undefined, userName: string) {
    try {
      this.clientWriter.write(JSON.stringify({ type: 'status', status: 'generating_questions' }));
      const questionResult = await generateInterviewQuestions({
        role,
        level,
        technologies: topic,
      });

      this.questions = questionResult.questions.slice(0, 5); // Limit to 5 questions

      if (this.questions.length === 0) {
        throw new Error('Failed to generate interview questions.');
      }
      this.clientWriter.write(JSON.stringify({ type: 'status', status: 'questions_ready' }));

      // Greet the user and ask the first question
      const greeting = `Hi ${userName}. Welcome to your interview on ${topic}. Let's start with the first question.`;
      this.deepgramConnection.speak({ text: greeting });
      this.askNextQuestion();

    } catch (error) {
      console.error('Error starting interview:', error);
      this.clientWriter.write(JSON.stringify({ type: 'status', status: 'error' }));
      this.finish();
    }
  }

  private askNextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      const question = this.questions[this.currentQuestionIndex];
      this.clientWriter.write(JSON.stringify({ type: 'question', text: question, index: this.currentQuestionIndex + 1, total: this.questions.length }));
      this.deepgramConnection.speak({ text: question });
    } else {
      this.concludeInterview();
    }
  }

  private concludeInterview() {
    const closingMessage = "That's all the questions I have. Thank you for your time. This session will now end.";
    this.deepgramConnection.speak({ text: closingMessage });
    // The 'finish' call will be made after the final audio is sent and played.
    setTimeout(() => this.finish(), 5000); 
  }
  
  public handleUserAudio(data: any) {
    if (this.deepgramConnection.getReadyState() === 1 /* OPEN */) {
      this.deepgramConnection.send(data);
    }
  }
  
  public finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    
    if (this.deepgramConnection.getReadyState() === 1) {
        this.deepgramConnection.finish();
    }
    
    // Check if writer is not already closed
    if (!this.clientWriter.closed) {
        this.clientWriter.write(JSON.stringify({ type: 'finished' }));
        this.clientWriter.close().catch(() => {}); // Ignore errors on close
    }
  }
}


export async function GET(req: NextRequest) {
  const queryParseResult = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!queryParseResult.success) {
    return new Response(JSON.stringify({ error: 'Invalid query parameters' }), { status: 400 });
  }
  const { topic, role, level, company, userName } = queryParseResult.data;
  
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  
  const deepgramConnection = deepgram.listen.live({
    model: 'nova-2',
    smart_format: true,
    interim_results: true,
    utterance_end_ms: 1000,
    endpointing: 250,
    language: 'en-US',
    agent: {
        listen: { model: "nova-2-general" },
        speak: { model: "aura-asteria-en" },
        llm: { model: 'llama-3-8b-8192' },
    },
    system: `You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview. The candidate is interviewing for a ${level} ${role} role. The main technical topic is: ${topic}. After the user answers a question, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then wait for the next question to be injected.`
  });

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  const interviewManager = new InterviewManager(deepgramConnection, writer);
  
  // Start generating questions and kick off the interview
  interviewManager.start(topic, role, level, company, userName);

  // Pipe client audio to Deepgram
  const clientReader = req.body!.getReader();
  const pipeToDeepgram = async () => {
    while (true) {
      try {
        const { done, value } = await clientReader.read();
        if (done) break;
        interviewManager.handleUserAudio(value);
      } catch (error) {
        console.error('Error reading from client stream:', error);
        break;
      }
    }
    interviewManager.finish();
  };
  pipeToDeepgram();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
    },
  });
}
