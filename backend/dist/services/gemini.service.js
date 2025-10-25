"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSoftwareInfo = extractSoftwareInfo;
exports.batchExtractSoftware = batchExtractSoftware;
// backend/src/services/gemini.service.ts
const generative_ai_1 = require("@google/generative-ai");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
if (!GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY not set. Gemini endpoints will not work.");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
/**
 * Extract and normalize software information from raw text using Gemini API.
 */
async function extractSoftwareInfo(rawText) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `You are a software inventory parser. Extract vendor, product name, and version from the following text. 
Return ONLY a JSON object with this exact format (no markdown, no additional text):
{
  "vendor": "vendor name",
  "product": "product name",
  "version": "version number",
  "confidence": 0.95
}

If you cannot determine a field, use "Unknown".

Text to parse: "${rawText}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        // Remove markdown code blocks if present
        const jsonText = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        const parsed = JSON.parse(jsonText);
        return {
            vendor: parsed.vendor || "Unknown",
            product: parsed.product || "Unknown",
            version: parsed.version || "Unknown",
            confidence: parsed.confidence || 0.5,
            normalized: true,
        };
    }
    catch (error) {
        console.error("Gemini API error:", error.message);
        // Fallback: simple regex parsing
        return fallbackExtraction(rawText);
    }
}
/**
 * Fallback extraction using basic regex patterns.
 */
function fallbackExtraction(rawText) {
    const text = rawText.trim();
    // Try to extract version using common patterns
    const versionMatch = text.match(/v?(\d+\.[\d.]+)/i);
    const version = versionMatch ? versionMatch[1] : "Unknown";
    // Simple heuristic: assume first word is vendor, rest is product
    const parts = text.split(/\s+/);
    const vendor = parts[0] || "Unknown";
    const product = parts.slice(1).join(" ").replace(version, "").trim() || "Unknown";
    return {
        vendor,
        product,
        version,
        confidence: 0.3,
        normalized: false,
    };
}
/**
 * Batch extract software info from multiple entries.
 */
async function batchExtractSoftware(entries) {
    const results = [];
    for (const entry of entries) {
        try {
            const info = await extractSoftwareInfo(entry);
            results.push(info);
        }
        catch (error) {
            console.error(`Failed to extract: ${entry}`, error);
            results.push({
                vendor: "Error",
                product: entry,
                version: "Unknown",
                confidence: 0,
                normalized: false,
            });
        }
    }
    return results;
}
