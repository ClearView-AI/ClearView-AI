
// backend/src/gemini.ts
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  console.warn("[WARN] GEMINI_API_KEY not set. Gemini routes will fail until you add it to .env");
}

/**
 * Call Gemini with a plain text prompt and return the string response.
 * For JSON outputs, we try-catch JSON.parse and return an object/array.
 */
export async function geminiText(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = { contents: [{ parts: [{ text: prompt }]}] };

  const resp = await axios.post(url, body, { timeout: 20000 });
  const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return text;
}

export async function geminiJSON<T = any>(prompt: string): Promise<T> {
  const text = await geminiText(prompt);
  try {
    // Some responses wrap JSON in code fences. Strip them.
    const cleaned = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("Gemini returned non-JSON or invalid JSON:\n" + text);
  }
}
