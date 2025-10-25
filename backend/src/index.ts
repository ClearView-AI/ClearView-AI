
import "dotenv/config";
import express from "express";
import cors from "cors";

// Import routers
import auritasRoutes from "./routes/auritas.routes";
import geminiRoutes from "./routes/gemini.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "ClearView Backend",
  });
});

// API Routes
app.use("/api/auritas/viz", auritasRoutes);
app.use("/api/gemini", geminiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 5052;
app.listen(PORT, () => {
  console.log(`\n🚀 ClearView Backend running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/health\n`);
});
