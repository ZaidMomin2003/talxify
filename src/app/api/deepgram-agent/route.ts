
import { type NextRequest } from 'next/server';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

// This endpoint is now a WebSocket handler. It establishes a persistent
// connection with both the client and Deepgram to stream audio back and forth.

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables.');
}

function getSystemPrompt(topic: string, role: string, level: string, company?: string): string {
    if (topic === 'Icebreaker Introduction') {
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
            5. Your final message MUST begin with the exact phrase: "Okay, that's all the questions I have. It was great chatting with you!". After saying this, close the connection.
        `;
    }

    // Default prompt for technical interviews
    return `
      You are Alex, an expert, friendly, and professional AI interviewer. Your goal is to conduct a natural, conversational mock interview.
      The candidate is interviewing for a ${level} ${role} role. 
      The main technical topic is: ${topic}.
      ${company ? `The interview is tailored for ${company}. Adapt your style and questions accordingly (e.g., for Amazon, focus on STAR method for behavioral questions).` : ''}

      Conversation Rules:
      1. Start with a brief, friendly greeting and state the topic.
      2. Ask ONE main question at a time. It can be a mix of technical and behavioral questions related to the role and topic.
      3. Keep your responses concise (1-3 sentences).
      4. After the user answers, provide brief, neutral acknowledgement (e.g., "Okay, thank you.", "Got it.") and then ask the next question. Do not provide feedback during the interview.
      5. After you have asked about 4-5 questions, you MUST conclude the interview.
      6. Your final message MUST begin with the exact phrase: "Okay, that's all the questions I have. Thank you for your time.". After saying this, close the connection.
    `;
}

export function GET(req: NextRequest) {
    // This is a WebSocket endpoint, so we need to handle the upgrade request.
    const upgradeHeader = req.headers.get('Upgrade');
    if (upgradeHeader !== 'websocket') {
        return new Response('Expected a WebSocket request', { status: 426 });
    }
    
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || 'general discussion';
    const role = searchParams.get('role') || 'candidate';
    const level = searchParams.get('level') || 'entry-level';
    const company = searchParams.get('company') || undefined;
    const userName = searchParams.get('userName') || 'there';

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    const deepgramConnection = deepgram.listen.live({
        model: 'nova-2',
        smart_format: true,
        interim_results: true,
        // The AI model will speak back to the user
        utterance_end_ms: 1000,
        endpointing: 250,
        // The language of the AI model
        language: 'en-US',
        // The AI model to use for thinking
        llm_model: 'llama-3-8b-8192',
        // The prompt to use for the AI model
        system: getSystemPrompt(topic, role, level, company),
    });
    
    // Create a new TransformStream to read from and write to.
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    deepgramConnection.on(LiveTranscriptionEvents.Open, () => {
        // Kick off the conversation with a greeting
        const greeting = `Hi ${userName}. Let's get started.`;
        deepgramConnection.speak({ text: greeting });
    });

    deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        writer.write(JSON.stringify({
            type: 'transcript',
            is_final: data.is_final,
            text: data.channel.alternatives[0].transcript,
        }));
        
        if (data.is_final && data.speech_final) {
             const finalUserTranscript = data.channel.alternatives[0].transcript;
             // Check if the user wants to end the call
             if (finalUserTranscript.toLowerCase().includes('end call') || finalUserTranscript.toLowerCase().includes('end the call')) {
                writer.write(JSON.stringify({ type: 'finished' }));
                deepgramConnection.finish();
             }
        }
    });
    
    deepgramConnection.on('llm_response', (data) => {
        writer.write(JSON.stringify({
            type: 'ai_transcript',
            text: data.response,
        }));
    });
    
    deepgramConnection.on('utterance', (data) => {
        if(data.utterance) {
             writer.write(JSON.stringify({
                type: 'audio',
                audio: data.utterance,
            }));
        }
    });

    deepgramConnection.on(LiveTranscriptionEvents.Error, (err) => {
        console.error('Deepgram error:', err);
        writer.close();
    });

    deepgramConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed.');
        writer.close();
    });

    // Pipe the request body into the Deepgram connection.
    req.body?.pipeTo(new WritableStream({
        write: (chunk) => {
            deepgramConnection.send(chunk);
        },
        close: () => {
            deepgramConnection.finish();
        }
    }));
    
    // Return the readable side of the stream to the client
    return new Response(stream.readable, {
        headers: {
            'Connection': 'Upgrade',
            'Upgrade': 'websocket',
            'Sec-WebSocket-Accept': req.headers.get('sec-websocket-accept')!,
            'Sec-WebSocket-Protocol': req.headers.get('sec-websocket-protocol')!
        },
        status: 101, // Switching Protocols
    });
}
