// backend/src/routes/gemini.routes.ts
import { Router, Request, Response } from "express";
import { extractSoftwareInfo, batchExtractSoftware } from "../services/gemini.service";
import { ExtractSoftwareRequest, ErrorResponse } from "../types/api.types";

const router = Router();

/**
 * POST /api/gemini/extract-software
 * Parse software column using Gemini API
 */
router.post("/extract-software", async (req: Request, res: Response) => {
  try {
    const { rawText, columnName } = req.body as ExtractSoftwareRequest;

    if (!rawText) {
      return res.status(400).json({
        error: "rawText is required",
      } as ErrorResponse);
    }

    const result = await extractSoftwareInfo(rawText);

    res.json({
      ...result,
      columnName: columnName || "software",
      originalText: rawText,
    });
  } catch (e: any) {
    console.error("Gemini extraction error:", e);
    res.status(500).json({
      error: e.message,
      details: e.stack,
    } as ErrorResponse);
  }
});

/**
 * POST /api/gemini/extract-batch
 * Batch extract software info from multiple entries
 */
router.post("/extract-batch", async (req: Request, res: Response) => {
  try {
    const { entries } = req.body as { entries: string[] };

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({
        error: "entries array is required",
      } as ErrorResponse);
    }

    if (entries.length > 100) {
      return res.status(400).json({
        error: "Maximum 100 entries per batch",
      } as ErrorResponse);
    }

    const results = await batchExtractSoftware(entries);

    res.json({
      count: results.length,
      results,
    });
  } catch (e: any) {
    console.error("Batch extraction error:", e);
    res.status(500).json({
      error: e.message,
      details: e.stack,
    } as ErrorResponse);
  }
});

/**
 * GET /api/gemini/health
 * Check if Gemini API is configured
 */
router.get("/health", (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  res.json({
    configured: !!apiKey,
    status: apiKey ? "ready" : "missing API key",
  });
});

export default router;
