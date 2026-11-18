import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import {
  Search,
  Filter,
  Plus,
  Heart,
  Bookmark,
  ExternalLink,
  Github,
  Users,
  Code,
  Sparkles,
  Layers,
  X,
  Share2,
  CheckCircle2,
} from "lucide-react";

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  domain: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl?: string;
  teamName: string;
  authorName: string;
  members: string[];
  likes: number;
  likedBy?: string[];
  createdAt: string;
}

const DOMAIN_OPTIONS = [
  "All",
  "Web Development",
  "AI / ML",
  "Mobile Apps",
  "Cloud & DevOps",
  "Blockchain / Web3",
  "Open Source",
] as const;

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "HackHub Platform",
    tagline: "Collaborative real-time hackathon management & task orchestration suite",
    description:
      "A complete hackathon OS featuring real-time task boards, team chat, verified project submissions, AI pitch generation, and asset management built for university hackathons.",
    domain: "Web Development",
    technologies: ["Next.js 14", "TypeScript", "Tailwind CSS", "MongoDB", "Express", "Node.js"],
    githubUrl: "https://github.com/aasthag01-26/HackHub---Hackathon-Platform",
    liveUrl: "https://intern-project-igdtuw.vercel.app",
    teamName: "Nexus Innovators",
    authorName: "Sanjai Gopal",
    members: ["Sanjai Gopal", "Aastha Goyal"],
    likes: 24,
    createdAt: "2026-11-18T10:00:00.000Z",
  },
  {
    id: "proj-2",
    title: "NeuroScan AI",
    tagline: "Edge-computed real-time medical imaging diagnostics and triage classifier",
    description:
      "Federated deep learning pipeline using PyTorch and FastAPI to assist rural clinicians in classifying pulmonary chest X-rays with offline inference caching.",
    domain: "AI / ML",
    technologies: ["Python", "FastAPI", "PyTorch", "React", "Docker", "ONNX"],
    githubUrl: "https://github.com/example/neuroscan-ai",
    liveUrl: "https://neuroscan-demo.vercel.app",
    teamName: "BioSynth Labs",
    authorName: "Dr. Evelyn Reed",
    members: ["Evelyn Reed", "Aarav Patel", "Maya Lin"],
    likes: 19,
    createdAt: "2026-11-17T15:30:00.000Z",
  },
  {
    id: "proj-3",
    title: "EtherVault",
    tagline: "Decentralized micro-grant escrow with automated milestone verification",
    description:
      "Smart contract suite on Polygon allowing open-source sponsors to lock milestone funds and release payments upon validated GitHub pull request merges.",
    domain: "Blockchain / Web3",
    technologies: ["Solidity", "Hardhat", "Next.js", "Ethers.js", "IPFS", "Wagmi"],
    githubUrl: "https://github.com/example/ethervault",
    liveUrl: "https://ethervault.pages.dev",
    teamName: "ZeroKnowledge Crew",
    authorName: "Kenji Sato",
    members: ["Kenji Sato", "Elena Rostova"],
    likes: 14,
    createdAt: "2026-11-16T12:00:00.000Z",
  },
  {
    id: "proj-4",
    title: "PulseGuard Mobile",
    tagline: "Offline-first wearable vital telemetry and panic beacon for solo explorers",
    description:
      "Native Kotlin Android application that interfaces with BLE biometric sensors to detect fall anomalies and dispatch mesh SMS beacons without internet access.",
    domain: "Mobile Apps",
    technologies: ["Kotlin", "Jetpack Compose", "Coroutines", "Room DB", "BLE API"],
    githubUrl: "https://github.com/example/pulse-guard",
    teamName: "Apex Mobile",
    authorName: "Rohan Varma",
    members: ["Rohan Varma", "Sarah Jenkins"],
    likes: 11,
    createdAt: "2026-11-15T09:20:00.000Z",
  },
];

export default function ShowcasePage() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("popular");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  // Modal States
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDomain, setFormDomain] = useState<string>("Web Development");
  const [formTech, setFormTech] = useState("");
  const [formGithub, setFormGithub] = useState("");
  const [formLive, setFormLive] = useState("");
  const [formTeam, setFormTeam] = useState("");
  const [formMembers, setFormMembers] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load persisted projects and local bookmarks from localStorage
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("hackhub_showcase_projects");
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      }

      const storedBookmarks = localStorage.getItem("hackhub_showcase_bookmarks");
      if (storedBookmarks) {
        setBookmarkedIds(JSON.parse(storedBookmarks));
      }

      const storedLikes = localStorage.getItem("hackhub_showcase_likes");
      if (storedLikes) {
        setLikedIds(JSON.parse(storedLikes));
      }
    } catch {
      // Graceful fallback to default state
    }

    // Attempt backend sync
    const fetchFromBackend = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/projects");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setProjects(json.data);
            localStorage.setItem("hackhub_showcase_projects", JSON.stringify(json.data));
          }
        }
      } catch {
        // Backend offline, keep local state
      }
    };

    fetchFromBackend();
  }, []);

  // Save changes to localStorage
  const persistProjects = (updated: ProjectItem[]) => {
    setProjects(updated);
    try {
      localStorage.setItem("hackhub_showcase_projects", JSON.stringify(updated));
    } catch {
      // Storage error ignored
    }
  };

  const toggleBookmark = (id: string) => {
    const next = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(next);
    localStorage.setItem("hackhub_showcase_bookmarks", JSON.stringify(next));
  };

  const toggleLike = async (id: string) => {
    const alreadyLiked = likedIds.includes(id);
    const nextLiked = alreadyLiked
      ? likedIds.filter((item) => item !== id)
      : [...likedIds, id];
    setLikedIds(nextLiked);
    localStorage.setItem("hackhub_showcase_likes", JSON.stringify(nextLiked));

    const updated = projects.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          likes: alreadyLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
        };
      }
      return p;
    });
    persistProjects(updated);

    // Sync with backend if available
    try {
      await fetch(`http://localhost:5000/api/projects/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: localStorage.getItem("userEmail") || "user" }),
      });
    } catch {
      // Backend offline, optimistic local update preserved
    }
  };

  const handleShare = (p: ProjectItem) => {
    const url = p.liveUrl || p.githubUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) {
      setFormError("Project title is required.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Project description is required.");
      return;
    }
    if (!formGithub.trim()) {
      setFormError("GitHub repository URL is required.");
      return;
    }
    if (!formTeam.trim()) {
      setFormError("Team name is required.");
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(formGithub)) {
      setFormError("Please provide a valid GitHub repository URL.");
      return;
    }
    if (formLive.trim() && !urlPattern.test(formLive)) {
      setFormError("Please provide a valid Live Demo URL.");
      return;
    }

    setIsSubmitting(true);

    const techArray = formTech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const membersArray = formMembers
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: formTitle.trim(),
      tagline: formTagline.trim() || formTitle.trim(),
      description: formDescription.trim(),
      domain: formDomain,
      technologies: techArray.length > 0 ? techArray : ["React", "TypeScript"],
      githubUrl: formGithub.trim(),
      liveUrl: formLive.trim() || undefined,
      teamName: formTeam.trim(),
      authorName: localStorage.getItem("userName") || "HackHub Participant",
      members: membersArray.length > 0 ? membersArray : [formTeam.trim()],
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    // Try backend persistence
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          newProject.id = json.data._id || newProject.id;
        }
      }
    } catch {
      // Local fallback preserved
    }

    const updated = [newProject, ...projects];
    persistProjects(updated);

    // Reset Form
    setFormTitle("");
    setFormTagline("");
    setFormDescription("");
    setFormTech("");
    setFormGithub("");
    setFormLive("");
    setFormTeam("");
    setFormMembers("");
    setIsSubmitting(false);
    setIsPublishModalOpen(false);
  };

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (showBookmarksOnly && !bookmarkedIds.includes(p.id)) return false;
        if (selectedDomain !== "All" && p.domain !== selectedDomain) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchTagline = p.tagline.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTech = p.technologies.some((t) => t.toLowerCase().includes(q));
          const matchTeam = p.teamName.toLowerCase().includes(q);
          return matchTitle || matchTagline || matchDesc || matchTech || matchTeam;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") {
          return b.likes - a.likes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [projects, selectedDomain, searchQuery, sortBy, bookmarkedIds, showBookmarksOnly]);

  return (
    <Layout>
      <Head>
        <title>Public Project Showcase | HackHub</title>
        <meta
          name="description"
          content="Explore and showcase completed hackathon projects, innovations, and open-source solutions on HackHub."
        />
      </Head>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e1b4b]/80 via-[#312e81]/60 to-[#1e1b4b]/80 border border-indigo-500/30 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Community Project Gallery
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Public Project Showcase
              </h1>
              <p className="mt-2 text-zinc-300 text-sm md:text-base max-w-2xl leading-relaxed">
                Explore innovative solutions created by hackathon teams. Discover architectural patterns,
                inspect repositories, and showcase your team's completed project.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  showBookmarksOnly
                    ? "bg-amber-500/20 border-amber-400/50 text-amber-300"
                    : "bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-gray-700/60"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved ({bookmarkedIds.length})
              </button>

              <button
                type="button"
                onClick={() => setIsPublishModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-sm shadow-lg hover:shadow-cyan-500/25 hover:opacity-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Publish Project
              </button>
            </div>
          </div>
        </div>

        {/* Search & Domain Filter Toolbar */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by title, stack, keyword, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-300 self-end md:self-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Sort:</span>
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  sortBy === "popular"
                    ? "bg-purple-600/30 border-purple-500 text-purple-300 font-semibold"
                    : "border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                }`}
              >
                Most Popular
              </button>
              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  sortBy === "newest"
                    ? "bg-purple-600/30 border-purple-500 text-purple-300 font-semibold"
                    : "border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                }`}
              >
                Newest
              </button>
            </div>
          </div>

          {/* Domain Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DOMAIN_OPTIONS.map((domain) => {
              const active = selectedDomain === domain;
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setSelectedDomain(domain)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20"
                      : "bg-slate-800/70 text-gray-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/60"
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <Layers className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No projects found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
              {showBookmarksOnly
                ? "You haven't bookmarked any projects yet. Click the bookmark icon on any project card to save it."
                : "No showcase projects match your current search criteria. Try selecting 'All' domains or resetting your search query."}
            </p>
            {(searchQuery || selectedDomain !== "All" || showBookmarksOnly) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDomain("All");
                  setShowBookmarksOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const isLiked = likedIds.includes(p.id);
              const isBookmarked = bookmarkedIds.includes(p.id);

              return (
                <article
                  key={p.id}
                  className="group bg-[#0f172a]/80 hover:bg-[#1e1b4b]/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Card Visual Banner */}
                  <div className="h-32 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 relative p-4 flex flex-col justify-between border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {p.domain}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleBookmark(p.id)}
                          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark project"}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isBookmarked
                              ? "bg-amber-500/20 border-amber-400/50 text-amber-300"
                              : "bg-slate-900/60 border-slate-700 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShare(p)}
                          aria-label="Share project"
                          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700 text-gray-400 hover:text-white transition-all"
                        >
                          {copiedId === p.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-medium truncate">{p.teamName}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h2
                      onClick={() => setSelectedProject(p)}
                      className="text-lg font-bold text-white group-hover:text-cyan-400 cursor-pointer transition-colors"
                    >
                      {p.title}
                    </h2>
                    <p className="text-xs text-cyan-300/80 font-medium mt-1 line-clamp-1">
                      {p.tagline}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed flex-1">
                      {p.description}
                    </p>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {p.technologies.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-gray-300 text-[10px] font-medium border border-slate-700/50"
                        >
                          {tech}
                        </span>
                      ))}
                      {p.technologies.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-gray-400 text-[10px]">
                          +{p.technologies.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleLike(p.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                          isLiked
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                            : "bg-slate-800/50 border-slate-700 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`}
                        />
                        <span>{p.likes}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
                          title="View GitHub Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                        {p.liveUrl && (
                          <a
                            href={p.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 transition-colors"
                            title="Open Live Deployment"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Publish Project Modal */}
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-white">Publish Project to Showcase</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Share your hackathon project with judges, mentors, and the student developer community.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handlePublishSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., HackHub Platform"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tagline / One-liner
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Real-time collaboration platform for hackathons"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Domain Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formDomain}
                      onChange={(e) => setFormDomain(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                      {DOMAIN_OPTIONS.filter((d) => d !== "All").map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Team Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Nexus Innovators"
                      value={formTeam}
                      onChange={(e) => setFormTeam(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what problem your project solves, key features, and architecture..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Technologies Used (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Next.js, TypeScript, Tailwind CSS, MongoDB"
                    value={formTech}
                    onChange={(e) => setFormTech(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      GitHub Repository URL <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://github.com/..."
                      value={formGithub}
                      onChange={(e) => setFormGithub(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Live Deployment Demo URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://myproject.vercel.app"
                      value={formLive}
                      onChange={(e) => setFormLive(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Contributing Members (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Alice, Bob, Charlie"
                    value={formMembers}
                    onChange={(e) => setFormMembers(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-xs font-semibold shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Publishing..." : "Publish to Showcase"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedProject.domain}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">
                    {selectedProject.title}
                  </h3>
                  <p className="text-xs text-cyan-300 font-medium">
                    {selectedProject.tagline}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">
                    About the Project
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase text-gray-400 mb-2">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-gray-300"
                      >
                        <Code className="w-3.5 h-3.5 text-cyan-400" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <div>
                    <span className="text-xs text-gray-400">Team</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {selectedProject.teamName}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Published On</span>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedProject.members.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">
                      Team Contributors
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.members.map((m, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs text-gray-300 border border-slate-700"
                        >
                          👤 {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    Inspect Repository
                  </a>
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white font-medium text-xs shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Live Deployment
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
