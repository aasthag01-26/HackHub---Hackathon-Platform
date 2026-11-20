import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import {
  Trophy,
  Award,
  Medal,
  Crown,
  Search,
  Filter,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock,
  Sparkles,
  ChevronUp,
  Flame,
  ShieldAlert,
  Edit3,
  X,
  Star,
  Layers,
  ArrowLeft,
} from "lucide-react";

interface CriteriaScores {
  innovation: number;
  technical: number;
  presentation: number;
  impact: number;
}

interface LeaderboardEntry {
  _id: string;
  hackathonName?: string;
  teamName: string;
  projectName: string;
  category: string;
  scores: CriteriaScores;
  totalScore: number;
  rank: number;
  status: "Winner" | "Finalist" | "Shortlisted" | "Participant";
  award?: string;
  judgeNotes?: string;
  evaluatedBy?: string;
}

const CATEGORIES = [
  "All",
  "Open Innovation",
  "Web & Cloud",
  "AI / ML",
  "FinTech",
  "HealthTech",
  "Cybersecurity",
  "EdTech",
];

const STATUSES = ["All", "Winner", "Finalist", "Shortlisted"];

export default function Leaderboard() {
  const router = useRouter();
  const eventParam = router.query.event as string | undefined;
  const { currentUser } = useAppContext();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Judge Mode State
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [judgePasskey, setJudgePasskey] = useState("");
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");
  const [editingEntry, setEditingEntry] = useState<LeaderboardEntry | null>(null);

  // Edit Score Form State
  const [editInnovation, setEditInnovation] = useState<number>(20);
  const [editTechnical, setEditTechnical] = useState<number>(20);
  const [editPresentation, setEditPresentation] = useState<number>(20);
  const [editImpact, setEditImpact] = useState<number>(20);
  const [editStatus, setEditStatus] = useState<"Winner" | "Finalist" | "Shortlisted" | "Participant">("Participant");
  const [editAward, setEditAward] = useState("");
  const [editJudgeNotes, setEditJudgeNotes] = useState("");
  const [isSavingScore, setIsSavingScore] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let url = "/api/leaderboard";
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } else {
        loadFallbackEntries();
      }
    } catch (err) {
      console.error("Failed to load leaderboard", err);
      loadFallbackEntries();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackEntries = () => {
    const demoEntries: LeaderboardEntry[] = [
      {
        _id: "lead-1",
        hackathonName: "HackHub Global Hackathon 2026",
        teamName: "CodeCrafters",
        projectName: "HackHub Collaboration Platform",
        category: "Web & Cloud",
        scores: { innovation: 24.5, technical: 24.8, presentation: 24.0, impact: 24.2 },
        totalScore: 97.5,
        rank: 1,
        status: "Winner",
        award: "1st Place (Grand Champion)",
        judgeNotes: "Exceptional architecture, real-time collaboration, and flawless user experience.",
        evaluatedBy: "Senior Technical Jury",
      },
      {
        _id: "lead-2",
        hackathonName: "HackHub Global Hackathon 2026",
        teamName: "NeuralNexus",
        projectName: "AlphaGenius Medical Assistant",
        category: "AI / ML",
        scores: { innovation: 24.0, technical: 23.5, presentation: 23.8, impact: 23.9 },
        totalScore: 95.2,
        rank: 2,
        status: "Winner",
        award: "2nd Place (Runner-up)",
        judgeNotes: "Groundbreaking application of biological sequence analysis with intuitive visualizations.",
        evaluatedBy: "AI Specialist Panel",
      },
      {
        _id: "lead-3",
        hackathonName: "HackHub Global Hackathon 2026",
        teamName: "ChainShield",
        projectName: "VeriChain Smart Credentialing",
        category: "FinTech",
        scores: { innovation: 23.0, technical: 23.5, presentation: 22.5, impact: 23.0 },
        totalScore: 92.0,
        rank: 3,
        status: "Winner",
        award: "3rd Place Podium",
        judgeNotes: "High utility decentralized identity protocol with strong security guarantees.",
        evaluatedBy: "Web3 Advisory Board",
      },
      {
        _id: "lead-4",
        hackathonName: "HackHub Global Hackathon 2026",
        teamName: "EcoMatrix",
        projectName: "GreenCompute Grid",
        category: "Open Innovation",
        scores: { innovation: 22.0, technical: 22.5, presentation: 21.5, impact: 23.0 },
        totalScore: 89.0,
        rank: 4,
        status: "Finalist",
        award: "Best Sustainability Hack",
        judgeNotes: "Impressive telemetry tracking carbon footprint of cloud workloads.",
        evaluatedBy: "Judging Panel",
      },
      {
        _id: "lead-5",
        hackathonName: "HackHub Global Hackathon 2026",
        teamName: "QuantumPulse",
        projectName: "SecurePulse Cryptographic Relay",
        category: "Cybersecurity",
        scores: { innovation: 21.5, technical: 22.0, presentation: 21.0, impact: 22.0 },
        totalScore: 86.5,
        rank: 5,
        status: "Shortlisted",
        award: "None",
        judgeNotes: "Promising zero-knowledge data routing mechanisms.",
        evaluatedBy: "Security Jury",
      },
    ];
    setEntries(demoEntries);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory, selectedStatus]);

  const handleUnlockJudgeMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (judgePasskey === "hackhub-judge-2026" || judgePasskey === "admin") {
      setIsJudgeMode(true);
      setShowPasskeyModal(false);
      setPasskeyError("");
    } else {
      setPasskeyError("Invalid judge passkey. Please verify with hackathon organizers.");
    }
  };

  const handleOpenScoreModal = (entry: LeaderboardEntry) => {
    setEditingEntry(entry);
    setEditInnovation(entry.scores.innovation);
    setEditTechnical(entry.scores.technical);
    setEditPresentation(entry.scores.presentation);
    setEditImpact(entry.scores.impact);
    setEditStatus(entry.status);
    setEditAward(entry.award || "");
    setEditJudgeNotes(entry.judgeNotes || "");
  };

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      setIsSavingScore(true);
      const updatedTotal = Number(
        (editInnovation + editTechnical + editPresentation + editImpact).toFixed(1)
      );

      const payload = {
        judgePasskey: "hackhub-judge-2026",
        scores: {
          innovation: editInnovation,
          technical: editTechnical,
          presentation: editPresentation,
          impact: editImpact,
        },
        status: editStatus,
        award: editAward,
        judgeNotes: editJudgeNotes,
      };

      const res = await fetch(`/api/leaderboard/${editingEntry._id}/score`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-judge-key": "hackhub-judge-2026",
        },
        body: JSON.stringify(payload),
      });

      // Update local state and dynamically re-rank
      setEntries((prev) => {
        const next = prev.map((item) =>
          item._id === editingEntry._id
            ? {
                ...item,
                scores: payload.scores,
                totalScore: updatedTotal,
                status: editStatus,
                award: editAward,
                judgeNotes: editJudgeNotes,
              }
            : item
        );
        next.sort((a, b) => b.totalScore - a.totalScore);
        return next.map((item, idx) => ({ ...item, rank: idx + 1 }));
      });

      setEditingEntry(null);
    } catch (err) {
      console.error("Failed to save evaluation score", err);
    } finally {
      setIsSavingScore(false);
    }
  };

  // Top 3 for Podium
  const topThree = useMemo(() => {
    return entries.slice(0, 3);
  }, [entries]);

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-indigo-950/40 border border-amber-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Live Rankings & Evaluations
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Hackathon <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-indigo-300">Leaderboard</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Official real-time rankings evaluated across technical merit, innovation, user impact, and final demo pitch.
              </p>
            </div>

            {/* Judge Mode Switcher */}
            <div className="flex items-center gap-3">
              {isJudgeMode ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <Unlock className="w-4 h-4" />
                  Judge Mode Active
                </div>
              ) : (
                <button
                  onClick={() => setShowPasskeyModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition-all shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Organizer / Judge Access
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Event Context Banner (when navigated from a specific hackathon) */}
        {eventParam && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Event-Specific Leaderboard</span>
                <h3 className="text-base font-bold text-white">{eventParam}</h3>
                <p className="text-xs text-gray-400">Viewing participant rankings and judge evaluations for this hackathon.</p>
              </div>
            </div>
            <Link
              href="/hackathons"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition shrink-0 border border-gray-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Hackathons
            </Link>
          </div>
        )}

        {/* Top 3 Podium Cards */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            {/* 2nd Place (Silver) */}
            <div className="order-2 md:order-1 flex flex-col items-center p-6 rounded-3xl bg-[#1e293b]/70 border border-slate-400/30 shadow-xl relative backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-gray-900 font-extrabold text-xl shadow-lg mb-4">
                <Medal className="w-7 h-7 text-white" />
              </div>
              <span className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-1">
                2nd Place Runner-Up
              </span>
              <h3 className="text-xl font-bold text-white text-center line-clamp-1">
                {topThree[1].teamName}
              </h3>
              <p className="text-xs text-gray-400 text-center line-clamp-1 mb-4">
                {topThree[1].projectName}
              </p>
              <div className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Score</span>
                <span className="text-white font-black text-lg">{topThree[1].totalScore} <span className="text-xs text-gray-400">/ 100</span></span>
              </div>
            </div>

            {/* 1st Place (Gold / Grand Champion) */}
            <div className="order-1 md:order-2 flex flex-col items-center p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-[#1e293b]/80 to-[#1e293b] border-2 border-amber-400/50 shadow-2xl relative backdrop-blur-md -translate-y-2">
              <div className="absolute -top-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                <Crown className="w-4 h-4 fill-gray-950" /> Grand Champion
              </div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 flex items-center justify-center text-gray-950 font-black text-3xl shadow-xl shadow-amber-500/20 mb-4 mt-2">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <span className="text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
                1st Place
              </span>
              <h3 className="text-2xl font-black text-white text-center line-clamp-1">
                {topThree[0].teamName}
              </h3>
              <p className="text-xs text-gray-300 text-center line-clamp-1 mb-4">
                {topThree[0].projectName}
              </p>
              <div className="w-full py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <span className="text-amber-200 font-semibold">Grand Score</span>
                <span className="text-amber-300 font-black text-2xl">{topThree[0].totalScore} <span className="text-xs text-amber-200/70">/ 100</span></span>
              </div>
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="order-3 flex flex-col items-center p-6 rounded-3xl bg-[#1e293b]/70 border border-amber-700/30 shadow-xl relative backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-extrabold text-xl shadow-lg mb-4">
                <Award className="w-7 h-7 text-amber-200" />
              </div>
              <span className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                3rd Place
              </span>
              <h3 className="text-xl font-bold text-white text-center line-clamp-1">
                {topThree[2].teamName}
              </h3>
              <p className="text-xs text-gray-400 text-center line-clamp-1 mb-4">
                {topThree[2].projectName}
              </p>
              <div className="w-full py-2.5 px-4 rounded-xl bg-amber-950/40 border border-amber-900/60 flex items-center justify-between text-xs">
                <span className="text-gray-400">Total Score</span>
                <span className="text-white font-black text-lg">{topThree[2].totalScore} <span className="text-xs text-gray-400">/ 100</span></span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            <span className="text-xs text-gray-400 flex items-center gap-1 pr-2">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 font-semibold"
                    : "bg-gray-800/60 text-gray-400 hover:text-gray-200 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/80 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Rankings Table */}
        <div className="overflow-hidden rounded-3xl bg-[#1e293b]/70 border border-gray-800 shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/60 text-xs uppercase text-gray-400 border-b border-gray-800 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Rank</th>
                  <th scope="col" className="px-6 py-4">Team & Project</th>
                  <th scope="col" className="px-6 py-4">Track</th>
                  <th scope="col" className="px-6 py-4 text-center">Innovation (25)</th>
                  <th scope="col" className="px-6 py-4 text-center">Technical (25)</th>
                  <th scope="col" className="px-6 py-4 text-center">Pitch (25)</th>
                  <th scope="col" className="px-6 py-4 text-center">Impact (25)</th>
                  <th scope="col" className="px-6 py-4 text-right">Total Score</th>
                  {isJudgeMode && <th scope="col" className="px-6 py-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-indigo-950/20 transition-colors duration-150"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.rank === 1 ? (
                        <span className="w-8 h-8 rounded-xl bg-amber-400 text-gray-950 font-black inline-flex items-center justify-center text-sm shadow-md">
                          1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="w-8 h-8 rounded-xl bg-slate-300 text-gray-950 font-black inline-flex items-center justify-center text-sm shadow-md">
                          2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="w-8 h-8 rounded-xl bg-amber-700 text-white font-black inline-flex items-center justify-center text-sm shadow-md">
                          3
                        </span>
                      ) : (
                        <span className="text-gray-400 font-bold text-sm pl-2">
                          #{entry.rank}
                        </span>
                      )}
                    </td>

                    {/* Team & Project */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-2">
                          {entry.teamName}
                          {entry.status === "Winner" && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {entry.award || "Winner"}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs">{entry.projectName}</div>
                      </div>
                    </td>

                    {/* Category Track */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-cyan-300 border border-gray-700">
                        {entry.category}
                      </span>
                    </td>

                    {/* Innovation */}
                    <td className="px-6 py-4 text-center whitespace-nowrap text-xs font-semibold text-gray-300">
                      {entry.scores?.innovation ?? 0}
                    </td>

                    {/* Technical */}
                    <td className="px-6 py-4 text-center whitespace-nowrap text-xs font-semibold text-gray-300">
                      {entry.scores?.technical ?? 0}
                    </td>

                    {/* Presentation */}
                    <td className="px-6 py-4 text-center whitespace-nowrap text-xs font-semibold text-gray-300">
                      {entry.scores?.presentation ?? 0}
                    </td>

                    {/* Impact */}
                    <td className="px-6 py-4 text-center whitespace-nowrap text-xs font-semibold text-gray-300">
                      {entry.scores?.impact ?? 0}
                    </td>

                    {/* Total Score */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="text-lg font-black text-amber-300">
                        {entry.totalScore}
                      </span>
                      <span className="text-xs text-gray-500"> /100</span>
                    </td>

                    {/* Judge Action Button */}
                    {isJudgeMode && (
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenScoreModal(entry)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Evaluate
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Judge Passkey Modal */}
        {showPasskeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-[#0f172a] border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <button
                onClick={() => setShowPasskeyModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  Judge Authentication
                </h3>
                <p className="text-gray-400 text-xs">
                  Enter the evaluation passkey provided to authorized judges and organizers.
                </p>
              </div>

              {passkeyError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {passkeyError}
                </div>
              )}

              <form onSubmit={handleUnlockJudgeMode} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Passkey
                  </label>
                  <input
                    type="password"
                    placeholder="Enter passkey (e.g. hackhub-judge-2026)"
                    value={judgePasskey}
                    onChange={(e) => setJudgePasskey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasskeyModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-gray-950 font-bold shadow-lg"
                  >
                    Verify & Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Evaluate Score Modal */}
        {editingEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditingEntry(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  Judge Score Evaluation
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {editingEntry.teamName}
                </h3>
                <p className="text-gray-400 text-xs">
                  Project: {editingEntry.projectName}
                </p>
              </div>

              <form onSubmit={handleSaveScore} className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Innovation Score (0 - 25)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="25"
                      required
                      value={editInnovation}
                      onChange={(e) => setEditInnovation(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Technical Score (0 - 25)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="25"
                      required
                      value={editTechnical}
                      onChange={(e) => setEditTechnical(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Presentation Score (0 - 25)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="25"
                      required
                      value={editPresentation}
                      onChange={(e) => setEditPresentation(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Real-World Impact (0 - 25)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="25"
                      required
                      value={editImpact}
                      onChange={(e) => setEditImpact(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-amber-200 font-semibold text-xs">Calculated Total</span>
                  <span className="text-amber-300 font-black text-xl">
                    {(editInnovation + editTechnical + editPresentation + editImpact).toFixed(1)} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Status Designation
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Participant">Participant</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Finalist">Finalist</option>
                      <option value="Winner">Winner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Award Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Place, Best AI Hack"
                      value={editAward}
                      onChange={(e) => setEditAward(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Judge Feedback & Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback for the team..."
                    value={editJudgeNotes}
                    onChange={(e) => setEditJudgeNotes(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(null)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingScore}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-gray-950 font-bold transition-all disabled:opacity-50"
                  >
                    {isSavingScore ? "Updating..." : "Save Scores & Re-Rank"}
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
