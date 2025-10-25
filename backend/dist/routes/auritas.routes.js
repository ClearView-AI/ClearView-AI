"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSV_STORE = void 0;
// backend/src/routes/auritas.routes.ts
const express_1 = require("express");
const upload_middleware_1 = require("../middleware/upload.middleware");
const auritas_1 = require("../auritas");
const file_service_1 = require("../services/file.service");
const router = (0, express_1.Router)();
// In-memory CSV store (shared with main app)
exports.CSV_STORE = {};
/**
 * POST /api/auritas/viz/preview
 * Preview CSV from raw text
 */
router.post("/preview", async (req, res) => {
    try {
        const { csvText, filename } = req.body;
        if (!csvText) {
            return res.status(400).json({
                error: "csvText is required",
            });
        }
        const validation = (0, file_service_1.validateCsvText)(csvText);
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error,
            });
        }
        const info = await (0, auritas_1.previewCsv)(csvText, filename || "upload.csv");
        exports.CSV_STORE[info.csvFileId] = csvText;
        res.json(info);
    }
    catch (e) {
        console.error("Preview error:", e);
        res.status(500).json({
            error: e.message,
            details: e.stack,
        });
    }
});
/**
 * POST /api/auritas/viz/preview-file
 * Upload CSV file (multipart form data)
 */
router.post("/preview-file", upload_middleware_1.upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded. Use field name 'file'",
            });
        }
        const csvText = (0, file_service_1.bufferToText)(req.file.buffer);
        const filename = req.file.originalname;
        const validation = (0, file_service_1.validateCsvText)(csvText);
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error,
            });
        }
        const info = await (0, auritas_1.previewCsv)(csvText, filename);
        exports.CSV_STORE[info.csvFileId] = csvText;
        res.json(info);
    }
    catch (e) {
        console.error("File upload error:", e);
        res.status(500).json({
            error: e.message,
            details: e.stack,
        });
    }
});
/**
 * POST /api/auritas/viz/render
 * Transform CSV using field map + filters
 */
router.post("/render", async (req, res) => {
    try {
        const { csvFileId, fieldMap, targetScreen, filters } = req.body;
        if (!csvFileId || !fieldMap || !targetScreen) {
            return res.status(400).json({
                error: "csvFileId, fieldMap, and targetScreen are required",
            });
        }
        const recipe = (0, auritas_1.loadRecipe)(targetScreen);
        const csvText = exports.CSV_STORE[csvFileId];
        if (!csvText) {
            return res.status(404).json({
                error: "CSV not found in session. Please upload again.",
            });
        }
        const shaped = await (0, auritas_1.renderCsv)(csvText, fieldMap, recipe.targetColumns, filters || recipe.defaultFilters || {});
        res.json(shaped);
    }
    catch (e) {
        console.error("Render error:", e);
        res.status(500).json({
            error: e.message,
            details: e.stack,
        });
    }
});
/**
 * GET /api/auritas/viz/export
 * Download transformed CSV
 */
router.get("/export", async (req, res) => {
    try {
        const { csvFileId, targetScreen, fieldMapJson, filtersJson } = req.query;
        if (!csvFileId || !targetScreen || !fieldMapJson) {
            return res.status(400).send("csvFileId, targetScreen, and fieldMapJson are required");
        }
        const csvText = exports.CSV_STORE[csvFileId];
        if (!csvText) {
            return res.status(404).send("CSV not found in session");
        }
        const recipe = (0, auritas_1.loadRecipe)(targetScreen);
        const fieldMap = JSON.parse(fieldMapJson);
        const filters = filtersJson
            ? JSON.parse(filtersJson)
            : recipe.defaultFilters || {};
        const shaped = await (0, auritas_1.renderCsv)(csvText, fieldMap, recipe.targetColumns, filters);
        await (0, auritas_1.exportCsv)(shaped.columns, shaped.rows, res, `auritas_${targetScreen}.csv`);
    }
    catch (e) {
        console.error("Export error:", e);
        res.status(500).send(e.message);
    }
});
exports.default = router;
