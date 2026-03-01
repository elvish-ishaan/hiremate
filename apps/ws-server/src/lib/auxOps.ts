import { generateScoringPrompt } from './prompts';

export function cleanAndParseJson<T = any>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    return null;
  }
}

export async function scoreAnswer(question: string, answer: string): Promise<number> {
  try {
    const prompt = generateScoringPrompt(question, answer);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Question: ${question}\nAnswer: ${answer}` },
        ],
      }),
    });

    const data = await response.json() as any;
    const text: string = data.choices?.[0]?.message?.content ?? '';
    const parsed = cleanAndParseJson<{ score: number }>(text);
    return parsed?.score ?? 5;
  } catch (err) {
    console.error('Error scoring answer:', err);
    return 5;
  }
}
