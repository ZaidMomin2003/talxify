import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {Blob} from '@google/genai';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // convert float32 -1 to 1 to int16 -32768 to 32767
    int16[i] = data[i] * 32768;
  }

  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const buffer = ctx.createBuffer(
    numChannels,
    data.length / 2 / numChannels,
    sampleRate,
  );

  const dataInt16 = new Int16Array(data.buffer);
  
  if (numChannels === 1) { 
    const dataFloat32 = new Float32Array(dataInt16.length);
    for (let i = 0; i < dataInt16.length; i++) {
        dataFloat32[i] = dataInt16[i] / 32768.0;
    }
    buffer.copyToChannel(dataFloat32, 0);
  } else {
     for (let i = 0; i < numChannels; i++) {
      const channelData = new Float32Array(buffer.length);
      for (let j = 0; j < buffer.length; j++) {
        channelData[j] = dataInt16[j * numChannels + i] / 32768.0;
      }
      buffer.copyToChannel(channelData, i);
    }
  }

  return buffer;
}
