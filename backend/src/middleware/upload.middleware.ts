// backend/src/middleware/upload.middleware.ts
import multer from "multer";
import { Request } from "express";

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept CSV and text files only
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/csv" ||
    file.mimetype === "text/plain" ||
    file.originalname.endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});
