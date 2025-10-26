"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const sync_1 = require("csv-parse/sync");
const auritas_1 = require("./auritas");
const gemini_1 = require("./gemini");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
// ---------- In-memory stores ----------
const CSV_STORE = {};
const GEMINI_CACHE = {};
const GEMINI_CACHE_TTL_MS = 10 * 60 * 1000;
function makeCacheKey(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
}
// ---------- Multer for uploads ----------
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});
// ---------- PREVIEW (raw text) ----------
app.post("/api/auritas/viz/preview", async (req, res) => {
    try {
        const { csvText, filename } = req.body || {};
        if (!csvText)
            return res.status(400).json({ error: "csvText required" });
        const info = await (0, auritas_1.previewCsv)(csvText, filename || "upload.csv");
        CSV_STORE[info.csvFileId] = csvText;
        res.json(info);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ---------- PREVIEW (file upload) ----------
app.post("/api/auritas/viz/preview-file", upload.single("file"), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: "file required" });
        const csvText = req.file.buffer.toString("utf8");
        const filename = req.file.originalname || "upload.csv";
        const info = await (0, auritas_1.previewCsv)(csvText, filename);
        CSV_STORE[info.csvFileId] = csvText;
        res.json(info);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ---------- RENDER / TRANSFORM ----------
app.post("/api/auritas/viz/render", async (req, res) => {
    try {
        const { csvFileId, fieldMap, targetScreen, filters } = req.body || {};
        if (!csvFileId || !fieldMap || !targetScreen) {
            return res.status(400).json({ error: "csvFileId, fieldMap, targetScreen required" });
        }
        const recipe = (0, auritas_1.loadRecipe)(targetScreen);
        const csvText = CSV_STORE[csvFileId];
        if (!csvText)
            return res.status(404).json({ error: "CSV not found in session" });
        const shaped = await (0, auritas_1.renderCsv)(csvText, fieldMap, recipe.targetColumns, filters || recipe.defaultFilters || {});
        res.json(shaped);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ---------- EXPORT ----------
app.get("/api/auritas/viz/export", async (req, res) => {
    try {
        const { csvFileId, targetScreen, fieldMapJson, filtersJson } = req.query;
        if (!csvFileId || !targetScreen || !fieldMapJson) {
            return res.status(400).send("csvFileId, targetScreen, fieldMapJson required");
        }
        const csvText = CSV_STORE[csvFileId];
        if (!csvText)
            return res.status(404).send("CSV not found in session");
        const recipe = (0, auritas_1.loadRecipe)(targetScreen);
        const fieldMap = JSON.parse(fieldMapJson);
        const filters = filtersJson ? JSON.parse(filtersJson) : (recipe.defaultFilters || {});
        const shaped = await (0, auritas_1.renderCsv)(csvText, fieldMap, recipe.targetColumns, filters);
        await (0, auritas_1.exportCsv)(shaped.columns, shaped.rows, res, `auritas_${targetScreen}.csv`);
    }
    catch (e) {
        res.status(500).send(e.message);
    }
});
// ---------- SUMMARY ----------
app.get("/api/auritas/viz/summary", async (req, res) => {
    try {
        const { csvFileId } = req.query;
        if (!csvFileId)
            return res.status(400).json({ error: "csvFileId required" });
        const csvText = CSV_STORE[csvFileId];
        if (!csvText)
            return res.status(404).json({ error: "CSV not found in session" });
        const rows = (0, sync_1.parse)(csvText, {
            columns: true,
            skip_empty_lines: true,
            bom: true
        });
        const rowCount = rows.length;
        const columns = rowCount ? Object.keys(rows[0]) : [];
        // helpers
        const isNumeric = (s) => {
            if (s === "" || s == null)
                return false;
            const n = Number(s);
            return Number.isFinite(n);
        };
        const toNumber = (s) => Number(s);
        const isIsoLikeDate = (s) => {
            if (!s)
                return false;
            // quick accept for ISO or M/D/Y; we only compute range if Date() can parse it
            const d = new Date(s);
            return !isNaN(d.getTime());
        };
        const toDateMs = (s) => new Date(s).getTime();
        // containers
        const missingByColumn = {};
        const nonEmptyByColumn = {};
        const distinctByColumn = {};
        const sampleByColumn = {};
        const numericStats = {};
        const dateStats = {};
        for (const col of columns) {
            missingByColumn[col] = 0;
            nonEmptyByColumn[col] = 0;
            sampleByColumn[col] = [];
        }
        // pre-collect values per column for distinct & stats
        const valuesByCol = {};
        for (const col of columns)
            valuesByCol[col] = [];
        for (const r of rows) {
            for (const col of columns) {
                const raw = r[col];
                const v = raw === null || raw === undefined ? "" : String(raw).trim();
                if (!v) {
                    missingByColumn[col] += 1;
                }
                else {
                    nonEmptyByColumn[col] += 1;
                    valuesByCol[col].push(v);
                    if (sampleByColumn[col].length < 3)
                        sampleByColumn[col].push(v);
                }
            }
        }
        // compute distinct and numeric/date stats
        for (const col of columns) {
            // distinct
            const seen = new Set(valuesByCol[col]);
            distinctByColumn[col] = seen.size;
            // numeric stats
            const nums = valuesByCol[col].filter(isNumeric).map(toNumber);
            if (nums.length) {
                const sum = nums.reduce((a, b) => a + b, 0);
                numericStats[col] = {
                    count: nums.length,
                    min: Math.min(...nums),
                    max: Math.max(...nums),
                    mean: +(sum / nums.length).toFixed(4)
                };
            }
            // date stats (ISO-parsable)
            const dms = valuesByCol[col].filter(isIsoLikeDate).map(toDateMs);
            if (dms.length) {
                const minMs = Math.min(...dms);
                const maxMs = Math.max(...dms);
                dateStats[col] = {
                    count: dms.length,
                    minDate: new Date(minMs).toISOString().slice(0, 10),
                    maxDate: new Date(maxMs).toISOString().slice(0, 10)
                };
            }
        }
        res.json({
            rowCount,
            columns,
            missingByColumn,
            nonEmptyByColumn,
            distinctByColumn,
            numericStats, // only present for columns that looked numeric
            dateStats, // only present for columns that looked date-like
            sampleByColumn
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// ---------- GEMINI (with cache) ----------
app.post("/api/gemini/extract-software", async (req, res) => {
    try {
        const { csvFileId, columnName, limit = 25 } = req.body || {};
        if (!csvFileId || !columnName) {
            return res.status(400).json({ error: "csvFileId and columnName required" });
        }
        const csvText = CSV_STORE[csvFileId];
        if (!csvText)
            return res.status(404).json({ error: "CSV not found in session" });
        const rows = (0, sync_1.parse)(csvText, { columns: true, skip_empty_lines: true, bom: true });
        const slice = rows.slice(0, Math.min(limit, 100));
        const examples = slice.map(r => r[columnName]).filter(Boolean).map(v => String(v).slice(0, 200));
        if (!examples.length)
            return res.json({ items: [] });
        const key = makeCacheKey({ csvFileId, columnName, limit, examples });
        const now = Date.now();
        const hit = GEMINI_CACHE[key];
        if (hit && hit.expiresAt > now) {
            const parsed = hit.value;
            const items = examples.map((raw, i) => ({ raw, parsed: parsed[i] || null }));
            return res.json({ items, cached: true });
        }
        const prompt = `
You are a data cleaner. For each software name, extract:
- manufacturer (string)
- product (string)
- edition (string | null)
- version (string | null)
- confidence (0..1)

Return a JSON array the same length and order as the inputs.
Keys per item: { "manufacturer": string, "product": string, "edition": string|null, "version": string|null, "confidence": number }

Inputs:
${JSON.stringify(examples, null, 2)}
    `.trim();
        const parsed = await (0, gemini_1.geminiJSON)(prompt);
        GEMINI_CACHE[key] = { value: parsed, expiresAt: now + GEMINI_CACHE_TTL_MS };
        const items = examples.map((raw, i) => ({ raw, parsed: parsed[i] || null }));
        res.json({ items, cached: false });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post("/api/gemini/clear-cache", (_req, res) => {
    for (const k of Object.keys(GEMINI_CACHE))
        delete GEMINI_CACHE[k];
    res.json({ ok: true });
});
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
