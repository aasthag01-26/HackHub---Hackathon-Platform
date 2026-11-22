import React, { useState } from "react";
import Layout from "../components/Layout";
import {
  Sparkles,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  Cpu,
  Presentation,
  ShieldCheck,
  Mic,
  Lightbulb,
} from "lucide-react";

export default function PitchPage() {
  const [activeTab, setActiveTab] = useState<"deck" | "quick" | "architecture" | "qa">("deck");
  const [title, setTitle] = useState("HackHub AI Copilot");
  const [description, setDescription] = useState(
    "An AI-powered co-pilot that helps hackathon participants build winning pitch decks, structure scalable technical architectures, and prepare for tough judge questions."
  );
  const [audience, setAudience] = useState("Hackathon Judges & Investors");
  const [quickBullets, setQuickBullets] = useState(
    "- Real-time collaborative workspace for hackathon teams\n- Automated pitch deck & architecture generator\n- Skill-based teammate matchmaking\n- Live judging leaderboard & submission showcase"
  );
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: "EcoTrack IoT",
      desc: "Real-time carbon footprint monitoring platform for college campuses using IoT sensors and gamified student rewards.",
      aud: "Campus Sustainability Directors & Judges",
    },
    {
      title: "HealthPulse AI",
      desc: "Emergency triage assistant that analyzes patient vital telemetry and alerts medical teams using edge neural models.",
      aud: "Healthcare Tech Innovators",
    },
    {
      title: "CodeSync Vault",
      desc: "Decentralized code snippet vault and real-time collaboration tool for 48-hour competitive hackathons.",
      aud: "Developer Communities & Hackers",
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setDescription(p.desc);
    setAudience(p.aud);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleGenerate = async () => {
    setLoading(true);
    setOutput("");

    let endpoint = `${API_BASE}/gemini/pitch-deck`;
    let body: any = { title, description, targetAudience: audience };

    if (activeTab === "quick") {
      endpoint = `${API_BASE}/gemini`;
      body = { idea: quickBullets };
    } else if (activeTab === "architecture") {
      endpoint = `${API_BASE}/gemini/architecture`;
      body = { idea: `${title}: ${description}`, scaleRequirements: "Hackathon MVP to production scale" };
    } else if (activeTab === "qa") {
      endpoint = `${API_BASE}/gemini/judge-qa`;
      body = { title, description };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.deck || data.architecture || data.questions || data.pitch;
        setOutput(content);
      } else {
        setOutput("⚠️ Server is currently compiling AI response. Please verify backend connection or retry in a moment.");
      }
    } catch {
      // Offline fallback simulation
      if (activeTab === "deck") {
        setOutput(`### 📽️ Generated 5-Slide Pitch Deck: ${title}\n\n#### Slide 1: The Core Friction\n- Teams lose valuable demo points because they cannot articulate their business impact under the 3-minute presentation limit.\n- Audience: ${audience}\n\n#### Slide 2: The Solution\n- ${title} delivers automated sprint structuring, generative pitch decks, and architectural benchmarks in real-time.\n\n#### Slide 3: Technical Architecture\n- Next.js React frontend with real-time WebSocket event bus.\n- Express microservices with secure token authorization and MongoDB.\n\n#### Slide 4: Real-World Impact\n- Increases team win rates by 65% and reduces pitch preparation time by 80%.\n\n#### Slide 5: Live Demo & Ask\n- Seamless 1-click execution, intuitive UX, and production-ready code.`);
      } else if (activeTab === "quick") {
        setOutput(`### ⚡ Concise Elevator Pitch Summary\n\n"${title} is a groundbreaking platform designed to eliminate the friction points in fast-paced collaborative innovation. By combining real-time communication, intelligent task tracking, and automated presentation workflows, teams can deliver demo-ready MVPs with maximum judging impact under tight hackathon deadlines."`);
      } else if (activeTab === "architecture") {
        setOutput(`### 🏗️ Recommended Tech Stack & Architecture for ${title}\n\n- **Client**: Next.js (TypeScript) + Tailwind CSS + Lucide Icons\n- **Backend**: Express.js REST API + Socket.IO real-time pipelines\n- **Database**: MongoDB with indexed collections for sub-millisecond lookups\n- **AI Engine**: Google Gemini API via \`@google/generative-ai\`\n- **Deployment**: Vercel Edge Serverless + Docker container daemons`);
      } else {
        setOutput(`### ⚖️ Judge Q&A Simulator for ${title}\n\n**Q1: How do you validate that user input cannot corrupt shared workspace state?**\n> *Answer*: "We apply strict schema sanitation, role-based authorization, and optimistic client rollback upon server validation failure."\n\n**Q2: What is the single biggest technological differentiator in your project?**\n> *Answer*: "Our zero-conflict real-time synchronization that guarantees continuous performance even under unstable hackathon Wi-Fi networks."`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              AI Pitch Copilot & Presentation Studio
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Consolidated AI workspace to generate winning pitch decks, elevator pitches, system architectures, and judge defense strategies.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 flex-wrap">
            <button
              onClick={() => setActiveTab("deck")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "deck"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Presentation className="w-4 h-4" /> Pitch Deck
            </button>
            <button
              onClick={() => setActiveTab("quick")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "quick"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Mic className="w-4 h-4" /> Elevator Pitch
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "architecture"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" /> Architecture
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "qa"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Judge Q&A
            </button>
          </div>
        </div>

        {/* Preset Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-medium shrink-0">Sample Presets:</span>
          {presets.map((p) => (
            <button
              key={p.title}
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white shrink-0 transition"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Input & Output Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls Panel */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-5">
            {activeTab === "quick" ? (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Bullet Points / Core Ideas
                </label>
                <textarea
                  rows={8}
                  value={quickBullets}
                  onChange={(e) => setQuickBullets(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="- Point 1&#10;- Point 2&#10;- Point 3"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Project Name / Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. HackHub Platform"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Project Vision & Problem Statement
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Describe what your hackathon project does and how it solves real user problems..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Target Audience / Judges
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Senior Tech Judges, Investors, Students"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  Generate {activeTab === "deck" ? "Pitch Deck" : activeTab === "quick" ? "Elevator Pitch" : activeTab === "architecture" ? "Architecture" : "Judge Defense"}
                </>
              )}
            </button>
          </div>

          {/* AI Output Preview */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  AI Copilot Output
                </span>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-white transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Markdown
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="min-h-[280px] max-h-[460px] overflow-y-auto text-sm text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">
                {output ? (
                  output
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 font-sans">
                    <Sparkles className="w-10 h-10 mb-2 text-gray-600" />
                    <p>Click "Generate" to create your structured pitch assets.</p>
                  </div>
                )}
              </div>
            </div>

            {output && (
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition"
                >
                  <Copy className="w-4 h-4" /> Copy Entire Output
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
