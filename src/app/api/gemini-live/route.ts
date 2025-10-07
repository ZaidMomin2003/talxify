
import {NextRequest} from 'next/server';
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {toBase64} from 'openai/core';
import wav from 'wav';

export const dynamic = 'force-dynamic';

function toInt16(
  buffer: Buffer,
  start: number,
  end: number,
  isLittleEndian: boolean
) {
  const arr = new Int16Array((end - start) / 2);
  for (let i = start; i < end; i = i + 2) {
    arr[i / 2] = isLittleEndian
      ? buffer[i] + buffer[i + 1] * 256
      : buffer[i] * 256 + buffer[i + 1];
  }
  return arr;
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

function getSystemInstruction(topic: string, role: string, company?: string) {
    if (topic === 'Icebreaker Introduction') {
        return `You are Kathy, a friendly career coach at Talxify. Your goal is a short, 2-minute icebreaker. Start warmly. Ask about their name, city, college, skills, and hobbies. Keep it light and encouraging. After getting this info, you MUST respond with ONLY a JSON object in this format: { "isIcebreaker": true, "name": "User's Name", "city": "User's City", "college": "User's College", "skills": ["skill1"], "hobbies": ["hobby1"] }. Wrap this JSON object in <JSON_DATA> tags. This is your final response.`;
    }

    let instruction = `You are Kathy, an expert technical interviewer at Talxify. You are interviewing a candidate for the role of "${role}" on the topic of "${topic}". Your tone must be professional, encouraging, and clear. Start with a friendly introduction, then ask your first question. Always wait for the user to finish speaking.`;
    if (company) {
        instruction += ` The candidate is interested in ${company}, so you can tailor behavioral questions to their leadership principles if applicable.`;
    }
    return instruction;
}


export async function GET(req: NextRequest) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', {status: 400});
  }

  const {socket, response} = Deno.upgradeWebSocket(req);
  let session: any;

  socket.onopen = async () => {
    console.log('socket opened');
  };
  socket.onmessage = async (e) => {
    try {
      if (typeof e.data === 'string') {
        const msg = JSON.parse(e.data);
        if (msg.type === 'start_session') {
            const systemInstruction = getSystemInstruction(msg.topic, msg.role, msg.company);
            
            session = await ai.getExperimental().startLiveSession({
              model: googleAI.model('gemini-2.5-flash-native-audio-preview-09-2025'),
              config: {
                responseModalities: ['AUDIO', 'TEXT'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {voiceName: 'Orus'},
                  },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: systemInstruction,
              },
            });

            console.log('genkit session started');
            (async () => {
              for await (const chunk of await session.stream()) {
                if (chunk.serverContent) {
                  const modelTurn = chunk.serverContent.modelTurn;
                  if (modelTurn) {
                    const audio = modelTurn.parts[0]?.inlineData?.data;
                    if (audio) {
                      socket.send(
                        JSON.stringify({
                          type: 'ai_audio',
                          data: await toWav(Buffer.from(audio, 'base64')),
                        })
                      );
                    }
                  }
                  if (chunk.serverContent.outputTranscription) {
                    socket.send(
                      JSON.stringify({
                        type: 'ai_transcript',
                        text: chunk.serverContent.outputTranscription.text,
                      })
                    );
                  }
                   if (chunk.serverContent.inputTranscription) {
                    socket.send(
                      JSON.stringify({
                        type: 'user_transcript',
                        text: chunk.serverContent.inputTranscription.text,
                      })
                    );
                  }
                  if (chunk.serverContent.turnComplete) {
                     socket.send(
                       JSON.stringify({
                         type: 'turn_complete',
                         isModelTurn: !!chunk.serverContent.modelTurn,
                       })
                     );
                  }
                }
              }
            })();
            await session.send({});
            return;
        }
      }
      
      const buffer = Buffer.from(e.data);
      const int16Arr = toInt16(buffer, 0, buffer.length, true);
      const b64 = toBase64(new Uint8Array(int16Arr.buffer));
      await session.send({
        media: {data: b64, mimeType: 'audio/pcm;rate=16000'},
      });
    } catch (err: any) {
        console.error('WebSocket message processing error:', err);
        socket.send(JSON.stringify({ type: 'error', error: err.message || 'An internal server error occurred.' }));
    }
  };

  socket.onclose = () => console.log('socket closed');
  socket.onerror = (e) => console.error('socket error', e);

  return response;
}

