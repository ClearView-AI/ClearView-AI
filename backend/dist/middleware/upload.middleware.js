"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// backend/src/middleware/upload.middleware.ts
const multer_1 = __importDefault(require("multer"));
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept CSV and text files only
    if (file.mimetype === "text/csv" ||
        file.mimetype === "application/csv" ||
        file.mimetype === "text/plain" ||
        file.originalname.endsWith(".csv")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only CSV files are allowed"));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
});
