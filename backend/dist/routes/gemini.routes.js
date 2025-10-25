"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/gemini.routes.ts
const express_1 = require("express");
const gemini_service_1 = require("../services/gemini.service");
const router = (0, express_1.Router)();
/**
 * POST /api/gemini/extract-software
 * Parse software column using Gemini API
 */
router.post("/extract-software", async (req, res) => {
    try {
        const { rawText, columnName } = req.body;
        if (!rawText) {
            return res.status(400).json({
                error: "rawText is required",
            });
        }
        const result = await (0, gemini_service_1.extractSoftwareInfo)(rawText);
        res.json({
            ...result,
            columnName: columnName || "software",
            originalText: rawText,
        });
    }
    catch (e) {
        console.error("Gemini extraction error:", e);
        res.status(500).json({
            error: e.message,
            details: e.stack,
        });
    }
});
/**
 * POST /api/gemini/extract-batch
 * Batch extract software info from multiple entries
 */
router.post("/extract-batch", async (req, res) => {
    try {
        const { entries } = req.body;
        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({
                error: "entries array is required",
            });
        }
        if (entries.length > 100) {
            return res.status(400).json({
                error: "Maximum 100 entries per batch",
            });
        }
        const results = await (0, gemini_service_1.batchExtractSoftware)(entries);
        res.json({
            count: results.length,
            results,
        });
    }
    catch (e) {
        console.error("Batch extraction error:", e);
        res.status(500).json({
            error: e.message,
            details: e.stack,
        });
    }
});
/**
 * GET /api/gemini/health
 * Check if Gemini API is configured
 */
router.get("/health", (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    res.json({
        configured: !!apiKey,
        status: apiKey ? "ready" : "missing API key",
    });
});
exports.default = router;
