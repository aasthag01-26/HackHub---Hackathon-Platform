import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Code,
  Copy,
  Check,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
  Terminal,
  Layers,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface SnippetItem {
  _id: string;
  authorName: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
  description: string;
  createdAt: string;
}

export default function SnippetsPage() {
  const { currentUser, currentTeam } = useAppContext();
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("all");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Snippet Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLang, setNewLang] = useState("typescript");
  const [newCode, setNewCode] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const languages = ["all", "typescript", "javascript", "python", "css", "sql", "json"];

  useEffect(() => {
    fetchSnippets();
  }, [selectedLang, search]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const teamId = currentTeam?._id || "general";
      let url = `http://localhost:5000/api/snippets?teamId=${teamId}&language=${selectedLang}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSnippets(data);
        return;
      }
    } catch {
      // Mock fallback
    } finally {
      setLoading(false);
    }

    setSnippets([
      {
        _id: "snip-1",
        authorName: "SriRam",
        title: "Socket.IO Real-Time Chat Dispatcher",
        language: "typescript",
        tags: ["websocket", "realtime", "chat"],
        description: "Lightweight client-side hook for real-time messaging with room isolation and reconnect logic.",
        code: `import { useEffect, useState } from "react";\nimport io, { Socket } from "socket.io-client";\n\nexport const useTeamSocket = (teamId: string) => {\n  const [socket, setSocket] = useState<Socket | null>(null);\n  useEffect(() => {\n    const s = io("http://localhost:5000");\n    s.emit("join_team", teamId);\n    setSocket(s);\n    return () => { s.disconnect(); };\n  }, [teamId]);\n  return socket;\n};`,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "snip-2",
        authorName: "Alex R.",
        title: "JWT Authorization Interceptor",
        language: "javascript",
        tags: ["auth", "security", "jwt"],
        description: "Axios request interceptor injecting bearer token into authorization header.",
        code: `const api = axios.create({ baseURL: "/api" });\n\napi.interceptors.request.use((config) => {\n  const token = localStorage.getItem("token");\n  if (token) {\n    config.headers.Authorization = \`Bearer \${token}\`;\n  }\n  return config;\n});`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    const payload = {
      teamId: currentTeam?._id || "general",
      authorName: currentUser?.name || "Hacker",
      title: newTitle,
      language: newLang,
      code: newCode,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      description: newDesc,
    };

    try {
      const res = await fetch("http://localhost:5000/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setSnippets((prev) => [created, ...prev]);
        setIsModalOpen(false);
        resetForm();
        return;
      }
    } catch {
      // Optimistic
    }

    setSnippets((prev) => [
      {
        _id: "snip-" + Date.now(),
        ...payload,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle("");
    setNewCode("");
    setNewTags("");
    setNewDesc("");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Code className="w-8 h-8 text-cyan-400" />
              Team Code Snippet Vault
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Curate, discover, and reuse battle-tested boilerplate, hooks, and helpers across your hackathon team.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Save Snippet
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by snippet name, description, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                  selectedLang === lang
                    ? "bg-indigo-600 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {snippets.map((snip) => (
            <div
              key={snip._id}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                      {snip.language}
                    </span>
                    <h3 className="text-base font-bold text-white truncate max-w-[220px]">
                      {snip.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(snip._id, snip.code)}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  >
                    {copiedId === snip._id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>

                {snip.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {snip.description}
                  </p>
                )}

                {/* Code Window */}
                <div className="relative rounded-xl bg-[#090d16] border border-white/10 p-3.5 font-mono text-xs text-gray-200 overflow-x-auto max-h-48">
                  <pre>{snip.code}</pre>
                </div>
              </div>

              {/* Tags & Author Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {snip.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-gray-400">
                      <Tag className="w-2.5 h-2.5 text-indigo-400" /> #{tag}
                    </span>
                  ))}
                </div>
                <span>By {snip.authorName}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Snippet */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border border-white/15 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold">Save Code Snippet to Vault</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 mt-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Snippet Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Supabase Auth Context Provider"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-[#1e1b4b] border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {languages
                        .filter((l) => l !== "all")
                        .map((l) => (
                          <option key={l} value={l}>
                            {l.toUpperCase()}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="react, hooks, auth"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Short summary of what this code does..."
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Code Block
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Paste your reusable code here..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090d16] border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                  >
                    Save Snippet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
