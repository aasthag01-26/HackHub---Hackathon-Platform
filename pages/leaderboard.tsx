import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import {
  Trophy,
  Award,
  Medal,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Download,
  Flame,
  Shield,
  Star,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  PlusCircle,
  TrendingUp,
} from "lucide-react";

export interface ScoreBreakdown {
  innovation: number;
  technical: number;
  design: number;
  presentation: number;
  totalScore: number;
}

export interface LeaderboardEntry {
  _id?: string;
  hackathonName?: string;
  teamName: string;
  projectName: string;
  track: string;
  scores: ScoreBreakdown;
  rank: number;
  status: "winner" | "finalist" | "shortlisted" | "participating";
  medal: "gold" | "silver" | "bronze" | "none";
  judgeFeedback?: string;
  judgedBy?: string;
  isPublished?: boolean;
}

const TRACKS = [
  "All",
  "AI / ML",
  "Web3 & Blockchain",
  "Healthcare",
  "FinTech",
  "EdTech",
  "Cybersecurity",
  "Open Innovation",
];

const INITIAL_ENTRIES: LeaderboardEntry[] = [
  {
    _id: "demo-1",
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "NeuralWeavers",
    projectName: "BioPulse AI Diagnostics",
    track: "Healthcare",
    scores: {
      innovation: 24,
      technical: 25,
      design: 23,
      presentation: 24,
      totalScore: 96,
    },
    rank: 1,
    status: "winner",
    medal: "gold",
    judgeFeedback: "Exceptional clinical reasoning agent with seamless edge device latency.",
    judgedBy: "Dr. Alistair Vance (Lead Judge)",
    isPublished: true,
  },
  {
    _id: "demo-2",
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "QuantumBlock",
    projectName: "AetherZero ZK-Rollup",
    track: "Web3 & Blockchain",
    scores: {
      innovation: 23,
      technical: 24,
      design: 22,
      presentation: 23,
      totalScore: 92,
    },
    rank: 2,
    status: "winner",
    medal: "silver",
    judgeFeedback: "Rigorous cryptographic proofs and low-gas state verification.",
    judgedBy: "Elena Rostova (Blockchain Architect)",
    isPublished: true,
  },
  {
    _id: "demo-3",
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "SentientOps",
    projectName: "AutoSRE Autonomous Healing",
    track: "AI / ML",
    scores: {
      innovation: 22,
      technical: 23,
      design: 21,
      presentation: 23,
      totalScore: 89,
    },
    rank: 3,
    status: "winner",
    medal: "bronze",
    judgeFeedback: "Impressive self-healing microservice remediation and synthetic tracing.",
    judgedBy: "Marcus Thorne (DevOps Director)",
    isPublished: true,
  },
  {
    _id: "demo-4",
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "GreenLedger",
    projectName: "EcoTrace Carbon Offsets",
    track: "FinTech",
    scores: {
      innovation: 21,
      technical: 21,
      design: 22,
      presentation: 22,
      totalScore: 86,
    },
    rank: 4,
    status: "finalist",
    medal: "none",
    judgeFeedback: "High utility enterprise ESG auditor with automated tax reporting.",
    judgedBy: "Sophia Chen (Fintech Principal)",
    isPublished: true,
  },
  {
    _id: "demo-5",
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "HyperLearn",
    projectName: "Adaptive EduMatrix",
    track: "EdTech",
    scores: {
      innovation: 20,
      technical: 21,
      design: 21,
      presentation: 20,
      totalScore: 82,
    },
    rank: 5,
    status: "shortlisted",
    medal: "none",
    judgeFeedback: "Very engaging multimodal tutoring workflows for neurodiverse students.",
    judgedBy: "Dr. Alistair Vance (Lead Judge)",
    isPublished: true,
  },
  {
    _id: "demo-6",
    hackathonName: "HackHub Global Hackathon 2026",
    teamName: "VigilantShield",
    projectName: "ZeroTrust Mesh Sentinel",
    track: "Cybersecurity",
    scores: {
      innovation: 19,
      technical: 22,
      design: 18,
      presentation: 20,
      totalScore: 79,
    },
    rank: 6,
    status: "participating",
    medal: "none",
    judgeFeedback: "Solid eBPF firewall implementation with real-time anomaly alerts.",
    judgedBy: "Marcus Thorne (DevOps Director)",
    isPublished: true,
  },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(INITIAL_ENTRIES);
  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isJudgeMode, setIsJudgeMode] = useState<boolean>(false);
  const [judgePasscode, setJudgePasscode] = useState<string>("");
  const [showJudgeAuthModal, setShowJudgeAuthModal] = useState<boolean>(false);
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);

  // Score evaluation form state
  const [evalTeamName, setEvalTeamName] = useState("");
  const [evalProjectName, setEvalProjectName] = useState("");
  const [evalTrack, setEvalTrack] = useState("AI / ML");
  const [evalInnovation, setEvalInnovation] = useState<number>(20);
  const [evalTechnical, setEvalTechnical] = useState<number>(20);
  const [evalDesign, setEvalDesign] = useState<number>(20);
  const [evalPresentation, setEvalPresentation] = useState<number>(20);
  const [evalFeedback, setEvalFeedback] = useState("");
  const [evalJudgeName, setEvalJudgeName] = useState("Authorized Judge");
  const [authError, setAuthError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch leaderboard on mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          if (data.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
            setEntries(data.leaderboard);
            return;
          }
        }
      } catch (err) {
        // Fallback gracefully to local mock dataset
      }

      // Check localStorage for persisted custom entries
      const saved = localStorage.getItem("hackhub_leaderboard_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setEntries(parsed);
          }
        } catch {
          // ignore corrupted local storage
        }
      }
    };

    fetchLeaderboard();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Recalculate ranks and sort dynamically
  const rankedEntries = useMemo(() => {
    const cloned = [...entries];
    cloned.sort((a, b) => {
      const diff = (b.scores?.totalScore || 0) - (a.scores?.totalScore || 0);
      if (diff !== 0) return diff;
      return (b.scores?.technical || 0) - (a.scores?.technical || 0);
    });

    return cloned.map((item, idx) => {
      const rank = idx + 1;
      let medal: "gold" | "silver" | "bronze" | "none" = "none";
      let status: "winner" | "finalist" | "shortlisted" | "participating" = item.status;

      if (rank === 1) {
        medal = "gold";
        status = "winner";
      } else if (rank === 2) {
        medal = "silver";
        status = "winner";
      } else if (rank === 3) {
        medal = "bronze";
        status = "winner";
      } else if (rank <= 5) {
        status = "finalist";
      } else if (rank <= 10) {
        status = "shortlisted";
      }

      return {
        ...item,
        rank,
        medal,
        status,
      };
    });
  }, [entries]);

  // Filtered entries for search, track, and status
  const filteredEntries = useMemo(() => {
    return rankedEntries.filter((item) => {
      const matchTrack = selectedTrack === "All" || item.track.toLowerCase() === selectedTrack.toLowerCase();
      const matchStatus = selectedStatus === "all" || item.status.toLowerCase() === selectedStatus.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.teamName.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.track.toLowerCase().includes(q);
      return matchTrack && matchStatus && matchSearch;
    });
  }, [rankedEntries, selectedTrack, selectedStatus, searchQuery]);

  // Top 3 for Podium
  const topThree = useMemo(() => {
    return {
      first: rankedEntries[0] || null,
      second: rankedEntries[1] || null,
      third: rankedEntries[2] || null,
    };
  }, [rankedEntries]);

  // Unlock Judge Mode
  const handleVerifyJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (judgePasscode.trim() === "judge2026" || judgePasscode.trim() === "organizer2026") {
      setIsJudgeMode(true);
      setShowJudgeAuthModal(false);
      setJudgePasscode("");
      setAuthError("");
      showToast("Judge & Organizer evaluation mode enabled.");
    } else {
      setAuthError("Invalid access key. Use 'judge2026' or 'organizer2026' for official access.");
    }
  };

  // Open modal to evaluate existing or new team
  const openEvaluationModal = (target?: LeaderboardEntry) => {
    if (target) {
      setEvalTeamName(target.teamName);
      setEvalProjectName(target.projectName);
      setEvalTrack(target.track);
      setEvalInnovation(target.scores.innovation);
      setEvalTechnical(target.scores.technical);
      setEvalDesign(target.scores.design);
      setEvalPresentation(target.scores.presentation);
      setEvalFeedback(target.judgeFeedback || "");
      setEvalJudgeName(target.judgedBy || "Lead Evaluator");
    } else {
      setEvalTeamName("");
      setEvalProjectName("");
      setEvalTrack("AI / ML");
      setEvalInnovation(20);
      setEvalTechnical(20);
      setEvalDesign(20);
      setEvalPresentation(20);
      setEvalFeedback("");
      setEvalJudgeName("Lead Evaluator");
    }
    setShowScoreModal(true);
  };

  // Submit Score Evaluation
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!evalTeamName.trim() || !evalProjectName.trim()) {
      showToast("Team and Project names are required.");
      return;
    }

    const totalScore = Math.min(
      100,
      Math.max(
        0,
        Number(evalInnovation) +
          Number(evalTechnical) +
          Number(evalDesign) +
          Number(evalPresentation)
      )
    );

    const payload: LeaderboardEntry = {
      _id: "entry-" + Date.now(),
      teamName: evalTeamName.trim(),
      projectName: evalProjectName.trim(),
      track: evalTrack,
      scores: {
        innovation: Number(evalInnovation),
        technical: Number(evalTechnical),
        design: Number(evalDesign),
        presentation: Number(evalPresentation),
        totalScore,
      },
      rank: 0,
      status: "participating",
      medal: "none",
      judgeFeedback: evalFeedback.trim(),
      judgedBy: evalJudgeName.trim(),
      isPublished: true,
    };

    // Optimistic state update
    const updated = entries.filter(
      (item) => item.teamName.toLowerCase() !== payload.teamName.toLowerCase()
    );
    const newDataset = [payload, ...updated];
    setEntries(newDataset);
    localStorage.setItem("hackhub_leaderboard_data", JSON.stringify(newDataset));

    // Backend sync
    try {
      await fetch("http://localhost:5000/api/leaderboard/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-judge-key": "judge2026",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // offline fallback succeeded via localStorage
    }

    setShowScoreModal(false);
    showToast(`Scores for ${payload.teamName} updated successfully!`);
  };

  // Export Leaderboard to CSV
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Team Name",
      "Project Name",
      "Track",
      "Innovation (25)",
      "Technical (25)",
      "Design (25)",
      "Presentation (25)",
      "Total Score (100)",
      "Status",
      "Judge Feedback",
      "Judged By",
    ];

    const rows = rankedEntries.map((item) => [
      item.rank,
      `"${item.teamName.replace(/"/g, '""')}"`,
      `"${item.projectName.replace(/"/g, '""')}"`,
      `"${item.track.replace(/"/g, '""')}"`,
      item.scores.innovation,
      item.scores.technical,
      item.scores.design,
      item.scores.presentation,
      item.scores.totalScore,
      item.status,
      `"${(item.judgeFeedback || "").replace(/"/g, '""')}"`,
      `"${(item.judgedBy || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "HackHub_Leaderboard_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Official leaderboard CSV exported successfully!");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-indigo-400/30 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Official Hackathon Rankings
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Hackathon Leaderboard
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Live evaluation metrics, category breakdowns, and certified finalist podium standings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold transition"
              title="Download CSV export"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Export CSV
            </button>

            {isJudgeMode ? (
              <button
                onClick={() => openEvaluationModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Score New Team
              </button>
            ) : (
              <button
                onClick={() => setShowJudgeAuthModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-indigo-300 text-sm font-semibold transition"
              >
                <Shield className="w-4 h-4 text-indigo-400" />
                Judge Access
              </button>
            )}
          </div>
        </div>

        {/* Podium Display (Top 3) */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-5xl mx-auto pt-6">
            {/* 2nd Place Podium */}
            {topThree.second && (
              <div
                onClick={() => setSelectedEntry(topThree.second)}
                className="order-2 md:order-1 cursor-pointer bg-gradient-to-b from-slate-800/90 to-slate-850/90 border border-slate-700/80 rounded-2xl p-6 text-center hover:border-slate-500 transition-all transform hover:-translate-y-1 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400"></div>
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-700/80 border-2 border-slate-300 flex items-center justify-center text-slate-200 mb-3 shadow-inner">
                  <Medal className="w-7 h-7 text-slate-300" />
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  2nd Place
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                  {topThree.second.teamName}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-1 mb-3">
                  {topThree.second.projectName}
                </p>
                <div className="inline-block px-2.5 py-1 rounded-md bg-slate-700/50 text-xs text-indigo-300 font-medium mb-4">
                  {topThree.second.track}
                </div>
                <div className="text-3xl font-black text-slate-100">
                  {topThree.second.scores.totalScore}
                  <span className="text-sm font-normal text-slate-400"> /100</span>
                </div>
              </div>
            )}

            {/* 1st Place Podium (Elevated) */}
            {topThree.first && (
              <div
                onClick={() => setSelectedEntry(topThree.first)}
                className="order-1 md:order-2 cursor-pointer bg-gradient-to-b from-amber-950/40 via-slate-800 to-slate-850 border-2 border-amber-500/50 rounded-2xl p-7 text-center hover:border-amber-400 transition-all transform hover:-translate-y-2 shadow-2xl shadow-amber-500/10 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-300"></div>
                <div className="w-18 h-18 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-amber-500/20">
                  <Trophy className="w-9 h-9 text-amber-400 animate-pulse" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest mb-2 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Grand Champion
                </span>
                <h3 className="text-2xl font-extrabold text-white group-hover:text-amber-300 transition">
                  {topThree.first.teamName}
                </h3>
                <p className="text-sm text-amber-200/80 font-medium line-clamp-1 mb-3">
                  {topThree.first.projectName}
                </p>
                <div className="inline-block px-3 py-1 rounded-md bg-amber-500/10 text-xs text-amber-300 font-semibold mb-4 border border-amber-500/20">
                  {topThree.first.track}
                </div>
                <div className="text-4xl font-black text-amber-300">
                  {topThree.first.scores.totalScore}
                  <span className="text-base font-normal text-amber-400/80"> /100</span>
                </div>
              </div>
            )}

            {/* 3rd Place Podium */}
            {topThree.third && (
              <div
                onClick={() => setSelectedEntry(topThree.third)}
                className="order-3 cursor-pointer bg-gradient-to-b from-slate-800/90 to-slate-850/90 border border-slate-700/80 rounded-2xl p-6 text-center hover:border-amber-700/80 transition-all transform hover:-translate-y-1 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-700"></div>
                <div className="w-14 h-14 mx-auto rounded-full bg-amber-900/40 border-2 border-amber-600 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                  <Medal className="w-7 h-7 text-amber-500" />
                </div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-amber-900/40 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  3rd Place
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                  {topThree.third.teamName}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-1 mb-3">
                  {topThree.third.projectName}
                </p>
                <div className="inline-block px-2.5 py-1 rounded-md bg-slate-700/50 text-xs text-indigo-300 font-medium mb-4">
                  {topThree.third.track}
                </div>
                <div className="text-3xl font-black text-slate-100">
                  {topThree.third.scores.totalScore}
                  <span className="text-sm font-normal text-slate-400"> /100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 md:p-6 mb-8 backdrop-blur">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, project, or track..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 overflow-x-auto">
              {[
                { id: "all", label: "All Teams" },
                { id: "winner", label: "🏆 Winners" },
                { id: "finalist", label: "🌟 Finalists" },
                { id: "shortlisted", label: "🎯 Shortlisted" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedStatus === tab.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Track Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Track:
            </span>
            {TRACKS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTrack(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedTrack === t
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                    : "bg-slate-900/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Card List */}
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/90 border-b border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Team & Project</th>
                  <th className="py-4 px-6">Track</th>
                  <th className="py-4 px-6">Score Breakdown</th>
                  <th className="py-4 px-6 text-right">Total Score</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="max-w-sm mx-auto">
                        <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-slate-300">No teams match your criteria</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Try adjusting your search query, status filters, or selected track.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry.teamName}
                      className="hover:bg-slate-800/50 transition cursor-pointer"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {entry.rank === 1 && (
                            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-black text-sm">
                              1
                            </span>
                          )}
                          {entry.rank === 2 && (
                            <span className="w-8 h-8 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-black text-sm">
                              2
                            </span>
                          )}
                          {entry.rank === 3 && (
                            <span className="w-8 h-8 rounded-full bg-amber-800/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-black text-sm">
                              3
                            </span>
                          )}
                          {entry.rank > 3 && (
                            <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center font-bold text-xs">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team & Project */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-white hover:text-indigo-300 transition">
                          {entry.teamName}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {entry.projectName}
                        </div>
                      </td>

                      {/* Track */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 text-xs font-medium border border-slate-700">
                          {entry.track}
                        </span>
                      </td>

                      {/* Score Breakdown (Mini bars) */}
                      <td className="py-4 px-6">
                        <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-400 w-48">
                          <div>
                            <span className="block text-[10px] text-slate-500">Inno</span>
                            <span className="font-medium text-slate-200">{entry.scores.innovation}/25</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500">Tech</span>
                            <span className="font-medium text-slate-200">{entry.scores.technical}/25</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500">Des</span>
                            <span className="font-medium text-slate-200">{entry.scores.design}/25</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500">Pitch</span>
                            <span className="font-medium text-slate-200">{entry.scores.presentation}/25</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span className="text-lg font-black text-white">
                          {entry.scores.totalScore}
                        </span>
                        <span className="text-xs text-slate-400"> /100</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {entry.status === "winner" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                            🏆 Winner
                          </span>
                        )}
                        {entry.status === "finalist" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                            🌟 Finalist
                          </span>
                        )}
                        {entry.status === "shortlisted" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                            🎯 Shortlisted
                          </span>
                        )}
                        {entry.status === "participating" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700">
                            🚀 Participating
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {isJudgeMode ? (
                          <button
                            onClick={() => openEvaluationModal(entry)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition"
                          >
                            Re-score
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedEntry(entry)}
                            className="text-slate-400 hover:text-indigo-300 transition text-xs font-semibold inline-flex items-center gap-1"
                          >
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Judge Access Modal */}
        {showJudgeAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button
                onClick={() => setShowJudgeAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Judge & Organizer Access</h3>
              <p className="text-sm text-slate-400 mt-1 mb-5">
                Authorized judges can evaluate submitted hackathon teams, update scores, and record structured feedback.
              </p>

              <form onSubmit={handleVerifyJudge}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Access Passcode
                  </label>
                  <input
                    type="password"
                    value={judgePasscode}
                    onChange={(e) => setJudgePasscode(e.target.value)}
                    placeholder="Enter judge key (demo: judge2026)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  {authError && <p className="text-xs text-rose-400 mt-2">{authError}</p>}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowJudgeAuthModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-md"
                  >
                    Unlock Panel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Score Evaluation Modal */}
        {showScoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8">
              <button
                onClick={() => setShowScoreModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Judge Score Evaluation</h3>
                  <p className="text-xs text-slate-400">Score criteria from 0 to 25 points each (100 total).</p>
                </div>
              </div>

              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={evalTeamName}
                      onChange={(e) => setEvalTeamName(e.target.value)}
                      placeholder="e.g. QuantumBlock"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={evalProjectName}
                      onChange={(e) => setEvalProjectName(e.target.value)}
                      placeholder="e.g. AetherZero ZK"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hackathon Track
                  </label>
                  <select
                    value={evalTrack}
                    onChange={(e) => setEvalTrack(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  >
                    {TRACKS.filter((t) => t !== "All").map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Criteria Sliders */}
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Innovation & Uniqueness</span>
                      <span className="text-indigo-400">{evalInnovation} / 25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalInnovation}
                      onChange={(e) => setEvalInnovation(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Technical Execution & Complexity</span>
                      <span className="text-indigo-400">{evalTechnical} / 25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalTechnical}
                      onChange={(e) => setEvalTechnical(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Design & User Experience (UX)</span>
                      <span className="text-indigo-400">{evalDesign} / 25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalDesign}
                      onChange={(e) => setEvalDesign(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Pitch & Feasibility</span>
                      <span className="text-indigo-400">{evalPresentation} / 25</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={evalPresentation}
                      onChange={(e) => setEvalPresentation(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Calculated Total Score:</span>
                    <span className="text-indigo-300 text-lg">
                      {Number(evalInnovation) +
                        Number(evalTechnical) +
                        Number(evalDesign) +
                        Number(evalPresentation)}{" "}
                      / 100
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Constructive Judge Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    placeholder="Key strengths, architectural highlights, and guidance for next milestones..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Evaluator Identity / Judge Name
                  </label>
                  <input
                    type="text"
                    value={evalJudgeName}
                    onChange={(e) => setEvalJudgeName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowScoreModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-700 shadow-md"
                  >
                    Save & Publish Score
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Team Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-xl">
                  #{selectedEntry.rank}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedEntry.teamName}</h3>
                  <p className="text-sm text-indigo-300">{selectedEntry.projectName}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3 mb-4">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Track:</span>
                  <span className="font-semibold text-slate-200">{selectedEntry.track}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                    {selectedEntry.status}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <h5 className="text-xs font-bold text-slate-300 uppercase mb-2">Criteria Breakdown</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-800/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Innovation</span>
                      <span className="text-white font-bold">{selectedEntry.scores.innovation} / 25</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Technical Execution</span>
                      <span className="text-white font-bold">{selectedEntry.scores.technical} / 25</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">UI / UX Design</span>
                      <span className="text-white font-bold">{selectedEntry.scores.design} / 25</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-lg">
                      <span className="text-slate-400 block text-[11px]">Presentation & Pitch</span>
                      <span className="text-white font-bold">{selectedEntry.scores.presentation} / 25</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm font-bold">
                  <span className="text-white">Overall Evaluated Score:</span>
                  <span className="text-indigo-400 text-xl font-black">
                    {selectedEntry.scores.totalScore} / 100
                  </span>
                </div>
              </div>

              {selectedEntry.judgeFeedback && (
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3.5 mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-1">
                    <Info className="w-3.5 h-3.5" /> Judge Feedback
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{selectedEntry.judgeFeedback}"
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 text-right">
                    — {selectedEntry.judgedBy || "Lead Evaluator"}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
