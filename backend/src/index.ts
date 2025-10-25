
import "dotenv/config";
import express from "express";
import cors from "cors";
import { exportCsv, loadRecipe, previewCsv, renderCsv } from "./auritas";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// In-memory CSV store for the hackathon
const CSV_STORE: Record<string, string> = {};

app.post("/api/auritas/viz/preview", async (req, res) => {
  try {
    const { csvText, filename } = req.body;
    if (!csvText) return res.status(400).json({ error: "csvText required" });
    const info = await previewCsv(csvText, filename || "upload.csv");
    CSV_STORE[info.csvFileId] = csvText;
    res.json(info);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auritas/viz/render", async (req, res) => {
  try {
    const { csvFileId, fieldMap, targetScreen, filters } = req.body;
    if (!csvFileId || !fieldMap || !targetScreen) return res.status(400).json({ error: "csvFileId, fieldMap, targetScreen required" });
    const recipe = loadRecipe(targetScreen);
    const csvText = CSV_STORE[csvFileId];
    if (!csvText) return res.status(404).json({ error: "CSV not found in session" });
    const shaped = await renderCsv(csvText, fieldMap, recipe.targetColumns, filters || recipe.defaultFilters || {});
    res.json(shaped);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/auritas/viz/export", async (req, res) => {
  try {
    const { csvFileId, targetScreen, fieldMapJson, filtersJson } = req.query as any;
    if (!csvFileId || !targetScreen || !fieldMapJson) return res.status(400).send("csvFileId, targetScreen, fieldMapJson required");
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

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
