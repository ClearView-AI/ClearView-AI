
// backend/src/transforms.ts
type Row = Record<string, any>;

export type TransformSpec =
  | { fn: "identity"; args: [string] }
  | { fn: "upper"; args: [string] }
  | { fn: "lower"; args: [string] }
  | { fn: "concat"; args: string[] }
  | { fn: "number"; args: [string] }
  | { fn: "padLeft"; args: [string, string, number] }
  | { fn: "substring"; args: [string, number, number] }
  | { fn: "split"; args: [string, string, number] }
  | { fn: "normalizeDate"; args: [string] };

const getVal = (row: Row, token: string) => {
  // token can be a header name or a quoted literal like "' - '"
  if (token.startsWith("'") && token.endsWith("'")) return token.slice(1, -1);
  return row[token];
};

export function applyTransform(row: Row, t: TransformSpec): any {
  switch (t.fn) {
    case "identity": return getVal(row, t.args[0]);
    case "upper": return String(getVal(row, t.args[0]) ?? "").toUpperCase();
    case "lower": return String(getVal(row, t.args[0]) ?? "").toLowerCase();
    case "concat": return t.args.map(a => String(getVal(row, a) ?? "")).join("");
    case "number": {
      const n = parseFloat(String(getVal(row, t.args[0]) ?? ""));
      return Number.isFinite(n) ? n : null;
    }
    case "padLeft": {
      const s = String(getVal(row, t.args[0]) ?? "");
      const pad = t.args[1];
      const len = t.args[2];
      return s.padStart(len, pad);
    }
    case "substring": {
      const s = String(getVal(row, t.args[0]) ?? "");
      const start = t.args[1];
      const end = t.args[2];
      return s.substring(start, end);
    }
    case "split": {
      const s = String(getVal(row, t.args[0]) ?? "");
      const parts = s.split(t.args[1]);
      const idx = t.args[2];
      return parts[idx] ?? "";
    }
    case "normalizeDate": {
      const raw = String(getVal(row, t.args[0]) ?? "").trim();
      // try ISO first
      const tryIso = new Date(raw);
      if (!isNaN(tryIso.getTime())) return tryIso.toISOString().slice(0, 10);
      // try M/D/Y or M-D-Y
      const mdy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
      if (mdy) {
        const m = mdy[1].padStart(2, "0");
        const d = mdy[2].padStart(2, "0");
        const y = mdy[3].length === 2 ? "20" + mdy[3] : mdy[3];
        return `${y}-${m}-${d}`;
      }
      return raw;
    }
    default: return null;
  }
}
