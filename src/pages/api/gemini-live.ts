
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer, WebSocket } from 'ws';

// This is a global in-memory store for WebSocket servers.
// In a real-world, scalable application, you would manage this differently.
if (!(global as any).wss) {
  console.log('Creating new WebSocket server.');
  (global as any).wss = new WebSocketServer({ noServer: true });

  (global as any).wss.on('connection', async (ws: WebSocket) => {
    let session: any = null;

    ws.on('message', async (message: string) => {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'config') {
        const { systemInstruction } = parsedMessage.config;
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
              responseModalities: [Modality.AUDIO, Modality.TEXT],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              systemInstruction,
            },
            callbacks: {
              onopen: () => ws.send(JSON.stringify({ type: 'status', data: 'Session Opened. Ready for interview.' })),
              onmessage: (serverMessage: LiveServerMessage) => {
                if (serverMessage.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                  ws.send(JSON.stringify({ type: 'audio', data: serverMessage.serverContent.modelTurn.parts[0].inlineData.data }));
                }

                let userText = '';
                let aiText = '';
                if (serverMessage.serverContent?.inputTranscription?.text) {
                  userText = serverMessage.serverContent.inputTranscription.text;
                  ws.send(JSON.stringify({ type: 'transcription', data: userText }));
                }
                if (serverMessage.serverContent?.outputTranscription?.text) {
                  aiText = serverMessage.serverContent.outputTranscription.text;
                   ws.send(JSON.stringify({ type: 'transcription', data: aiText }));
                }
                if (serverMessage.serverContent?.turnComplete) {
                   ws.send(JSON.stringify({ type: 'turnComplete', data: { user: userText, ai: aiText } }));
                }
              },
              onerror: (e: ErrorEvent) => ws.send(JSON.stringify({ type: 'error', data: e.message })),
              onclose: () => ws.close(),
            },
          });
        } catch (e: any) {
          ws.send(JSON.stringify({ type: 'error', data: `Failed to initialize session: ${e.message}` }));
          ws.close();
        }
      } else if (parsedMessage.type === 'audio' && session) {
        session.sendRealtimeInput({ media: { data: parsedMessage.data, mimeType: 'audio/pcm;rate=16000' } });
      }
    });

    ws.on('close', () => {
      session?.close();
    });
  });
}

const wss = (global as any).wss;

// This is the HTTP handler for upgrading the connection to a WebSocket.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (res.socket && res.socket.server.on) {
    res.socket.server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    });
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
