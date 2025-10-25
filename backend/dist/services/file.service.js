"use strict";
// backend/src/services/file.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToText = bufferToText;
exports.validateCsvText = validateCsvText;
exports.generateSessionId = generateSessionId;
/**
 * Convert uploaded buffer to text string.
 */
function bufferToText(buffer, encoding = "utf-8") {
    return buffer.toString(encoding);
}
/**
 * Validate CSV text has proper structure.
 */
function validateCsvText(csvText) {
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
function generateSessionId() {
    return `csv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
