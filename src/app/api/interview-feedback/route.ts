import { NextResponse } from 'next/server';
import { generateInterviewFeedback, type GenerateInterviewFeedbackInput } from '@/ai/flows/generate-interview-feedback';

export async function POST(req: Request) {
  try {
    const body = await req.json() as GenerateInterviewFeedbackInput;

    // Basic validation
    if (!body.transcript || !body.topic || !body.role) {
      return NextResponse.json({ error: 'Missing required fields: transcript, topic, or role.' }, { status: 400 });
    }

    const feedback = await generateInterviewFeedback(body);
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('[API/INTERVIEW-FEEDBACK] Error:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
