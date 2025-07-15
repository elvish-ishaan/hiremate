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
