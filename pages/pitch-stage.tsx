import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Presentation,
  Award,
  FileText,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function PitchStagePage() {
  const TOTAL_SECONDS = 180; // 3 minutes
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [speakerNotes, setSpeakerNotes] = useState(
    "1. Hook (0:00 - 0:30): Highlight the core user friction and lost productivity.\n2. Solution (0:30 - 1:15): Demo the live HackHub prototype and 1-click execution.\n3. Architecture (1:15 - 2:00): Explain real-time WebSocket sync and zero-conflict models.\n4. Impact & Close (2:00 - 2:45): 300% velocity gains, future vision, and thank judges."
  );

  // Judge scoring state
  const [scores, setScores] = useState({
    innovation: 22,
    technical: 23,
    presentation: 24,
    impact: 21,
  });
  const [feedbackNote, setFeedbackNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const totalScore =
    scores.innovation + scores.technical + scores.presentation + scores.impact;

  const handleScoreChange = (criterion: keyof typeof scores, value: number) => {
    setScores((prev) => ({
      ...prev,
      [criterion]: Math.max(0, Math.min(25, value)),
    }));
  };

  const handleJudgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const timerColor =
    secondsLeft > 60
      ? "text-emerald-400"
      : secondsLeft > 20
      ? "text-amber-400"
      : "text-rose-500 animate-pulse";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Mic className="w-8 h-8 text-cyan-400" />
              Virtual Pitch Stage & Presentation Studio
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Live presentation room with strict 3-minute pitch countdown timer, speaker cues, and real-time judge scoring.
            </p>
          </div>

          {/* Quick Timer Pill */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md">
            <Clock className={`w-5 h-5 ${timerColor}`} />
            <span className={`text-2xl font-mono font-bold ${timerColor}`}>
              {formatTime(secondsLeft)}
            </span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
              <button
                onClick={toggleTimer}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                title={isRunning ? "Pause Timer" : "Start Timer"}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition"
                title="Reset to 3:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Studio Grid: Stage Display & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stage Screen / Deck Frame */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-indigo-950 via-[#0f172a] to-purple-950 border border-white/15 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 text-center">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                  Live Stage Feed
                </span>
              </div>

              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mx-auto flex items-center justify-center">
                  <Presentation className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Team Zenith: AI-Powered Hackathon Suite
                </h3>
                <p className="text-sm text-gray-300">
                  Slide 1 of 5: Eliminating Team Coordination Latency in 48-Hour Sprints
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
                    Share Screen Ready
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Audio HD Active
                  </span>
                </div>
              </div>
            </div>

            {/* Speaker Cues & Notes */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Presenter Teleprompter & Talking Points
                </h3>
                <span className="text-xs text-gray-400">Private to speaker</span>
              </div>
              <textarea
                rows={4}
                value={speakerNotes}
                onChange={(e) => setSpeakerNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Right Panel: Live Judge Evaluation Rubric */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Live Judge Scoring
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Official Rubric (100 pts)</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400">Total Score</span>
                  <p className="text-xl font-extrabold text-amber-400">{totalScore}/100</p>
                </div>
              </div>

              <form onSubmit={handleJudgeSubmit} className="space-y-4">
                {/* Innovation */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Innovation & Originality</span>
                    <span className="font-bold text-white">{scores.innovation}/25</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.innovation}
                    onChange={(e) => handleScoreChange("innovation", parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Technical Execution */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Technical Architecture & Quality</span>
                    <span className="font-bold text-white">{scores.technical}/25</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.technical}
                    onChange={(e) => handleScoreChange("technical", parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Presentation & Pitch */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Pitch Delivery & Timing</span>
                    <span className="font-bold text-white">{scores.presentation}/25</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.presentation}
                    onChange={(e) => handleScoreChange("presentation", parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                {/* Real-World Impact */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Market / Problem Impact</span>
                    <span className="font-bold text-white">{scores.impact}/25</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={scores.impact}
                    onChange={(e) => handleScoreChange("impact", parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Judge Qualitative Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Commend strengths and note actionable improvements for round 2..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Score Submitted!
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" /> Submit Official Evaluation
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-gray-400 text-center">
              Scores are recorded with cryptographic timestamps on the official leaderboard.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
