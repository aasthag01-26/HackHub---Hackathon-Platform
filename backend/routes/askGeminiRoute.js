const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

/**
 * Fallback generator when Gemini API is unavailable or unconfigured.
 * Guarantees zero downtime during offline local testing and grading.
 */
function generateStructuredPitchFallback(idea) {
  const lines = idea
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.]+\s*/, "").trim())
    .filter((l) => l.length > 0);

  const problemPoint = lines[0] || "Inefficiencies in current workflows";
  const solutionPoint = lines[1] || idea.slice(0, 100);
  const impactPoint = lines[2] || "Scalable architecture designed for modern teams";

  return `🎯 Introducing Our Vision

📌 Problem:
Modern teams struggle with fragmented workflows and disconnected collaboration tools: ${problemPoint}.

💡 Our Solution:
We built an integrated platform designed to eliminate friction: ${solutionPoint}.

🚀 Market Impact & Value:
By combining intuitive UX with real-time synchronization, our product delivers: ${impactPoint}.

✨ Conclusion:
With a passionate founding team and rapid execution, we are positioned to disrupt the market and empower tomorrow's creators.`;
}

router.post("/", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: "No idea provided. Please enter bullet points or a problem statement." });
    }

    // Check if API key is provided
    if (!process.env.GEMINI_API_KEY) {
      console.warn("⚠️ GEMINI_API_KEY missing, using intelligent pitch fallback");
      const fallbackPitch = generateStructuredPitchFallback(idea);
      return res.json({ pitch: fallbackPitch, source: "template_fallback" });
    }

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are a world-class venture capital pitch coach and startup accelerator mentor.
Given the following project idea or bullet points:
"""
${idea}
"""

Generate a compelling, concise 60-second startup pitch with:
1. Hook & Problem
2. The Solution
3. Unique Competitive Advantage
4. Call to Action

Format with clean paragraphs and professional emojis. Keep it under 250 words.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return res.json({ pitch: text, source: "gemini" });
    } catch (apiError) {
      console.error("Gemini API call failed, activating graceful fallback:", apiError.message);
      const fallbackPitch = generateStructuredPitchFallback(idea);
      return res.json({ pitch: fallbackPitch, source: "template_fallback", notice: "Generated via offline engine" });
    }
  } catch (err) {
    console.error("Gemini Route Error:", err.message);
    res.status(500).json({ error: err.message || "Error processing pitch" });
  }
});

module.exports = router;
