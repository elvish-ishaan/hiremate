import { agent } from "../agent/agentClient";
import { fromByteArray } from 'base64-js';


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

//transcribe audio to text
export async function transcribeAudio(audioBuffer: Blob) {
  console.log(audioBuffer,'getting audioi init...........')
  try {
    //convert the audio to base64
  const base64AudioFile = fromByteArray(new Uint8Array(audioBuffer));
  console.log(base64AudioFile,'getting convert to base64.............')

  //call the llm api to transcribe the audio
const contents = [
  { text: "Give me the transcript of this audio file." },
  {
    inlineData: {
      mimeType: "audio/mp3",
      data: base64AudioFile,
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
    return null
  }
}





