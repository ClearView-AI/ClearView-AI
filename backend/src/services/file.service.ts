// backend/src/services/file.service.ts

/**
 * Convert uploaded buffer to text string.
 */
export function bufferToText(buffer: Buffer, encoding: BufferEncoding = "utf-8"): string {
  return buffer.toString(encoding);
}

/**
 * Validate CSV text has proper structure.
 */
export function validateCsvText(csvText: string): { valid: boolean; error?: string } {
  if (!csvText || csvText.trim().length === 0) {
    return { valid: false, error: "CSV text is empty" };
  }

  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return { valid: false, error: "CSV must have at least a header and one data row" };
  }

  return { valid: true };
}

/**
 * Generate a unique session ID for in-memory storage.
 */
export function generateSessionId(): string {
  return `csv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
