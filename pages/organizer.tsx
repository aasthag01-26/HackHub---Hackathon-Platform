import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import {
  Calendar,
  Layers,
  Plus,
  Trophy,
  Users,
  Settings,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Award,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface OrganizerEvent {
  _id: string;
  title: string;
  tagline: string;
  description: string;
  mode: string;
  prizePool: string;
  tracks: string[];
  rounds: {
    roundNumber: number;
    name: string;
    deadline: string;
    status: string;
  }[];
  rubrics: {
    criterion: string;
    weight: number;
    maxPoints: number;
  }[];
  status: string;
  registeredTeamsCount: number;
}

export default function OrganizerPage() {
  const { currentUser } = useAppContext();
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  // Form State
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [prizePool, setPrizePool] = useState("$10,000");
  const [tracksText, setTracksText] = useState("AI & ML, Web3, FinTech, Open Track");

  const totalPrizePool = useMemo(() => {
    if (!events || !events.length) return "$0";
    let sum = 0;
    for (const e of events) {
      if (typeof e.prizePool === "string") {
        const num = parseFloat(e.prizePool.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) sum += num;
      } else if (typeof e.prizePool === "number") {
        sum += e.prizePool;
      }
    }
    return `$${sum.toLocaleString()}`;
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/organizer/hackathons`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        return;
      }
    } catch {
      // Mock fallback
    } finally {
      setLoading(false);
    }

    setEvents([
      {
        _id: "org-event-1",
        title: "IEEE Innovation Sprint 2026",
        tagline: "48-hour global challenge solving real-world engineering problems.",
        description: "Join international student teams to develop groundbreaking open source software and hardware solutions.",
        mode: "Virtual",
        prizePool: "$15,000",
        tracks: ["AI / ML", "Cybersecurity", "CleanTech", "Open Track"],
        rounds: [
          { roundNumber: 1, name: "Idea & Architecture Submission", deadline: "2026-12-01", status: "Completed" },
          { roundNumber: 2, name: "MVP Build & Code Freeze", deadline: "2026-12-03", status: "Active" },
          { roundNumber: 3, name: "Final Presentation & Pitch", deadline: "2026-12-05", status: "Upcoming" },
        ],
        rubrics: [
          { criterion: "Technical Complexity", weight: 30, maxPoints: 30 },
          { criterion: "Innovation & Uniqueness", weight: 30, maxPoints: 30 },
          { criterion: "UI / UX Design", weight: 20, maxPoints: 20 },
          { criterion: "Pitch & Presentation", weight: 20, maxPoints: 20 },
        ],
        status: "Active",
        registeredTeamsCount: 28,
      },
    ]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const tracks = tracksText.split(",").map((t) => t.trim()).filter(Boolean);
    const newHackathon = {
      title,
      tagline: tagline || "Build and innovate without limits.",
      description,
      prizePool,
      tracks,
      mode: "Virtual",
    };

    try {
      const res = await fetch(`${API_BASE}/api/organizer/hackathons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHackathon),
      });
      if (res.ok) {
        const created = await res.json();
        setEvents((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        return;
      }
    } catch {
      // Optimistic update
    }

    setEvents((prev) => [
      {
        _id: "org-" + Date.now(),
        ...newHackathon,
        rounds: [
          { roundNumber: 1, name: "Kickoff & Sprint", deadline: "2026-12-10", status: "Active" },
        ],
        rubrics: [
          { criterion: "Innovation", weight: 40, maxPoints: 40 },
          { criterion: "Execution", weight: 40, maxPoints: 40 },
          { criterion: "Design", weight: 20, maxPoints: 20 },
        ],
        status: "Published",
        registeredTeamsCount: 1,
      },
      ...prev,
    ]);
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              Hackathon Organizer & Round Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Design hackathon tracks, schedule evaluation rounds, configure rubric weights, and oversee registered teams.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" /> Create Hackathon
          </button>
        </div>

        {/* Organizer Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hosted Events
            </span>
            <p className="text-3xl font-extrabold text-white mt-2">{events.length}</p>
            <p className="text-xs text-cyan-400 mt-1">Published on HackHub</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Registered Teams
            </span>
            <p className="text-3xl font-extrabold text-indigo-400 mt-2">
              {events.reduce((sum, e) => sum + (e.registeredTeamsCount || 0), 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Active student builders</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Prize Pool
            </span>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">{totalPrizePool}</p>
            <p className="text-xs text-emerald-400/80 mt-1">Across all tracks</p>
          </div>
        </div>

        {/* Hackathons List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Managed Hackathon Events
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {event.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {event.mode}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{event.description}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400">Prize Pool</span>
                    <p className="text-lg font-bold text-emerald-400">{event.prizePool}</p>
                  </div>
                </div>

                {/* Tracks */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Active Challenge Tracks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {event.tracks.map((track) => (
                      <span
                        key={track}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-300"
                      >
                        {track}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rounds Roadmap */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
                    Evaluation Rounds Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {event.rounds.map((round) => (
                      <div
                        key={round.name}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${
                          round.status === "Active"
                            ? "bg-indigo-950/40 border-indigo-500/40"
                            : round.status === "Completed"
                            ? "bg-emerald-950/20 border-emerald-500/30 text-gray-400"
                            : "bg-white/5 border-white/10 text-gray-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                              R{round.roundNumber}
                            </span>
                            <p className="text-xs font-bold text-white truncate max-w-[140px]">
                              {round.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due: {round.deadline}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            round.status === "Active"
                              ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50"
                              : round.status === "Completed"
                              ? "bg-emerald-500/30 text-emerald-300"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {round.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rubrics Preview */}
                <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4 text-gray-300">
                    <span className="font-semibold text-gray-400">Scoring Rubrics:</span>
                    {event.rubrics.map((r) => (
                      <span key={r.criterion} className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        {r.criterion} ({r.weight}%)
                      </span>
                    ))}
                  </div>

                  <span className="text-gray-400">
                    👥 {event.registeredTeamsCount} Teams Registered
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Create Hackathon */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border border-white/15 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold">Create New Hackathon Event</h3>
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
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NextGen Web3 Hackathon"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Innovate. Build. Launch."
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder="e.g. $10,000"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tracks (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tracksText}
                    onChange={(e) => setTracksText(e.target.value)}
                    placeholder="AI & ML, Web3, FinTech"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Description & Rules
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detail the hackathon goals, expectations, and criteria..."
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
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
                    Publish Hackathon
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
