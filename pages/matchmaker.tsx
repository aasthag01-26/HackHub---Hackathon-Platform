"use client";
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Sparkles,
  Search,
  Filter,
  UserPlus,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Github,
  Linkedin,
  ShieldCheck,
  Zap,
  Award,
  Layers,
  ChevronRight,
  X,
  Compass,
} from "lucide-react";

export interface Candidate {
  _id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  university: string;
  experienceLevel: string;
  bio: string;
  availability: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  isVerifiedStudent?: boolean;
}

export interface TeamInvite {
  _id: string;
  teamName: string;
  candidateId: string;
  candidateName: string;
  roleOffered: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: string;
}

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    _id: "c-1",
    name: "Aarav Sharma",
    email: "aarav.sharma@igdtuw.ac.in",
    role: "AI/ML Engineer",
    skills: ["Python", "PyTorch", "Hugging Face", "FastAPI", "LangChain"],
    university: "IGDTUW Delhi",
    experienceLevel: "Hackathon Veteran",
    bio: "Passionate about LLMs, computer vision, and building zero-shot multi-agent systems for social impact.",
    availability: "Looking for Team",
    github: "https://github.com/aarav-ai",
    linkedin: "https://linkedin.com/in/aarav-sharma-ai",
    isVerifiedStudent: true,
  },
  {
    name: "Sneha Patel",
    _id: "c-2",
    email: "sneha.patel@nsut.ac.in",
    role: "UI/UX Designer",
    skills: ["Figma", "Design Systems", "Prototyping", "Tailwind CSS", "User Research"],
    university: "NSUT Delhi",
    experienceLevel: "Advanced",
    bio: "Specializing in accessible, glassmorphic UI, rapid user journey mapping, and converting wireframes into responsive React code.",
    availability: "Looking for Team",
    github: "https://github.com/snehadesign",
    linkedin: "https://linkedin.com/in/sneha-patel-design",
    isVerifiedStudent: true,
  },
  {
    name: "Rohan Varma",
    _id: "c-3",
    email: "rohan.varma@dtu.ac.in",
    role: "Backend Developer",
    skills: ["Node.js", "Go", "PostgreSQL", "Docker", "Redis", "gRPC"],
    university: "DTU Delhi",
    experienceLevel: "Advanced",
    bio: "Distributed systems builder. Loves building microservices with high-concurrency throughput and resilient DB caching.",
    availability: "Looking for Team",
    github: "https://github.com/rohan-varma",
    linkedin: "https://linkedin.com/in/rohan-varma-dev",
    isVerifiedStudent: true,
  },
  {
    name: "Ananya Iyer",
    _id: "c-4",
    email: "ananya.iyer@iiitd.ac.in",
    role: "Frontend Developer",
    skills: ["React", "Next.js", "TypeScript", "Three.js", "Framer Motion"],
    university: "IIIT Delhi",
    experienceLevel: "Intermediate",
    bio: "Frontend craftsman crafting interactive canvas visuals, smooth animations, and clean reusable component architectures.",
    availability: "Looking for Team",
    github: "https://github.com/ananya-frontend",
    linkedin: "https://linkedin.com/in/ananya-iyer-ui",
    isVerifiedStudent: true,
  },
  {
    name: "Kabir Mehta",
    _id: "c-5",
    email: "kabir.mehta@iitd.ac.in",
    role: "Blockchain/Web3 Dev",
    skills: ["Solidity", "Hardhat", "Ethers.js", "IPFS", "Smart Contracts"],
    university: "IIT Delhi",
    experienceLevel: "Hackathon Veteran",
    bio: "Ethereum developer with 3 hackathon podiums. Building decentralized identity and verifiable credentials protocols.",
    availability: "Open to Offers",
    github: "https://github.com/kabir-web3",
    linkedin: "https://linkedin.com/in/kabir-mehta-eth",
    isVerifiedStudent: true,
  },
  {
    name: "Diya Sengupta",
    _id: "c-6",
    email: "diya.s@bits-pilani.ac.in",
    role: "Pitch & Product Lead",
    skills: ["Pitch Decks", "Product Strategy", "Market Sizing", "Figma", "Public Speaking"],
    university: "BITS Pilani",
    experienceLevel: "Hackathon Veteran",
    bio: "3-minute presentation specialist. Turning complex technical architectures into compelling investor-grade pitches.",
    availability: "Looking for Team",
    github: "https://github.com/diya-product",
    linkedin: "https://linkedin.com/in/diya-sengupta-pm",
    isVerifiedStudent: true,
  },
];

const MY_TEAM_SKILLS = ["React", "TypeScript", "Tailwind CSS", "Node.js"];

export default function Matchmaker() {
  const [activeTab, setActiveTab] = useState<"explore" | "invites" | "coverage">("explore");
  const [candidates, setCandidates] = useState<Candidate[]>(DEFAULT_CANDIDATES);
  const [invites, setInvites] = useState<TeamInvite[]>([
    {
      _id: "inv-1",
      teamName: "Team Synapse",
      candidateId: "c-1",
      candidateName: "Aarav Sharma",
      roleOffered: "AI/ML Lead",
      message: "Hey Aarav! We saw your PyTorch work and would love your help building our AI inference agent.",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ]);

  // Filters
  const [selectedRole, setSelectedRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState("AI/ML Specialist");
  const [inviteMessage, setInviteMessage] = useState(
    "Hi! We are building an innovative hackathon solution and your skill set would make our team unstoppable!"
  );
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // New Free Agent Form state
  const [newProfile, setNewProfile] = useState({
    name: "",
    email: "",
    role: "AI/ML Engineer",
    skills: "",
    university: "",
    experienceLevel: "Intermediate",
    bio: "",
    github: "",
    linkedin: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute complementary compatibility score
  const getCompatibilityScore = (candidateSkills: string[]) => {
    let complementary = 0;
    candidateSkills.forEach((s) => {
      if (!MY_TEAM_SKILLS.some((ts) => ts.toLowerCase() === s.toLowerCase())) {
        complementary++;
      }
    });
    const score = 70 + complementary * 7;
    return Math.min(99, Math.max(65, score));
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesRole = selectedRole === "All" || c.role.toLowerCase() === selectedRole.toLowerCase();
    const matchesAvailability =
      selectedAvailability === "All" || c.availability.toLowerCase() === selectedAvailability.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesAvailability && matchesSearch;
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const newInvite: TeamInvite = {
      _id: "inv-" + Date.now(),
      teamName: "Team Synapse",
      candidateId: selectedCandidate._id,
      candidateName: selectedCandidate.name,
      roleOffered: inviteRole,
      message: inviteMessage,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setInvites([newInvite, ...invites]);
    setShowInviteModal(false);
    showToast(`🚀 Official team invitation sent to ${selectedCandidate.name}!`);
  };

  const handleRegisterProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfile.name || !newProfile.email || !newProfile.university) {
      alert("Please fill in name, email, and university.");
      return;
    }

    const skillsArray = newProfile.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const created: Candidate = {
      _id: "user-" + Date.now(),
      name: newProfile.name,
      email: newProfile.email,
      role: newProfile.role,
      skills: skillsArray.length > 0 ? skillsArray : ["Next.js", "Python"],
      university: newProfile.university,
      experienceLevel: newProfile.experienceLevel,
      bio: newProfile.bio || "Enthusiastic hacker looking to collaborate and win podium!",
      availability: "Looking for Team",
      github: newProfile.github,
      linkedin: newProfile.linkedin,
      isVerifiedStudent: true,
    };

    setCandidates([created, ...candidates]);
    setShowRegisterModal(false);
    showToast("🎉 Your Free Agent candidate profile is live in the Matchmaker catalog!");
  };

  const handleUpdateInviteStatus = (id: string, status: "accepted" | "declined" | "cancelled") => {
    setInvites(invites.map((inv) => (inv._id === id ? { ...inv, status } : inv)));
    showToast(`Invitation marked as ${status}!`);
  };

  const roles = [
    "All",
    "AI/ML Engineer",
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Blockchain/Web3 Dev",
    "Pitch & Product Lead",
  ];

  return (
    <Layout>
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-cyan-400/30 animate-bounce">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="font-medium text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="relative mb-8 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-cyan-900/40 border border-gray-700/60 backdrop-blur-xl shadow-2xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" /> AI Teammate Matchmaker Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Find Your Dream Hackathon Squad
            </h1>
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
              Match with verified student developers, designers, and pitch leaders based on complementary skill
              matrices, team gaps, and hackathon compatibility ratings.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" /> Join as a Free Agent
            </button>
            <div className="text-xs text-zinc-400 bg-gray-900/60 px-3 py-2 rounded-lg border border-gray-800">
              ⚡ Your Team has <span className="text-cyan-400 font-semibold">{MY_TEAM_SKILLS.join(", ")}</span> covered.
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-3 px-4 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === "explore" ? "text-cyan-400 font-semibold" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Compass className="w-4 h-4" /> Explore Candidates ({filteredCandidates.length})
            {activeTab === "explore" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></span>}
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            className={`pb-3 px-4 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === "invites" ? "text-cyan-400 font-semibold" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Send className="w-4 h-4" /> Sent Invitations ({invites.length})
            {activeTab === "invites" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></span>}
          </button>
          <button
            onClick={() => setActiveTab("coverage")}
            className={`pb-3 px-4 font-medium text-sm transition-colors relative flex items-center gap-2 ${
              activeTab === "coverage" ? "text-cyan-400 font-semibold" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Layers className="w-4 h-4" /> Team Skill Gap Analysis
            {activeTab === "coverage" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400"></span>}
          </button>
        </div>

        {/* TAB 1: EXPLORE CANDIDATES */}
        {activeTab === "explore" && (
          <div>
            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 bg-gray-900/40 p-4 rounded-xl border border-gray-800 backdrop-blur-md">
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by candidate name, skill, or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r === "All" ? "All Domains / Roles" : r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full bg-gray-800/80 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="All">All Availabilities</option>
                  <option value="Looking for Team">🟢 Looking for Team</option>
                  <option value="Open to Offers">🟡 Open to Offers</option>
                </select>
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCandidates.map((c) => {
                const compatibility = getCompatibilityScore(c.skills);
                return (
                  <div
                    key={c._id}
                    className="bg-gray-900/60 rounded-xl border border-gray-800 hover:border-gray-700 p-5 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-purple-900/10 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base flex items-center gap-1.5">
                              {c.name}
                              {c.isVerifiedStudent && (
                                <span title="Verified Student">
                                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                                </span>
                              )}
                            </h3>
                            <p className="text-xs text-zinc-400">{c.university}</p>
                          </div>
                        </div>

                        {/* Compatibility Score */}
                        <div
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800 flex items-center gap-1"
                          title="AI Skill Compatibility with your team's stack"
                        >
                          <Zap className="w-3 h-3 text-yellow-400" />
                          {compatibility}% Match
                        </div>
                      </div>

                      {/* Role & Level Pill */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-900/40 text-purple-300 border border-purple-700/50 font-medium">
                          {c.role}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-zinc-400 border border-gray-700">
                          {c.experienceLevel}
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-zinc-300 leading-relaxed mb-4 line-clamp-2">{c.bio}</p>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {c.skills.map((skill) => {
                          const isComplementary = !MY_TEAM_SKILLS.some(
                            (ts) => ts.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span
                              key={skill}
                              className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                                isComplementary
                                  ? "bg-cyan-950/60 text-cyan-300 border border-cyan-800/70"
                                  : "bg-gray-800 text-zinc-400 border border-gray-700"
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions & Links */}
                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2 text-gray-400">
                        {c.github && (
                          <a
                            href={c.github}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-white transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {c.linkedin && (
                          <a
                            href={c.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-white transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCandidate(c);
                          setInviteRole(c.role);
                          setShowInviteModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-md"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Invite to Team
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SENT INVITATIONS */}
        {activeTab === "invites" && (
          <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-6 backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" /> Active Team Invitations
            </h2>

            {invites.length === 0 ? (
              <p className="text-zinc-400 text-sm py-8 text-center">
                No invitations sent yet. Explore candidate profiles to invite your missing roles!
              </p>
            ) : (
              <div className="divide-y divide-gray-800">
                {invites.map((inv) => (
                  <div key={inv._id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-semibold text-white text-sm">{inv.candidateName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-800">
                          {inv.roleOffered}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 font-medium ${
                            inv.status === "pending"
                              ? "bg-yellow-950/80 text-yellow-300 border border-yellow-800"
                              : inv.status === "accepted"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-red-950/80 text-red-300 border border-red-800"
                          }`}
                        >
                          {inv.status === "pending" && <Clock className="w-3 h-3" />}
                          {inv.status === "accepted" && <CheckCircle2 className="w-3 h-3" />}
                          {inv.status === "declined" && <XCircle className="w-3 h-3" />}
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 italic mb-1">&quot;{inv.message}&quot;</p>
                      <p className="text-[11px] text-zinc-500">
                        From: {inv.teamName} • Sent on {new Date(inv.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {inv.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateInviteStatus(inv._id, "accepted")}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            Mark Accepted
                          </button>
                          <button
                            onClick={() => handleUpdateInviteStatus(inv._id, "cancelled")}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEAM SKILL GAP ANALYSIS */}
        {activeTab === "coverage" && (
          <div className="space-y-6">
            <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> Team Stack Coverage & Recommended Gaps
              </h2>
              <p className="text-xs text-zinc-300 mb-6">
                Based on winning hackathon team compositions, a podium team consists of Frontend, Backend, AI/Data,
                UI/UX Design, and a Pitch Lead.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                    ✅ Covered in Team
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-white">Frontend Architecture (React, Next.js)</p>
                    <p className="text-sm font-medium text-white">Type Safety (TypeScript)</p>
                    <p className="text-sm font-medium text-white">Styling & UI (Tailwind CSS)</p>
                    <p className="text-sm font-medium text-white">REST Backend (Node.js)</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-800/50">
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider block mb-2">
                    ⚠️ Critical Missing Roles
                  </span>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-white">AI/ML & LLM Engineer</p>
                      <p className="text-xs text-zinc-400">Needed for agent pipelines, RAG, and embeddings.</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">UI/UX Designer (Figma)</p>
                      <p className="text-xs text-zinc-400">Needed for high-fidelity interactive design artifacts.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-2">
                      💡 AI Match Recommendation
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Inviting <span className="text-cyan-300 font-semibold">Aarav Sharma</span> (AI/ML) and{" "}
                      <span className="text-purple-300 font-semibold">Sneha Patel</span> (Figma UI/UX) will elevate your
                      team coverage to <span className="text-emerald-400 font-bold">100% Full-Stack Ready</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Browse Recommended Candidates <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: INVITE TO TEAM */}
        {showInviteModal && selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400" /> Send Team Invitation
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Inviting Candidate</label>
                  <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedCandidate.name}</p>
                      <p className="text-xs text-zinc-400">{selectedCandidate.university}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-800">
                      {selectedCandidate.role}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Role Offered</label>
                  <input
                    type="text"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Lead AI Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Personalized Invite Note</label>
                  <textarea
                    rows={3}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Explain why they would be a great fit for your project..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow-lg"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER AS FREE AGENT */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" /> Free Agent Candidate Profile
                </h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterProfile} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newProfile.name}
                      onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. Sanjai Gopal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">College Email *</label>
                    <input
                      type="email"
                      required
                      value={newProfile.email}
                      onChange={(e) => setNewProfile({ ...newProfile, email: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="sanjai@university.ac.in"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Primary Domain / Role *</label>
                    <select
                      value={newProfile.role}
                      onChange={(e) => setNewProfile({ ...newProfile, role: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="AI/ML Engineer">AI/ML Engineer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Blockchain/Web3 Dev">Blockchain/Web3 Dev</option>
                      <option value="Pitch & Product Lead">Pitch & Product Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">University / College *</label>
                    <input
                      type="text"
                      required
                      value={newProfile.university}
                      onChange={(e) => setNewProfile({ ...newProfile, university: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="e.g. IGDTUW Delhi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Skills (Comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProfile.skills}
                    onChange={(e) => setNewProfile({ ...newProfile, skills: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. React, PyTorch, Node.js, Next.js, Figma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Short Bio</label>
                  <textarea
                    rows={2}
                    value={newProfile.bio}
                    onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Tell teams what you love building and what podium hackathons you aim for..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={newProfile.github}
                      onChange={(e) => setNewProfile({ ...newProfile, github: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="https://github.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={newProfile.linkedin}
                      onChange={(e) => setNewProfile({ ...newProfile, linkedin: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow-lg"
                  >
                    Publish Candidate Profile
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
