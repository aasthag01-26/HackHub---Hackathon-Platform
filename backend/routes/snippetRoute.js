const express = require("express");
const router = express.Router();
const Snippet = require("../models/Snippet");

const SEED_SNIPPETS = [
  {
    _id: "snip-1",
    teamId: "general",
    authorName: "SriRam",
    title: "Socket.IO Real-Time Chat Dispatcher",
    language: "typescript",
    tags: ["websocket", "realtime", "chat"],
    description: "Lightweight client-side hook for real-time messaging with room isolation and reconnect logic.",
    code: `import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

export const useTeamSocket = (teamId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:5000");
    s.emit("join_team", teamId);
    setSocket(s);
    return () => { s.disconnect(); };
  }, [teamId]);

  return socket;
};`,
  },
  {
    _id: "snip-2",
    teamId: "general",
    authorName: "Alex R.",
    title: "JWT Authorization Interceptor",
    language: "javascript",
    tags: ["auth", "security", "jwt"],
    description: "Axios request interceptor injecting bearer token into authorization header.",
    code: `const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});`,
  },
  {
    _id: "snip-3",
    teamId: "general",
    authorName: "Sarah K.",
    title: "Glassmorphism Tailwind Card Class",
    language: "css",
    tags: ["css", "tailwind", "ui"],
    description: "Sleek translucent card styling with responsive backdrop blur and subtle border.",
    code: `.glass-card {
  background: rgba(30, 27, 75, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
}`,
  },
];

// GET /api/snippets - query snippets
router.get("/", async (req, res) => {
  try {
    const { teamId, language, search } = req.query;
    const query = {};

    if (teamId) {
      query.teamId = { $in: [teamId, "general"] };
    }
    if (language && language !== "all") {
      query.language = language;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let snippets = await Snippet.find(query).sort({ createdAt: -1 });
    if (snippets.length === 0 && !search && (!language || language === "all")) {
      snippets = await Snippet.insertMany(SEED_SNIPPETS);
    }

    res.json(snippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    res.status(500).json({ message: "Server error fetching snippets" });
  }
});

// POST /api/snippets - create snippet
router.post("/", async (req, res) => {
  try {
    const { teamId = "general", authorName, title, language, code, tags, description } = req.body;
    if (!title || !code) {
      return res.status(400).json({ message: "Title and code are required" });
    }

    const snippet = new Snippet({
      teamId,
      authorName: authorName || "Hacker",
      title,
      language: language || "typescript",
      code,
      tags: Array.isArray(tags) ? tags : [],
      description: description || "",
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    console.error("Error saving snippet:", error);
    res.status(500).json({ message: "Server error saving snippet" });
  }
});

// DELETE /api/snippets/:id - delete snippet
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Snippet.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Snippet not found" });
    }
    res.json({ message: "Snippet deleted" });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    res.status(500).json({ message: "Server error deleting snippet" });
  }
});

module.exports = router;
