
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';
import type { InterviewState } from '@/lib/interview-types';

// This endpoint acts as a proxy to the Deepgram Voice Agent.
// The client connects here, and this endpoint establishes the connection to Deepgram.

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

function getSystemPrompt(state: InterviewState): string {
    if (state.topic === 'Icebreaker Introduction') {
        return `
            You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational icebreaker interview.
            Your primary goal is to learn about the user's background. Ask questions to discover the following information, one by one:
            - Their current city.
            - Their college or university.
            - Their main technical skills.
            - Their hobbies.

            Conversation Rules:
            1. Keep your responses concise and friendly (1-2 sentences).
            2. Ask only ONE question at a time.
            3. Be natural. Don't just list questions. Engage with the user's answers briefly before moving to the next topic.
            4. After you have asked about all the topics (city, college, skills, hobbies), you MUST end the conversation.
            5. Your final message MUST begin with the exact phrase: "Okay, that's all the questions I have. It was great chatting with you!".
        `;
    }

    // Default prompt for technical interviews
    return `
      You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview.
      The candidate is interviewing for a ${state.level} ${state.role} role. 
      The main technical topic is: ${state.topic}.
      ${state.company ? `The interview is tailored for ${state.company}. Adapt your style and questions accordingly (e.g., for Amazon, focus on STAR method for behavioral questions).` : ''}

      Conversation Rules:
      1. Start with a brief, friendly greeting and state the topic.
      2. Ask ONE main question at a time. It can be a mix of technical and behavioral questions related to the role and topic.
      3. Keep your responses concise (1-3 sentences).
      4. After the user answers, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then ask the next question. Do not provide feedback during the interview.
      5. After you have asked about 6-7 questions, you MUST conclude the interview.
      6. Your final message MUST begin with the exact phrase: "Okay, that's all the questions I have. Thank you for your time.".
    `;
}

export async function POST(req: NextRequest) {
    const { state }: { state: InterviewState } = await req.json();

    try {
        const systemPrompt = getSystemPrompt(state);

        const connection = deepgram.conversational.speak('nova-2-conversational', {
            model: "llama-3-8b-8192", // The LLM to use for thinking
            system: systemPrompt,
        });

        const stream = new ReadableStream({
            start(controller) {
                connection.on('data', (data) => {
                    controller.enqueue(data);
                });
                connection.on('error', (err) => {
                    console.error('Deepgram connection error:', err);
                    controller.error(err);
                });
                connection.on('close', () => {
                    controller.close();
                });
            },
            cancel() {
                connection.finish();
            },
        });

        // The initial text to kick off the conversation
        const initialGreeting = `Hi, ${user.displayName}. Let's get started.`;
        connection.send(initialGreeting);

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });
    } catch (error) {
        console.error('Error in Deepgram agent route:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to connect to agent' }), { status: 500 });
    }
}
