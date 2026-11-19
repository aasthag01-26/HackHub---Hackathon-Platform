import { useState } from "react";
import Layout from "../components/Layout";
import Head from "next/head";
import { Sparkles, Copy, Check, Download, RefreshCw, Wand2, Lightbulb } from "lucide-react";

const PRESET_IDEAS = [
  {
    label: "🤖 AI Productivity Hub",
    text: `- Centralized dashboard for hackathon project management
- Real-time team collaboration with MongoDB synchronization
- AI-driven pitch deck and elevator summary generation
- Cloud file management with GridFS isolation`,
  },
  {
    label: "💳 Web3 Micro-Payments",
    text: `- Instant micro-transactions for content creators and freelance developers
- Zero-gas fee rollups on Layer 2 networks
- Automated milestone verification for open-source bounties
- Transparent proof-of-contribution analytics`,
  },
  {
    label: "🏥 HealthTech Virtual Clinic",
    text: `- Remote patient triage with automated vitals telemetry
- HIPAA-compliant asynchronous doctor consultation
- Smart medication reminders with prescription renewal alerts
- Decentralized medical record vault with patient-owned keys`,
  },
];

export default function Pitch() {
  const [pitchInput, setPitchInput] = useState("");
  const [pitchOutput, setPitchOutput] = useState(
    "Your generated pitch will appear here..."
  );
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantOutput, setAssistantOutput] = useState(
    "Click the button below for improvement ideas!"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImprovements, setIsGeneratingImprovements] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleCopy = async () => {
    if (!pitchOutput || pitchOutput.startsWith("Your generated pitch") || pitchOutput.startsWith("⚠")) {
      return;
    }
    try {
      await navigator.clipboard.writeText(pitchOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy pitch:", err);
    }
  };

  const handleDownload = () => {
    if (!pitchOutput || pitchOutput.startsWith("Your generated pitch") || pitchOutput.startsWith("⚠")) {
      return;
    }
    const element = document.createElement("a");
    const file = new Blob([pitchOutput], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "hackathon-pitch.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generatePitch = async () => {
    if (!pitchInput.trim()) {
      setPitchOutput("⚠ Please enter some bullet points or select a template first.");
      return;
    }

    setIsGenerating(true);
    setPitchOutput("Generating your pitch using Gemini AI...");

    try {
      const res = await fetch(`${API_BASE}/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: pitchInput }),
      });

      const data = await res.json();

      if (data.pitch) {
        setPitchOutput(data.pitch);
        setShowAssistant(true);
      } else {
        setPitchOutput("❌ Failed to generate pitch. Please check your backend connection.");
      }
    } catch (err) {
      console.error(err);
      setPitchOutput("⚠ Error generating pitch. Please verify backend server is running on port 5000.");
    }

    setIsGenerating(false);
  };

  const getPitchImprovements = async () => {
    if (!pitchOutput || pitchOutput.startsWith("⚠") || pitchOutput.startsWith("Your generated pitch")) return;

    setIsGeneratingImprovements(true);
    setAssistantOutput("Analyzing your pitch for improvements...");

    try {
      const res = await fetch(`${API_BASE}/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: `Suggest 3 high-impact improvements for this hackathon startup pitch:\n\n${pitchOutput}`,
        }),
      });

      const data = await res.json();

      if (data.pitch) {
        setAssistantOutput(data.pitch);
      } else {
        setAssistantOutput("❌ Could not analyze pitch. Try again.");
      }
    } catch (err) {
      console.error(err);
      setAssistantOutput("⚠ Error analyzing improvements.");
    }

    setIsGeneratingImprovements(false);
  };

  const isPitchReady =
    Boolean(pitchOutput) &&
    !pitchOutput.startsWith("Your generated pitch") &&
    !pitchOutput.startsWith("⚠") &&
    !pitchOutput.startsWith("Generating");

  return (
    <Layout>
      <Head>
        <title>HackHub - AI Pitch Generator</title>
      </Head>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display text-gradient-primary text-glow flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-cyan-400" />
            AI Pitch Generator
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Turn your raw project ideas and bullet points into a compelling 60-second elevator pitch tailored for hackathon judges and demo days.
          </p>
        </div>
      </div>

      {/* Preset Idea Chips */}
      <div className="mb-6">
        <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5 font-medium">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Quick-start templates:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_IDEAS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPitchInput(preset.text)}
              className="text-xs px-3 py-1.5 rounded-lg glass border border-zinc-700/60 hover:border-cyan-500/50 hover:text-cyan-300 text-zinc-300 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Input */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-heading font-semibold text-white">
                Project Bullet Points
              </h3>
              <span className="text-xs text-zinc-500">
                {pitchInput.length} chars
              </span>
            </div>
            <textarea
              value={pitchInput}
              onChange={(e) => setPitchInput(e.target.value)}
              className="input-enhanced w-full h-72 text-xs sm:text-sm font-mono placeholder-zinc-500 resize-none p-3.5 rounded-xl border border-zinc-700/80 bg-zinc-900/60 focus:border-cyan-500 focus:outline-none"
              placeholder={`- AI-powered collaboration hub\n- Real-time task tracking with Kanban board\n- Automated elevator pitch generation\n- Centralized file and presentation storage`}
            ></textarea>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={generatePitch}
              disabled={isGenerating || !pitchInput.trim()}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                isGenerating || !pitchInput.trim()
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                  : "btn-primary"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  Crafting Pitch with Gemini AI...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Pitch
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-heading font-semibold text-white">
                Generated Pitch Summary
              </h3>
              {isPitchReady && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1.5"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1.5"
                    title="Download pitch as text file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="w-full h-72 glass rounded-xl border border-dashed border-zinc-700/80 p-4 text-xs sm:text-sm font-body text-zinc-300 overflow-y-auto whitespace-pre-line leading-relaxed">
              {pitchOutput}
            </div>
          </div>

          {showAssistant && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <h4 className="text-xs sm:text-sm font-heading font-semibold text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Mentor Suggestions
              </h4>
              <p className="text-xs text-zinc-300 glass p-3 rounded-xl border border-zinc-700/80 whitespace-pre-line max-h-36 overflow-y-auto">
                {assistantOutput}
              </p>
              <button
                onClick={getPitchImprovements}
                disabled={isGeneratingImprovements}
                className={`w-full mt-2.5 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  isGeneratingImprovements
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "btn-secondary hover:border-purple-500/60"
                }`}
              >
                {isGeneratingImprovements ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Pitch...
                  </>
                ) : (
                  <>✨ Suggest Pitch Polish</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
