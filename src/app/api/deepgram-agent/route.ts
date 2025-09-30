
'use server';

import { NextResponse, NextRequest } from 'next/server';
import { runInterviewAgent } from '@/ai/flows/interview-agent';
import { Buffer } from 'buffer';

export async function POST(request: NextRequest) {
  const req = await request.json();
  const { history, role, topic, level, company } = req;
  
  if (history === undefined || !role || !topic || !level) {
    return NextResponse.json(
      { error: 'history, role, topic, and level are required' },
      { status: 400 }
    );
  }

  try {
    const { stream } = await runInterviewAgent({
      history,
      role,
      topic,
      level,
      company,
    });

    for await (const chunk of stream) {
        // Since we expect only one response for this agent, we can return the first one.
        return NextResponse.json({
            text: chunk.text,
            audio: chunk.audio.toString('base64'),
        });
    }

    // Should not happen if the agent always returns a value.
    return NextResponse.json({ error: "No response from agent" }, { status: 500 });

  } catch (error) {
    console.error("Error running interview agent:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
