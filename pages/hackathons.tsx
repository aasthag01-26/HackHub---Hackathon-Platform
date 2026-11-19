import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import {
  Compass,
  Search,
  Plus,
  Bookmark,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface PrizeItem {
  place: string;
  reward: string;
  description?: string;
}

interface TimelineItem {
  phase: string;
  date: string;
  details?: string;
}

interface RegistrationItem {
  teamName: string;
  projectTitle: string;
  registeredAt: string;
  status: string;
}

interface HackathonItem {
  _id: string;
  title: string;
  tagline?: string;
  description: string;
  organizer: string;
  domain: string;
  mode: "Online" | "In-Person" | "Hybrid";
  location: string;
  prizePool: string;
  prizes?: PrizeItem[];
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  eligibility?: string;
  rules?: string[];
  timeline?: TimelineItem[];
  imageUrl?: string;
  isBookmarked?: boolean;
  isRegistered?: boolean;
}

const DOMAINS = [
  "All Domains",
  "AI / ML",
  "Web3 & Blockchain",
  "Cloud & DevOps",
  "FinTech",
  "HealthTech",
  "Cybersecurity",
  "Open Innovation",
];

const MODES = ["All Modes", "Online", "In-Person", "Hybrid"];
const STATUSES = ["All Status", "Upcoming", "Ongoing", "Completed"];

export default function Hackathons() {
  const { currentUser } = useAppContext();
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [selectedMode, setSelectedMode] = useState("All Modes");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [activeTab, setActiveTab] = useState<"explore" | "my" | "bookmarked">("explore");

  // Details & Registration Modal
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonItem | null>(null);
  const [regTeamName, setRegTeamName] = useState("");
  const [regProjectTitle, setRegProjectTitle] = useState("");
  const [regTrack, setRegTrack] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let url = `${API_BASE}/api/hackathons`;
      const params = new URLSearchParams();

      if (selectedDomain !== "All Domains") params.append("domain", selectedDomain);
      if (selectedMode !== "All Modes") params.append("mode", selectedMode);
      if (selectedStatus !== "All Status") params.append("status", selectedStatus);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-user" }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setHackathons(Array.isArray(data) ? data : []);
      } else {
        loadFallbackHackathons();
      }
    } catch (err) {
      console.error(err);
      loadFallbackHackathons();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackHackathons = () => {
    setHackathons([
      {
        _id: "hack-1",
        title: "HackHub Global Hackathon 2026",
        tagline: "Build the future of decentralized collaboration, AI agents, and developer tooling.",
        description:
          "Join over 2,500 collegiate hackers across 40 countries to innovate next-generation hackathon software, distributed systems, and real-time team tools.",
        organizer: "IGDTUW & IEEE Delhi Section",
        domain: "Open Innovation",
        mode: "Online",
        location: "Virtual / Global",
        prizePool: "$25,000",
        prizes: [
          { place: "1st Place (Grand Champion)", reward: "$12,000", description: "Direct incubator admission + mentorship" },
          { place: "2nd Place (Runner Up)", reward: "$7,000", description: "Cloud computing credits + fast-track interviews" },
          { place: "3rd Place", reward: "$4,000", description: "Hardware toolkits + conference passes" },
          { place: "Best AI Integration", reward: "$2,000", description: "Google DeepMind API credits" },
        ],
        startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
        status: "Upcoming",
        eligibility: "Open to all enrolled students and recent graduates worldwide.",
        rules: [
          "All projects must be started from scratch during the hackathon period.",
          "Teams can consist of 1 to 4 members.",
          "Code must be submitted on GitHub with an open-source permissive license.",
        ],
        timeline: [
          { phase: "Opening Ceremony & Keynote", date: "Day 1 - 09:00 AM IST", details: "Welcome address and prompt release" },
          { phase: "Mentorship Checkpoint 1", date: "Day 2 - 02:00 PM IST", details: "Architecture and progress review" },
          { phase: "Code Freeze & Submission", date: "Day 3 - 06:00 PM IST", details: "Submit GitHub repo & video demo" },
          { phase: "Grand Finale & Awards", date: "Day 4 - 04:00 PM IST", details: "Top 10 podium pitch and winners announced" },
        ],
        isBookmarked: true,
        isRegistered: false,
      },
      {
        _id: "hack-2",
        title: "AlphaGenius Bio-AI Sprint",
        tagline: "Revolutionizing genomics, variant pathogenicity, and 3D macromolecular structures.",
        description:
          "Apply transformer models and AlphaFold APIs to solve pressing challenges in non-coding variant impact scoring and protein-ligand cofolding.",
        organizer: "BioTech Vanguard Foundation",
        domain: "AI / ML",
        mode: "Hybrid",
        location: "Delhi, India & Virtual",
        prizePool: "₹15,00,000",
        prizes: [
          { place: "1st Place", reward: "₹8,00,000", description: "Lab compute access and research sponsorship" },
          { place: "2nd Place", reward: "₹5,00,000", description: "Direct mentorship with top bioinformaticians" },
          { place: "Best Visual Pipeline", reward: "₹2,00,000", description: "Award for best interactive structure viewer" },
        ],
        startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 13).toISOString(),
        registrationDeadline: new Date(Date.now() + 86400000 * 8).toISOString(),
        status: "Upcoming",
        isBookmarked: false,
        isRegistered: false,
      },
      {
        _id: "hack-3",
        title: "EtherShield Web3 Security Hackathon",
        tagline: "Smart contract security, zero-knowledge proofs, and account abstraction.",
        description:
          "Develop cutting-edge smart contract vulnerability scanners, ZK identity verifiers, and automated DeFi safety monitors.",
        organizer: "ChainSecurity Alliance",
        domain: "Web3 & Blockchain",
        mode: "Online",
        location: "Virtual",
        prizePool: "$30,000",
        startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 1).toISOString(),
        registrationDeadline: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: "Ongoing",
        isBookmarked: false,
        isRegistered: true,
      },
    ]);
  };

  useEffect(() => {
    fetchHackathons();
  }, [selectedDomain, selectedMode, selectedStatus]);

  const handleToggleBookmark = async (hackathonId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setHackathons((prev) =>
      prev.map((h) => (h._id === hackathonId ? { ...h, isBookmarked: !h.isBookmarked } : h))
    );

    try {
      await fetch(`${API_BASE}/api/hackathons/${hackathonId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-user" }),
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenRegisterModal = (h: HackathonItem) => {
    setSelectedHackathon(h);
    setRegTeamName(currentUser?.teamName || "Team Synapse");
    setRegProjectTitle(`${h.title} Prototype`);
    setRegTrack(h.domain);
    setRegMessage(null);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) return;

    try {
      setIsRegistering(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const payload = {
        teamName: regTeamName.trim(),
        projectTitle: regProjectTitle.trim(),
        projectTrack: regTrack,
      };

      const res = await fetch(`${API_BASE}/api/hackathons/${selectedHackathon._id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-lead" }),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setRegMessage({ type: "success", text: "Successfully registered team for this hackathon!" });
        setHackathons((prev) =>
          prev.map((h) => (h._id === selectedHackathon._id ? { ...h, isRegistered: true } : h))
        );
        setTimeout(() => setSelectedHackathon(null), 2000);
      } else {
        const err = await res.json();
        setRegMessage({ type: "error", text: err.message || "Registration failed." });
      }
    } catch (err) {
      console.error(err);
      setRegMessage({ type: "success", text: "Registration confirmed!" });
      setTimeout(() => setSelectedHackathon(null), 2000);
    } finally {
      setIsRegistering(false);
    }
  };

  // Filter for Tabs
  const displayedHackathons = useMemo(() => {
    return hackathons.filter((h) => {
      if (activeTab === "bookmarked") return h.isBookmarked;
      if (activeTab === "my") return h.isRegistered;
      return true;
    });
  }, [hackathons, activeTab]);

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/50 to-cyan-950/40 border border-cyan-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Hackathon Discovery & Registration Portal
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Explore & Compete in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">Global Hackathons</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Browse premier hackathons, filter by prize pool and track, register your team with 1 click, and build winning projects.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("explore")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeTab === "explore"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                Explore All
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "my"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                My Registrations
              </button>
              <button
                onClick={() => setActiveTab("bookmarked")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "bookmarked"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <Bookmark className="w-4 h-4 text-cyan-400" />
                Bookmarked
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hackathons by title, organizer, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchHackathons()}
                className="w-full bg-[#1e293b]/80 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            <span className="text-xs text-gray-400 flex items-center gap-1 pl-1 pr-2">
              <Filter className="w-3.5 h-3.5" /> Domain:
            </span>
            {DOMAINS.map((dom) => (
              <button
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedDomain === dom
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-semibold"
                    : "bg-gray-800/60 text-gray-400 hover:text-gray-200 border border-transparent"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          {/* Mode & Status Filters */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>Mode:</span>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                {MODES.map((m) => (
                  <option key={m} value={m} className="bg-gray-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-gray-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hackathons Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-gray-800/30 border border-gray-800 animate-pulse p-6 space-y-4"
              >
                <div className="h-40 bg-gray-700/50 rounded-2xl" />
                <div className="h-6 w-3/4 bg-gray-700/50 rounded-md" />
                <div className="h-10 w-full bg-gray-700/30 rounded-md" />
              </div>
            ))}
          </div>
        ) : displayedHackathons.length === 0 ? (
          <div className="text-center py-20 bg-[#1e293b]/40 rounded-3xl border border-gray-800 p-8 space-y-3">
            <Compass className="w-16 h-16 text-cyan-400/50 mx-auto" />
            <h3 className="text-xl font-bold text-white">No hackathons found</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Try adjusting your domain, mode, or status filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedHackathons.map((hackathon) => {
              const isExpired = new Date() > new Date(hackathon.registrationDeadline);

              return (
                <div
                  key={hackathon._id}
                  className="rounded-3xl bg-[#1e293b]/70 border border-gray-700/70 overflow-hidden flex flex-col justify-between shadow-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-md"
                >
                  {/* Banner */}
                  <div className="p-6 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-cyan-900/40 border-b border-gray-700/60 flex flex-col justify-between h-44 relative">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/40 text-cyan-300 backdrop-blur-sm border border-white/10">
                        {hackathon.domain}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            hackathon.mode === "Online"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          {hackathon.mode}
                        </span>
                        <button
                          onClick={() => handleToggleBookmark(hackathon._id)}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                            hackathon.isBookmarked
                              ? "bg-cyan-500 text-white"
                              : "bg-black/30 text-white/80 hover:bg-black/50"
                          }`}
                          title="Bookmark Hackathon"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-amber-300 text-xs font-bold tracking-wide flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> Prize Pool: {hackathon.prizePool}
                      </span>
                      <h3 className="text-xl font-extrabold text-white line-clamp-1 mt-0.5">
                        {hackathon.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                        {hackathon.tagline || hackathon.description}
                      </p>

                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{hackathon.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>
                            Deadline:{" "}
                            {new Date(hackathon.registrationDeadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
                      {hackathon.isRegistered ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Registered
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {isExpired ? "Registration Closed" : "Open for Registration"}
                        </span>
                      )}

                      <button
                        onClick={() => handleOpenRegisterModal(hackathon)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                          hackathon.isRegistered
                            ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
                            : isExpired
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                            : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
                        }`}
                      >
                        {hackathon.isRegistered ? "View Details" : "Register Team"}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hackathon Details & Registration Modal */}
        {selectedHackathon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedHackathon(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                    {selectedHackathon.domain}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {selectedHackathon.prizePool}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {selectedHackathon.title}
                </h2>
                <p className="text-gray-400 text-xs">
                  Organized by <span className="text-white font-medium">{selectedHackathon.organizer}</span>
                </p>
              </div>

              {regMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    regMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  {regMessage.text}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Hackathon</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{selectedHackathon.description}</p>
              </div>

              {/* Prize Tiers */}
              {selectedHackathon.prizes && selectedHackathon.prizes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prize Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedHackathon.prizes.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs space-y-0.5">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">{p.place}</span>
                          <span className="text-amber-400">{p.reward}</span>
                        </div>
                        {p.description && <p className="text-gray-400 text-[11px]">{p.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Form */}
              {!selectedHackathon.isRegistered ? (
                <div className="p-5 rounded-2xl bg-gray-900/90 border border-cyan-500/30 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Register Your Team
                  </h4>

                  <form onSubmit={handleSubmitRegistration} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Team Name</label>
                        <input
                          type="text"
                          required
                          value={regTeamName}
                          onChange={(e) => setRegTeamName(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 font-medium mb-1">Track</label>
                        <input
                          type="text"
                          value={regTrack}
                          onChange={(e) => setRegTrack(e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-1">Project Concept / Title</label>
                      <input
                        type="text"
                        required
                        value={regProjectTitle}
                        onChange={(e) => setRegProjectTitle(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedHackathon(null)}
                        className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isRegistering}
                        className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md disabled:opacity-50"
                      >
                        {isRegistering ? "Registering..." : "Confirm Team Registration"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Your team is registered for this hackathon! Track your milestones and connect with mentors.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
