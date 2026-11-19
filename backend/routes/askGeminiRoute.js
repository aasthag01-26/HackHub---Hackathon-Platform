const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.post("/summarize", protect, async (req, res) => {
  const idea = req.body && req.body.idea;
  if (typeof idea !== "string" || !idea.trim() || idea.trim().length > 30000) {
    return res.status(400).json({
      error: "Summary input must contain between 1 and 30000 characters",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    const prompt = `Summarize this team chat. Include key decisions, action items, and unresolved questions:\n\n${idea.trim()}`;
    const result = await model.generateContent(prompt);

    return res.json({ summary: result.response.text() });
  } catch (err) {
    console.error("Gemini Summary Error:", err.message);
    return res.status(500).json({ error: err.message || "Error summarizing chat" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { idea } = req.body;
    console.log("🧠 Received idea:", idea);

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: "No idea provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    const prompt = `Generate a short startup pitch for this idea:\n\n${idea}`;
    console.log("Prompt:", prompt);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ pitch: text });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({ error: err.message || "Error generating pitch" });
  }
});

module.exports = router;
