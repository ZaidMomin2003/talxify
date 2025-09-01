
import { type NextRequest } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';
import { z } from 'zod';
import { Readable, Writable } from 'stream';

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

  private async writeToClient(data: any) {
    try {
      await this.clientWriter.write(new TextEncoder().encode(JSON.stringify(data)));
    } catch (e) {
      console.error("Error writing to client:", e);
      this.finish();
    }
  }

  private setupListeners() {
    this.deepgramConnection.on('open', () => {
      this.writeToClient({ type: 'status', status: 'connected' });
    });
    
    this.deepgramConnection.on('llm', (data: any) => {
        if (data.from_user) {
            if(data.content) this.writeToClient({ type: 'user_transcript', text: data.content });
        } else {
            if(data.content) this.writeToClient({ type: 'ai_transcript', text: data.content });
        }
    });

    this.deepgramConnection.on('audio', async (audio: Uint8Array) => {
      // Audio is PCM, client expects this format.
      // We can send it as a Blob.
      try {
        await this.clientWriter.write(new Blob([audio]));
      } catch (e) {
        console.error("Error writing audio to client:", e);
        this.finish();
      }
    });
    
    this.deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
      this.finish();
    });

    this.deepgramConnection.on(LiveTranscriptionEvents.Error, (err: any) => {
      console.error('Deepgram error:', err);
      this.writeToClient({ type: 'status', status: 'error' });
      this.finish();
    });
  }

  public async start(topic: string, role: string, level: string, company: string | undefined, userName: string) {
    try {
      this.writeToClient({ type: 'status', status: 'generating_questions' });
      const questionResult = await generateInterviewQuestions({
        role,
        level,
        technologies: topic,
      });

      this.questions = questionResult.questions.slice(0, 5); // Limit to 5 questions

      if (this.questions.length === 0) {
        throw new Error('Failed to generate interview questions.');
      }
      this.writeToClient({ type: 'status', status: 'questions_ready' });
      
      const greeting = `Hi ${userName}. Welcome to your mock interview on ${topic}. Let's start with the first question.`;
      
      // Inject greeting and first question
      this.deepgramConnection.speak({ text: greeting });
      // Add a small delay to ensure greeting finishes before asking the question
      setTimeout(() => this.askNextQuestion(), 4000); 


    } catch (error) {
      console.error('Error starting interview:', error);
      this.writeToClient({ type: 'status', status: 'error' });
      this.finish();
    }
  }

  public askNextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      const question = this.questions[this.currentQuestionIndex];
      this.writeToClient({ type: 'question', text: question, index: this.currentQuestionIndex + 1, total: this.questions.length });
      this.deepgramConnection.speak({ text: question });
    } else {
      this.concludeInterview();
    }
  }

  private concludeInterview() {
    const closingMessage = "That's all the questions I have. Thank you for your time. This session will now end.";
    this.deepgramConnection.speak({ text: closingMessage });
    
    // Give time for the message to be spoken and sent
    setTimeout(() => this.finish(), 5000); 
  }
  
  public handleUserAudio(data: any) {
    if (this.deepgramConnection && this.deepgramConnection.getReadyState() === 1 /* OPEN */) {
      this.deepgramConnection.send(data);
    }
  }
  
  public finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    
    if (this.deepgramConnection && this.deepgramConnection.getReadyState() === 1) {
        this.deepgramConnection.finish();
    }
    
    if (!this.clientWriter.closed) {
        this.writeToClient({ type: 'finished' });
        this.clientWriter.close().catch(() => {}); // Ignore errors on close
    }
  }
}

// THIS IS A NEXT.JS EDGE FUNCTION
// IT'S NOT A NODE.JS ENVIRONMENT
export const runtime = 'edge';

// This is the GET handler for the WebSocket upgrade request
export async function GET(req: NextRequest) {
    if (!process.env.DEEPGRAM_API_KEY) {
        return new Response('DEEPGRAM_API_KEY is not set', { status: 500 });
    }

    const queryParseResult = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!queryParseResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid query parameters' }), { status: 400 });
    }
    const { topic, role, level, company, userName } = queryParseResult.data;

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  
    const deepgramConnection = deepgram.listen.live({
      model: 'nova-2',
      smart_format: true,
      interim_results: false, // Turn off interim for cleaner final transcripts
      utterance_end_ms: 1000,
      endpointing: 300,
      language: 'en-US',
      agent: {
          listen: { model: "nova-2" },
          speak: { model: "aura-asteria-en" },
          llm: { model: 'llama-3-8b-8192' },
          // Listen for a specific phrase to advance to the next question
          confirm_mode: {
             type: 'manual_and_auto',
             manual: {
                keywords: ["next question", "continue"],
             },
             auto: {
                 delay: 2, // seconds
             }
          }
      },
      system: `You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview. The candidate is interviewing for a ${level} ${role} role. The main technical topic is: ${topic}. After the user answers a question, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then wait for the next question to be injected.`
    });
    
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    const interviewManager = new InterviewManager(deepgramConnection, writer);

    deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const text = data.channel.alternatives[0].transcript;
        if (text && data.is_final) {
            // This is the trigger to move to the next question
            interviewManager.askNextQuestion();
        }
    });

    // Start generating questions and kick off the interview
    interviewManager.start(topic, role, level, company, userName);
  
    // This is the logic to handle the incoming audio from the client WebSocket
    const clientAudioStream = new Writable({
        write(chunk, encoding, callback) {
            interviewManager.handleUserAudio(chunk);
            callback();
        }
    });
    
    if (req.body) {
        req.body.pipeTo(clientAudioStream);
    } else {
        return new Response("Request body is null", { status: 400 });
    }
  
    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
      },
    });
}
