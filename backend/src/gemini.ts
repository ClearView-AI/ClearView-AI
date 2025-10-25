import express from "express";
import { extractSoftware } from "../utils/geminiClient";

const router = express.Router();

// POST /api/gemini/extract-software
router.post("/extract-software", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing software text" });
    const result = await extractSoftware(text);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 
