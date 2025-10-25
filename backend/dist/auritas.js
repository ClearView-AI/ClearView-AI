"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewCsv = previewCsv;
exports.renderCsv = renderCsv;
exports.loadRecipe = loadRecipe;
exports.exportCsv = exportCsv;
// backend/src/auritas.ts
const sync_1 = require("csv-parse/sync");
const csv_stringify_1 = require("csv-stringify");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const transforms_1 = require("./transforms");
const prisma = new client_1.PrismaClient();
/**
 * Preview a CSV file: returns headers & sample rows,
 * and records minimal metadata in SQLite.
 */
async function previewCsv(csvText, filename = "upload.csv") {
    const records = (0, sync_1.parse)(csvText, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
    });
    // Safely derive headers and sample
    const first = (records[0] ?? {});
    const headers = Object.keys(first);
    const sampleRows = records.slice(0, 10);
    const batch = await prisma.batch.create({ data: { kind: "auritas_viz" } });
    const file = await prisma.csvFile.create({
        data: {
            batchId: batch.id,
            filename,
            headersJson: JSON.stringify(headers), // store JSON as text
            rowCount: records.length,
            sampleJson: JSON.stringify(sampleRows), // store JSON as text
        },
    });
    return { batchId: batch.id, csvFileId: file.id, headers, sampleRows };
}
async function renderCsv(csvText, fieldMap, targetColumns, filters) {
    const data = (0, sync_1.parse)(csvText, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
    });
    // Shape rows according to targetColumns and per-column transform
    const rows = data.map((row) => {
        const shaped = {};
        for (const col of targetColumns) {
            const spec = fieldMap[col]?.transform;
            shaped[col] = spec ? (0, transforms_1.applyTransform)(row, spec) : "";
        }
        return shaped;
    });
    // Simple filter logic:
    // - If value is array: include only if row[col] is in that array
    // - If value is string: include only if row[col] contains it (case-insensitive)
    const filtered = rows.filter((r) => {
        for (const [k, v] of Object.entries(filters || {})) {
            if (Array.isArray(v) && v.length) {
                if (!v.includes(r[k]))
                    return false;
            }
            else if (typeof v === "string" && v.trim() !== "") {
                const cell = String(r[k] ?? "").toLowerCase();
                if (!cell.includes(v.toLowerCase()))
                    return false;
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
function loadRecipe(name) {
    const p = path_1.default.join(process.cwd(), "recipes", `${name}.json`);
    if (!fs_1.default.existsSync(p))
        throw new Error("Recipe not found: " + name);
    return JSON.parse(fs_1.default.readFileSync(p, "utf-8"));
}
/**
 * Stream a shaped CSV file to the client.
 */
async function exportCsv(columns, rows, res, filename) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    const s = (0, csv_stringify_1.stringify)({ header: true, columns });
    s.pipe(res);
    for (const r of rows)
        s.write(r);
    s.end();
}
