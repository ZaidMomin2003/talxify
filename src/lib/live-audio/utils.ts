
'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createAudioBlob(stream: MediaStream): Blob {
    // This function needs to be adapted. The original `createBlob` converted Float32Array to Int16Array.
    // Here we are working with a MediaStream. The correct way to get data is via a MediaRecorder.
    // However, the `fetch` API body can directly take a ReadableStream.
    // This is a simplified placeholder as the direct stream piping is more complex.
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    
    // We cannot block here, so this utility in its current form is not ideal for the `fetch` body.
    // The implementation in the main component will need to handle this differently.
    // For now, we'll return an empty blob as this function's logic is superseded by the streaming POST request.
    return new Blob(chunks, { type: 'audio/webm' });
}


async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The incoming data from Gemini is already raw PCM, but it might be in a different format.
  // The example code seems to assume Int16. Let's process it.
  const int16 = new Int16Array(data.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }

  const buffer = ctx.createBuffer(
    numChannels,
    float32.length / numChannels,
    sampleRate,
  );

  if (numChannels === 1) {
    buffer.copyToChannel(float32, 0);
  } else {
    for (let i = 0; i < numChannels; i++) {
      const channelData = new Float32Array(float32.length / numChannels);
      for (let j = 0; j < channelData.length; j++) {
        channelData[j] = float32[j * numChannels + i];
      }
      buffer.copyToChannel(channelData, i);
    }
  }

  return buffer;
}


export {createAudioBlob, decode, decodeAudioData, encode};
