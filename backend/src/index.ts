
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { parse } from "csv-parse/sync";

import { exportCsv, loadRecipe, previewCsv, renderCsv } from "./auritas";
import { geminiJSON } from "./gemini";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------- In-memory stores ----------
const CSV_STORE: Record<string, string> = {};
type CacheEntry<T> = { value: T; expiresAt: number };
const GEMINI_CACHE: Record<string, CacheEntry<any>> = {};
const GEMINI_CACHE_TTL_MS = 10 * 60 * 1000;

function makeCacheKey(obj: any) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

// ---------- Multer for uploads ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ---------- PREVIEW (raw text) ----------
app.post("/api/auritas/viz/preview", async (req: Request, res: Response) => {
  try {
    const { csvText, filename } = req.body || {};
    if (!csvText) return res.status(400).json({ error: "csvText required" });
    const info = await previewCsv(csvText, filename || "upload.csv");
    CSV_STORE[info.csvFileId] = csvText;
    res.json(info);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- PREVIEW (file upload) ----------
app.post(
  "/api/auritas/viz/preview-file",
  upload.single("file"),
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: "file required" });
      const csvText = req.file.buffer.toString("utf8");
      const filename = req.file.originalname || "upload.csv";
      const info = await previewCsv(csvText, filename);
      CSV_STORE[info.csvFileId] = csvText;
      res.json(info);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
);

// ---------- RENDER / TRANSFORM ----------
app.post("/api/auritas/viz/render", async (req: Request, res: Response) => {
  try {
    const { csvFileId, fieldMap, targetScreen, filters } = req.body || {};
    if (!csvFileId || !fieldMap || !targetScreen) {
      return res.status(400).json({ error: "csvFileId, fieldMap, targetScreen required" });
    }
    const recipe = loadRecipe(targetScreen);
    const csvText = CSV_STORE[csvFileId];
    if (!csvText) return res.status(404).json({ error: "CSV not found in session" });
    const shaped = await renderCsv(
      csvText,
      fieldMap,
      recipe.targetColumns,
      filters || recipe.defaultFilters || {}
    );
    res.json(shaped);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- EXPORT ----------
app.get("/api/auritas/viz/export", async (req: Request, res: Response) => {
  try {
    const { csvFileId, targetScreen, fieldMapJson, filtersJson } = req.query as any;
    if (!csvFileId || !targetScreen || !fieldMapJson) {
      return res.status(400).send("csvFileId, targetScreen, fieldMapJson required");
    }
    const csvText = CSV_STORE[csvFileId];
    if (!csvText) return res.status(404).send("CSV not found in session");
    const recipe = loadRecipe(targetScreen);
    const fieldMap = JSON.parse(fieldMapJson);
    const filters = filtersJson ? JSON.parse(filtersJson) : (recipe.defaultFilters || {});
    const shaped = await renderCsv(csvText, fieldMap, recipe.targetColumns, filters);
    await exportCsv(shaped.columns, shaped.rows, res, `auritas_${targetScreen}.csv`);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// ---------- SUMMARY ----------
app.get("/api/auritas/viz/summary", async (req: Request, res: Response) => {
  try {
    const { csvFileId } = req.query as { csvFileId?: string };
    if (!csvFileId) return res.status(400).json({ error: "csvFileId required" });

    const csvText = CSV_STORE[csvFileId];
    if (!csvText) return res.status(404).json({ error: "CSV not found in session" });

    const rows = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    }) as Record<string, any>[];

    const rowCount = rows.length;
    const columns = rowCount ? Object.keys(rows[0]) : [];

    // helpers
    const isNumeric = (s: string) => {
      if (s === "" || s == null) return false;
      const n = Number(s);
      return Number.isFinite(n);
    };
    const toNumber = (s: string) => Number(s);
    const isIsoLikeDate = (s: string) => {
      if (!s) return false;
      // quick accept for ISO or M/D/Y; we only compute range if Date() can parse it
      const d = new Date(s);
      return !isNaN(d.getTime());
    };
    const toDateMs = (s: string) => new Date(s).getTime();

    // containers
    const missingByColumn: Record<string, number> = {};
    const nonEmptyByColumn: Record<string, number> = {};
    const distinctByColumn: Record<string, number> = {};
    const sampleByColumn: Record<string, string[]> = {};
    const numericStats: Record<
      string,
      { count: number; min: number; max: number; mean: number }
    > = {};
    const dateStats: Record<
      string,
      { count: number; minDate: string; maxDate: string }
    > = {};

    for (const col of columns) {
      missingByColumn[col] = 0;
      nonEmptyByColumn[col] = 0;
      sampleByColumn[col] = [];
    }

    // pre-collect values per column for distinct & stats
    const valuesByCol: Record<string, string[]> = {};
    for (const col of columns) valuesByCol[col] = [];

    for (const r of rows) {
      for (const col of columns) {
        const raw = r[col];
        const v = raw === null || raw === undefined ? "" : String(raw).trim();
        if (!v) {
          missingByColumn[col] += 1;
        } else {
          nonEmptyByColumn[col] += 1;
          valuesByCol[col].push(v);
          if (sampleByColumn[col].length < 3) sampleByColumn[col].push(v);
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
      numericStats,  // only present for columns that looked numeric
      dateStats,     // only present for columns that looked date-like
      sampleByColumn
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// ---------- GEMINI (with cache) ----------
app.post("/api/gemini/extract-software", async (req: Request, res: Response) => {
  try {
    const { csvFileId, columnName, limit = 25 } = req.body || {};
    if (!csvFileId || !columnName) {
      return res.status(400).json({ error: "csvFileId and columnName required" });
    }
    const csvText = CSV_STORE[csvFileId];
    if (!csvText) return res.status(404).json({ error: "CSV not found in session" });

    const rows = parse(csvText, { columns: true, skip_empty_lines: true, bom: true }) as Record<string, any>[];
    const slice = rows.slice(0, Math.min(limit, 100));
    const examples = slice.map(r => r[columnName]).filter(Boolean).map(v => String(v).slice(0, 200));
    if (!examples.length) return res.json({ items: [] });

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

    const parsed = await geminiJSON<any[]>(prompt);

    GEMINI_CACHE[key] = { value: parsed, expiresAt: now + GEMINI_CACHE_TTL_MS };

    const items = examples.map((raw, i) => ({ raw, parsed: parsed[i] || null }));
    res.json({ items, cached: false });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/gemini/clear-cache", (_req: Request, res: Response) => {
  for (const k of Object.keys(GEMINI_CACHE)) delete GEMINI_CACHE[k];
  res.json({ ok: true });
});

// ---------- EOS PREDICTION (with Gemini) ----------
app.post("/api/gemini/predict-eos", async (req: Request, res: Response) => {
  try {
    const { records } = req.body || {};
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: "records array required" });
    }

    const key = makeCacheKey({ records });
    const now = Date.now();
    const hit = GEMINI_CACHE[key];
    if (hit && hit.expiresAt > now) {
      return res.json({ predictions: hit.value, cached: true });
    }

    const prompt = `
You are an expert on software End-of-Support (EOS) dates. For each software record below, predict or lookup the EOS date.

For each item, provide:
- predictedEosDate (YYYY-MM-DD format or null if unknown)
- confidence (0..1, where 1 = known official date, 0.5-0.8 = educated guess, <0.5 = uncertain)
- source (string: "official", "estimated", "unknown")
- reasoning (brief explanation)

Return a JSON array the same length and order as inputs.
Keys per item: { "predictedEosDate": string|null, "confidence": number, "source": string, "reasoning": string }

Consider these factors:
- Microsoft products typically have 10 year support lifecycles
- Adobe Creative Cloud has rolling updates
- Oracle products often have extended support options
- Open source projects vary widely
- Look for patterns like version numbers indicating age

Software records:
${JSON.stringify(records.map((r: any) => ({
  vendor: r.vendor,
  product: r.product,
  version: r.version,
  currentEosDate: r.eosDate || null
})), null, 2)}
    `.trim();

    const predictions = await geminiJSON<any[]>(prompt);

    GEMINI_CACHE[key] = { value: predictions, expiresAt: now + GEMINI_CACHE_TTL_MS };

    res.json({ predictions, cached: false });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
