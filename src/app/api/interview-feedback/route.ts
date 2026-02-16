import { NextResponse } from 'next/server';
import { generateInterviewFeedback } from '@/ai/flows/generate-interview-feedback';
import type { GenerateInterviewFeedbackInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    let body: GenerateInterviewFeedbackInput;

    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    // Comprehensive validation
    if (!body.transcript || !Array.isArray(body.transcript) || body.transcript.length === 0) {
      return NextResponse.json({ error: 'Missing or empty transcript.' }, { status: 400 });
    }

    if (!body.topic || !body.role) {
      return NextResponse.json({ error: 'Missing required specialized fields: topic or role.' }, { status: 400 });
    }

    console.log(`[API/INTERVIEW-FEEDBACK] Processing feedback for ${body.role} - ${body.topic}`);

    const feedback = await generateInterviewFeedback(body);

    if (!feedback) {
      return NextResponse.json({ error: 'AI failed to generate feedback content.' }, { status: 500 });
    }

    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error('[API/INTERVIEW-FEEDBACK] Critical Failure:', error);
    return NextResponse.json({
      error: 'An internal server error occurred during feedback generation.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
