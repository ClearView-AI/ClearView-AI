
// backend/src/auritas.ts
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { applyTransform, TransformSpec } from "./transforms";

const prisma = new PrismaClient();

// Row shape for parsed CSV
type CsvRow = Record<string, any>;

/**
 * Preview a CSV file: returns headers & sample rows,
 * and records minimal metadata in SQLite.
 */
export async function previewCsv(csvText: string, filename = "upload.csv") {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as CsvRow[];

  // Safely derive headers and sample
  const first = (records[0] ?? {}) as Record<string, unknown>;
  const headers = Object.keys(first);
  const sampleRows = records.slice(0, 10);

  const batch = await prisma.batch.create({ data: { kind: "auritas_viz" } });

  const file = await prisma.csvFile.create({
    data: {
      batchId: batch.id,
      filename,
      headersJson: JSON.stringify(headers),   // store JSON as text
      rowCount: records.length,
      sampleJson: JSON.stringify(sampleRows), // store JSON as text
    },
  });

  return { batchId: batch.id, csvFileId: file.id, headers, sampleRows };
}

/**
 * Apply field map and transform logic to a CSV string.
 */
type FieldMap = Record<string, { transform: TransformSpec }>;

export async function renderCsv(
  csvText: string,
  fieldMap: FieldMap,
  targetColumns: string[],
  filters: Record<string, any>
) {
  const data = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as CsvRow[];

  // Shape rows according to targetColumns and per-column transform
  const rows = data.map((row) => {
    const shaped: Record<string, any> = {};
    for (const col of targetColumns) {
      const spec = fieldMap[col]?.transform;
      shaped[col] = spec ? applyTransform(row, spec) : "";
    }
    return shaped;
  });

  // Simple filter logic:
  // - If value is array: include only if row[col] is in that array
  // - If value is string: include only if row[col] contains it (case-insensitive)
  const filtered = rows.filter((r) => {
    for (const [k, v] of Object.entries(filters || {})) {
      if (Array.isArray(v) && v.length) {
        if (!v.includes(r[k])) return false;
      } else if (typeof v === "string" && v.trim() !== "") {
        const cell = String(r[k] ?? "").toLowerCase();
        if (!cell.includes(v.toLowerCase())) return false;
      }
    }
    return true;
  });

  return { columns: targetColumns, rows: filtered.slice(0, 500) };
}

/**
 * Load a JSON recipe from /recipes directory.
 * Example name: "sap_example_screen" -> recipes/sap_example_screen.json
 */
export function loadRecipe(name: string) {
  const p = path.join(process.cwd(), "recipes", `${name}.json`);
  if (!fs.existsSync(p)) throw new Error("Recipe not found: " + name);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

/**
 * Stream a shaped CSV file to the client.
 */
export async function exportCsv(
  columns: string[],
  rows: Record<string, any>[],
  res: any,
  filename: string
) {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const s = stringify({ header: true, columns });
  s.pipe(res);
  for (const r of rows) s.write(r);
  s.end();
}
