// backend/src/routes/auritas.routes.ts
import { Router, Request, Response } from "express";
import { upload } from "../middleware/upload.middleware";
import { previewCsv, renderCsv, exportCsv, loadRecipe } from "../auritas";
import { bufferToText, validateCsvText } from "../services/file.service";
import {
  PreviewCsvRequest,
  RenderCsvRequest,
  ErrorResponse,
} from "../types/api.types";

const router = Router();

// In-memory CSV store (shared with main app)
export const CSV_STORE: Record<string, string> = {};

/**
 * POST /api/auritas/viz/preview
 * Preview CSV from raw text
 */
router.post("/preview", async (req: Request, res: Response) => {
  try {
    const { csvText, filename } = req.body as PreviewCsvRequest;

    if (!csvText) {
      return res.status(400).json({
        error: "csvText is required",
      } as ErrorResponse);
    }

    const validation = validateCsvText(csvText);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
      } as ErrorResponse);
    }

    const info = await previewCsv(csvText, filename || "upload.csv");
    CSV_STORE[info.csvFileId] = csvText;

    res.json(info);
  } catch (e: any) {
    console.error("Preview error:", e);
    res.status(500).json({
      error: e.message,
      details: e.stack,
    } as ErrorResponse);
  }
});

/**
 * POST /api/auritas/viz/preview-file
 * Upload CSV file (multipart form data)
 */
router.post(
  "/preview-file",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded. Use field name 'file'",
        } as ErrorResponse);
      }

      const csvText = bufferToText(req.file.buffer);
      const filename = req.file.originalname;

      const validation = validateCsvText(csvText);
      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error,
        } as ErrorResponse);
      }

      const info = await previewCsv(csvText, filename);
      CSV_STORE[info.csvFileId] = csvText;

      res.json(info);
    } catch (e: any) {
      console.error("File upload error:", e);
      res.status(500).json({
        error: e.message,
        details: e.stack,
      } as ErrorResponse);
    }
  }
);

/**
 * POST /api/auritas/viz/render
 * Transform CSV using field map + filters
 */
router.post("/render", async (req: Request, res: Response) => {
  try {
    const { csvFileId, fieldMap, targetScreen, filters } =
      req.body as RenderCsvRequest;

    if (!csvFileId || !fieldMap || !targetScreen) {
      return res.status(400).json({
        error: "csvFileId, fieldMap, and targetScreen are required",
      } as ErrorResponse);
    }

    const recipe = loadRecipe(targetScreen);
    const csvText = CSV_STORE[csvFileId];

    if (!csvText) {
      return res.status(404).json({
        error: "CSV not found in session. Please upload again.",
      } as ErrorResponse);
    }

    const shaped = await renderCsv(
      csvText,
      fieldMap,
      recipe.targetColumns,
      filters || recipe.defaultFilters || {}
    );

    res.json(shaped);
  } catch (e: any) {
    console.error("Render error:", e);
    res.status(500).json({
      error: e.message,
      details: e.stack,
    } as ErrorResponse);
  }
});

/**
 * GET /api/auritas/viz/export
 * Download transformed CSV
 */
router.get("/export", async (req: Request, res: Response) => {
  try {
    const { csvFileId, targetScreen, fieldMapJson, filtersJson } = req.query as {
      csvFileId?: string;
      targetScreen?: string;
      fieldMapJson?: string;
      filtersJson?: string;
    };

    if (!csvFileId || !targetScreen || !fieldMapJson) {
      return res.status(400).send("csvFileId, targetScreen, and fieldMapJson are required");
    }

    const csvText = CSV_STORE[csvFileId];
    if (!csvText) {
      return res.status(404).send("CSV not found in session");
    }

    const recipe = loadRecipe(targetScreen);
    const fieldMap = JSON.parse(fieldMapJson);
    const filters = filtersJson
      ? JSON.parse(filtersJson)
      : recipe.defaultFilters || {};

    const shaped = await renderCsv(csvText, fieldMap, recipe.targetColumns, filters);
    await exportCsv(shaped.columns, shaped.rows, res, `auritas_${targetScreen}.csv`);
  } catch (e: any) {
    console.error("Export error:", e);
    res.status(500).send(e.message);
  }
});

export default router;
