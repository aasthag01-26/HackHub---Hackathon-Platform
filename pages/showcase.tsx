import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import {
  Rocket,
  Search,
  Plus,
  Heart,
  Bookmark,
  ExternalLink,
  Github,
  Users,
  Tag,
  Filter,
  Share2,
  Check,
  Code2,
  Sparkles,
  Info,
  X,
  Layers,
  Flame,
} from "lucide-react";

interface ProjectMember {
  name: string;
  role?: string;
}

interface ProjectItem {
  _id: string;
  title: string;
  tagline?: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  imageUrl?: string;
  teamName?: string;
  creator: {
    id?: string;
    name: string;
    email?: string;
  };
  members?: ProjectMember[];
  likesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
}

const CATEGORIES = [
  "All",
  "Web Dev",
  "AI / ML",
  "Mobile App",
  "Blockchain / Web3",
  "Cloud / DevOps",
  "Open Source",
  "HealthTech",
  "FinTech",
  "EdTech",
  "IoT & Hardware",
];

const PRESET_GRADIENTS = [
  "from-blue-600 via-indigo-600 to-purple-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-pink-500 via-rose-600 to-amber-600",
  "from-violet-600 via-purple-700 to-indigo-800",
  "from-cyan-500 via-blue-600 to-indigo-700",
];

const getApiUrl = (endpoint: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const normalizedBase = base.endsWith("/api") ? base : `${base}/api`;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${cleanEndpoint}`;
};

export default function Showcase() {
  const { currentUser } = useAppContext();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"all" | "popular" | "my" | "bookmarked">("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formTagline, setFormTagline] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Web Dev");
  const [formTechStack, setFormTechStack] = useState("");
  const [formGithubUrl, setFormGithubUrl] = useState("");
  const [formLiveDemoUrl, setFormLiveDemoUrl] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formTeamName, setFormTeamName] = useState("");
  const [formMembers, setFormMembers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let url = getApiUrl("/projects");
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (activeTab === "popular") params.append("sort", "popular");

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } else {
        // Fallback demo projects if backend DB is cold
        loadFallbackProjects();
      }
    } catch (err) {
      console.error("Failed to load projects", err);
      loadFallbackProjects();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackProjects = () => {
    setProjects([
      {
        _id: "demo-1",
        title: "HackHub Workspace",
        tagline: "Collaborative real-time hackathon management portal for student innovators.",
        description:
          "An all-in-one hackathon platform featuring team chats, live task delegation, interactive pitch tools, and public project showcases.",
        category: "Web Dev",
        techStack: ["Next.js", "TypeScript", "Node.js", "MongoDB", "TailwindCSS"],
        githubUrl: "https://github.com/aasthag01-26/HackHub---Hackathon-Platform",
        liveDemoUrl: "https://intern-project-igdtuw.vercel.app",
        imageUrl: "",
        teamName: "Core HackHub Team",
        creator: { name: "SriRam Kunamsetty", email: "mohansriramkunamsetty@gmail.com" },
        members: [
          { name: "SriRam Kunamsetty", role: "Full Stack Engineer" },
          { name: "Aastha Goyal", role: "Project Maintainer" },
        ],
        likesCount: 24,
        isLiked: true,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "demo-2",
        title: "AlphaGenius AI Medical Assistant",
        tagline: "Genomics variant impact analyzer and protein folding visualization copilot.",
        description:
          "Leverages deep learning for early structural diagnosis and clinical genetic variant interpretation with interactive 3D protein models.",
        category: "AI / ML",
        techStack: ["Python", "PyTorch", "FastAPI", "React", "AlphaFold API"],
        githubUrl: "https://github.com/demo/alphagenius",
        liveDemoUrl: "https://alphagenius-demo.vercel.app",
        imageUrl: "",
        teamName: "NeuroBiotech Innovators",
        creator: { name: "Dr. Elena Vance", email: "elena@example.com" },
        members: [
          { name: "Elena Vance", role: "AI Researcher" },
          { name: "Marcus Brody", role: "Bioinformatician" },
        ],
        likesCount: 18,
        isLiked: false,
        isBookmarked: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: "demo-3",
        title: "VeriChain EduCred",
        tagline: "Decentralized verifiable academic credentials and hackathon certificates.",
        description:
          "Zero-knowledge proof verification for collegiate degrees, hackathon medals, and micro-credentials issued on Polygon.",
        category: "Blockchain / Web3",
        techStack: ["Solidity", "Hardhat", "Ethers.js", "Next.js", "IPFS"],
        githubUrl: "https://github.com/demo/verichain",
        liveDemoUrl: "https://verichain.example.org",
        imageUrl: "",
        teamName: "CipherGuild",
        creator: { name: "Alex Zhao", email: "alex@example.com" },
        members: [{ name: "Alex Zhao", role: "Smart Contract Dev" }],
        likesCount: 12,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleToggleLike = async (projectId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId = currentUser?.id || "demo-user";

    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => {
        if (p._id === projectId) {
          const wasLiked = !!p.isLiked;
          return {
            ...p,
            isLiked: !wasLiked,
            likesCount: wasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
          };
        }
        return p;
      })
    );

    try {
      await fetch(getApiUrl(`/projects/${projectId}/like`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": userId }),
        },
      });
    } catch (err) {
      console.error("Like toggle failed", err);
    }
  };

  const handleToggleBookmark = async (projectId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userId = currentUser?.id || "demo-user";

    setProjects((prev) =>
      prev.map((p) => {
        if (p._id === projectId) {
          return { ...p, isBookmarked: !p.isBookmarked };
        }
        return p;
      })
    );

    try {
      await fetch(getApiUrl(`/projects/${projectId}/bookmark`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": userId }),
        },
      });
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const handleShare = (project: ProjectItem) => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/showcase#${project._id}` : "";
    navigator.clipboard.writeText(url);
    setCopiedId(project._id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePublishProject = async (e: React.FormEvent) => {
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

    try {
      setIsSubmitting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const authorName = currentUser?.name || "SriRam Kunamsetty";
      const authorEmail = currentUser?.email || "mohansriramkunamsetty@gmail.com";

      const stackArray = formTechStack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const memberArray = formMembers
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)
        .map((name) => ({ name, role: "Contributor" }));

      const payload = {
        title: formTitle.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        category: formCategory,
        techStack: stackArray,
        githubUrl: formGithubUrl.trim(),
        liveDemoUrl: formLiveDemoUrl.trim(),
        imageUrl: formImageUrl.trim(),
        teamName: formTeamName.trim() || `${authorName}'s Team`,
        creator: {
          name: authorName,
          email: authorEmail,
        },
        members: memberArray.length > 0 ? memberArray : [{ name: authorName, role: "Lead Developer" }],
      };

      const res = await fetch(getApiUrl("/projects"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-user", "x-user-name": authorName }),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [created, ...prev]);
        setIsSubmitModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormTagline("");
        setFormDescription("");
        setFormTechStack("");
        setFormGithubUrl("");
        setFormLiveDemoUrl("");
        setFormImageUrl("");
        setFormTeamName("");
        setFormMembers("");
      } else {
        const err = await res.json();
        setFormError(err.message || "Failed to publish project.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error while submitting project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter projects by activeTab
  const displayedProjects = useMemo(() => {
    return projects.filter((p) => {
      if (activeTab === "bookmarked") return p.isBookmarked;
      if (activeTab === "my") {
        const userName = currentUser?.name || "SriRam";
        return (
          p.creator?.name?.toLowerCase().includes(userName.toLowerCase()) ||
          p.members?.some((m) => m.name.toLowerCase().includes(userName.toLowerCase()))
        );
      }
      return true;
    });
  }, [projects, activeTab, currentUser]);

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-purple-900/60 border border-indigo-500/30 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                Community Showcase
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Hackathon <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Project Gallery</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Discover groundbreaking prototypes, open-source innovations, and finished hackathon applications built by student teams. Showcase your creations and inspire the community.
              </p>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Publish Project
            </button>
          </div>
        </div>

        {/* Search & Tabs Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setActiveTab("popular")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "popular"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <Flame className="w-4 h-4 text-amber-400" />
                Most Popular
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeTab === "my"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                My Submissions
              </button>
              <button
                onClick={() => setActiveTab("bookmarked")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "bookmarked"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <Bookmark className="w-4 h-4 text-cyan-400" />
                Bookmarked
              </button>
            </div>

            {/* Keyword Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, technologies, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1e293b]/80 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </form>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            <span className="text-xs text-gray-400 flex items-center gap-1 pl-1 pr-2">
              <Filter className="w-3.5 h-3.5" /> Domain:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-semibold"
                    : "bg-gray-800/60 text-gray-400 hover:text-gray-200 border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-gray-800/40 border border-gray-800 animate-pulse p-6 space-y-4"
              >
                <div className="h-40 bg-gray-700/50 rounded-xl" />
                <div className="h-6 w-3/4 bg-gray-700/50 rounded-md" />
                <div className="h-4 w-full bg-gray-700/40 rounded-md" />
                <div className="h-8 w-1/2 bg-gray-700/40 rounded-md" />
              </div>
            ))}
          </div>
        ) : displayedProjects.length === 0 ? (
          <div className="text-center py-20 bg-[#1e293b]/40 rounded-3xl border border-gray-800 p-8 space-y-4">
            <Layers className="w-16 h-16 text-indigo-400/60 mx-auto" />
            <h3 className="text-xl font-bold text-white">No projects found</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              There are no projects matching your active category or search query. Be the pioneer and publish the first project!
            </p>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Publish a Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProjects.map((project, idx) => {
              const gradientClass = PRESET_GRADIENTS[idx % PRESET_GRADIENTS.length];
              return (
                <div
                  key={project._id}
                  id={project._id}
                  className="group flex flex-col justify-between rounded-2xl bg-[#1e293b]/70 border border-gray-700/60 hover:border-indigo-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Card Cover Banner */}
                  <div className="relative h-44 overflow-hidden bg-gray-900">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradientClass} p-6 flex flex-col justify-between`}>
                        <div className="flex justify-between items-start">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-black/40 text-cyan-300 backdrop-blur-sm border border-white/10">
                            {project.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleBookmark(project._id)}
                              className={`p-2 rounded-lg backdrop-blur-md transition-all ${
                                project.isBookmarked
                                  ? "bg-cyan-500 text-white shadow-md"
                                  : "bg-black/30 text-white/80 hover:bg-black/50 hover:text-white"
                              }`}
                              title={project.isBookmarked ? "Remove Bookmark" : "Bookmark Project"}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleShare(project)}
                              className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white backdrop-blur-md transition-all"
                              title="Copy Share Link"
                            >
                              {copiedId === project._id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-bold text-xl drop-shadow-md line-clamp-1">
                            {project.title}
                          </p>
                          <p className="text-white/80 text-xs drop-shadow line-clamp-1">
                            by {project.teamName || project.creator?.name || "Independent"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                        {project.tagline || project.description}
                      </p>

                      {/* Tech Stack Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.techStack?.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-800 text-indigo-300 border border-gray-700/60"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack?.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400">
                            +{project.techStack.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Team & Creator Info */}
                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                        <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{project.teamName || project.creator?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleLike(project._id)}
                          className={`flex items-center gap-1 transition-all ${
                            project.isLiked ? "text-rose-400 font-bold" : "text-gray-400 hover:text-rose-400"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              project.isLiked ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                          <span>{project.likesCount || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      {project.liveDemoUrl ? (
                        <a
                          href={project.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Live Demo
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-semibold transition-all"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Overview
                        </button>
                      )}

                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-all"
                        >
                          <Github className="w-3.5 h-3.5" />
                          Code
                        </a>
                      ) : (
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
                        >
                          Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit Project Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-cyan-400" />
                  Publish Project to Showcase
                </h3>
                <p className="text-gray-400 text-xs md:text-sm">
                  Share your hackathon creation with judges, mentors, and fellow student developers.
                </p>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handlePublishProject} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HackHub Workspace"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Domain / Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c} className="bg-gray-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Team Name</label>
                    <input
                      type="text"
                      placeholder="e.g. ByteBrigade"
                      value={formTeamName}
                      onChange={(e) => setFormTeamName(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Tagline (One-Liner)</label>
                  <input
                    type="text"
                    placeholder="A quick summary of what your application does"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Full Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain the problem solved, architecture, and core features..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Technologies Used (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Node.js, TailwindCSS, MongoDB"
                    value={formTechStack}
                    onChange={(e) => setFormTechStack(e.target.value)}
                    className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">GitHub Repository Link</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formGithubUrl}
                      onChange={(e) => setFormGithubUrl(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Live Demo / Deployment Link</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formLiveDemoUrl}
                      onChange={(e) => setFormLiveDemoUrl(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Screenshot / Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Contributing Members (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alice, Bob, Charlie"
                      value={formMembers}
                      onChange={(e) => setFormMembers(e.target.value)}
                      className="w-full bg-gray-900/90 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Publishing..." : "Publish to Showcase"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedProject.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {selectedProject.title}
                </h2>
                {selectedProject.tagline && (
                  <p className="text-indigo-300 font-medium text-sm">
                    {selectedProject.tagline}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                  About this project
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.techStack?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 text-cyan-300 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProject.members && selectedProject.members.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                    Team Members
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProject.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-white">{m.name}</span>
                        <span className="text-gray-400">{m.role || "Member"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
                {selectedProject.liveDemoUrl && (
                  <a
                    href={selectedProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Live Deployment
                  </a>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm transition-all"
                  >
                    <Github className="w-4 h-4" />
                    GitHub Repo
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
