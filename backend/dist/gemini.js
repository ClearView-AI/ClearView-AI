"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiText = geminiText;
exports.geminiJSON = geminiJSON;
// backend/src/gemini.ts
const axios_1 = __importDefault(require("axios"));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";
if (!GEMINI_API_KEY) {
    console.warn("[WARN] GEMINI_API_KEY not set. Gemini routes will fail until you add it to .env");
}
/**
 * Call Gemini with a plain text prompt and return the string response.
 * For JSON outputs, we try-catch JSON.parse and return an object/array.
 */
async function geminiText(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const resp = await axios_1.default.post(url, body, { timeout: 20000 });
    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return text;
}
async function geminiJSON(prompt) {
    const text = await geminiText(prompt);
    try {
        // Some responses wrap JSON in code fences. Strip them.
        const cleaned = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
        return JSON.parse(cleaned);
    }
    catch {
        throw new Error("Gemini returned non-JSON or invalid JSON:\n" + text);
    }
}
