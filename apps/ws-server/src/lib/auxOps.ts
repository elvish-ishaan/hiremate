import { agent } from "../agent/agentClient";
import { fromByteArray } from 'base64-js';
import { trailEncoding } from "./trails";
import fs from 'fs'


export function cleanAndParseJson<T = any>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/```json\s*/gi, '') // Remove ```json
      .replace(/```/g, '')         // Remove any ```
      .trim();                     // Clean up whitespace

    const parsed = JSON.parse(cleaned);
    return parsed as T;
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
}

export function encodeWAV(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const header = Buffer.alloc(44);
  const blockAlign = numChannels * bitDepth / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const fileSize = dataSize + 44 - 8;

  header.write('RIFF', 0); // ChunkID
  header.writeUInt32LE(fileSize, 4); // ChunkSize
  header.write('WAVE', 8); // Format
  header.write('fmt ', 12); // Subchunk1ID
  header.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (PCM)
  header.writeUInt16LE(numChannels, 22); // NumChannels
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(byteRate, 28); // ByteRate
  header.writeUInt16LE(blockAlign, 32); // BlockAlign
  header.writeUInt16LE(bitDepth, 34); // BitsPerSample
  header.write('data', 36); // Subchunk2ID
  header.writeUInt32LE(dataSize, 40); // Subchunk2Size

  return Buffer.concat([header, pcmData]);
}


//convert obj to float32 array
export function objectToFloat32Array(obj: Record<string, number>): Float32Array {
  try {
    const keys = Object.keys(obj).map(Number).sort((a, b) => a - b);
  const result = new Float32Array(keys.length);

  keys.forEach((key, i) => {
    const value = obj[key.toString()];
    result[i] = typeof value === "number" ? value : 0; // or throw error
  });

  return result;
  } catch (error) {
    console.log(error,'error in converting object to float32 array');
  }
}




export function float32ToWavBase64(float32Array: Float32Array, sampleRate = 16000): string {
  try {
    const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const wavHeaderSize = 44;
  const dataLength = float32Array.length * bytesPerSample;
  const buffer = new ArrayBuffer(wavHeaderSize + dataLength);
  const view = new DataView(buffer);

  // Write WAV header
  let offset = 0;
  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset++, s.charCodeAt(i));
    }
  };

  writeString('RIFF');                    // ChunkID
  view.setUint32(offset, 36 + dataLength, true); offset += 4; // ChunkSize
  writeString('WAVE');                    // Format
  writeString('fmt ');                    // Subchunk1ID
  view.setUint32(offset, 16, true); offset += 4;              // Subchunk1Size
  view.setUint16(offset, 1, true); offset += 2;               // AudioFormat (PCM)
  view.setUint16(offset, numChannels, true); offset += 2;     // NumChannels
  view.setUint32(offset, sampleRate, true); offset += 4;      // SampleRate
  view.setUint32(offset, byteRate, true); offset += 4;        // ByteRate
  view.setUint16(offset, blockAlign, true); offset += 2;      // BlockAlign
  view.setUint16(offset, bytesPerSample * 8, true); offset += 2; // BitsPerSample
  writeString('data');                    // Subchunk2ID
  view.setUint32(offset, dataLength, true); offset += 4;      // Subchunk2Size

  // PCM samples (float → int16)
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  const wavBytes = new Uint8Array(buffer);

  // Base64 encode
  const base64 = typeof window === 'undefined'
    ? Buffer.from(wavBytes).toString('base64')
    : btoa(String.fromCharCode(...wavBytes));

  return base64;

  } catch (error) {
    console.log(error,'error in converting float32 to wav base64');
    throw new Error("Error converting float32 to wav base64");
  }
}




//transcribe audio to text
export async function transcribeAudio(rawAns: any) {
  try {
    //convert the audio to suitable format
    const ansArr = objectToFloat32Array(rawAns as any);
    const base64AudioEncodedData = float32ToWavBase64(ansArr);

  //call the llm api to transcribe the audio
const contents = [
  { text: "Give me the transcript of this audio file." },
  {
    inlineData: {
      mimeType: "audio/wav",
      data: base64AudioEncodedData,
    },
  },
];

const response = await agent.models.generateContent({
  model: "gemini-2.5-flash",
  contents: contents,
});
console.log(response.text);
return response.text;
  } catch (error) {
    console.log(error,'error in transcribing audio')
    throw new Error("error in transcribing audio from llm");
  }
}












