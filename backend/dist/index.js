"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Import routers
const auritas_routes_1 = __importDefault(require("./routes/auritas.routes"));
const gemini_routes_1 = __importDefault(require("./routes/gemini.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "ClearView Backend",
    });
});
// API Routes
app.use("/api/auritas/viz", auritas_routes_1.default);
app.use("/api/gemini", gemini_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        path: req.path,
        method: req.method,
    });
});
// Error handler
app.use((err, req, res, next) => {
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
