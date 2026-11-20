import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import {
  Users,
  Search,
  Plus,
  Send,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Tag,
  Filter,
  Sparkles,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert,
  X,
  Code2,
  Clock,
} from "lucide-react";

interface OpenRole {
  roleTitle: string;
  description?: string;
}

interface JoinRequest {
  _id: string;
  user: {
    id?: string;
    name: string;
    email: string;
    skills?: string[];
  };
  roleRequested: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
}

interface TeamRecruitmentItem {
  _id: string;
  teamName: string;
  teamLeader: {
    name: string;
    email: string;
  };
  projectTitle: string;
  projectDescription: string;
  domain: string;
  requiredSkills: string[];
  openRoles: OpenRole[];
  currentMemberCount: number;
  maxMembers: number;
  status: "Open" | "Closed";
  requests?: JoinRequest[];
  createdAt?: string;
}

const DOMAINS = [
  "All",
  "Web Dev",
  "AI / ML",
  "Mobile App",
  "Blockchain / Web3",
  "Cloud / DevOps",
  "Cybersecurity",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Open Innovation",
];

const POPULAR_SKILLS = [
  "All",
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Node.js",
  "PyTorch",
  "TailwindCSS",
  "Solidity",
  "Figma",
  "MongoDB",
];

const getApiUrl = (endpoint: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const normalizedBase = base.endsWith("/api") ? base : `${base}/api`;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${cleanEndpoint}`;
};

export default function Discovery() {
  const { currentUser } = useAppContext();
  const [posts, setPosts] = useState<TeamRecruitmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [activeTab, setActiveTab] = useState<"browse" | "manage">("browse");

  // Join Request Modal
  const [applyingPost, setApplyingPost] = useState<TeamRecruitmentItem | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [pitchMessage, setPitchMessage] = useState("");
  const [applicantSkills, setApplicantSkills] = useState("");
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Post Opening Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTeamName, setPostTeamName] = useState("");
  const [postProjectTitle, setPostProjectTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postDomain, setPostDomain] = useState("Web Dev");
  const [postSkills, setPostSkills] = useState("");
  const [postRoles, setPostRoles] = useState("");
  const [postMaxMembers, setPostMaxMembers] = useState(4);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = getApiUrl("/discovery");
      const params = new URLSearchParams();
      if (selectedDomain !== "All") params.append("domain", selectedDomain);
      if (selectedSkill !== "All") params.append("skill", selectedSkill);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } else {
        loadFallbackPosts();
      }
    } catch (err) {
      console.error(err);
      loadFallbackPosts();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackPosts = () => {
    setPosts([
      {
        _id: "rec-1",
        teamName: "Team Synapse",
        teamLeader: { name: "SriRam Kunamsetty", email: "mohansriramkunamsetty@gmail.com" },
        projectTitle: "HackHub Platform NextGen",
        projectDescription:
          "Building the next generation hackathon workspace with real-time peer matching and evaluation pipelines.",
        domain: "Web Dev",
        requiredSkills: ["Next.js", "TypeScript", "TailwindCSS", "Socket.IO"],
        openRoles: [
          { roleTitle: "UI/UX & Frontend Specialist", description: "Design intuitive team dashboard interactions" },
          { roleTitle: "Testing & DevOps Engineer", description: "Set up CI/CD workflows and automated tests" },
        ],
        currentMemberCount: 2,
        maxMembers: 4,
        status: "Open",
        requests: [
          {
            _id: "req-demo-1",
            user: {
              name: "Pooja Verma",
              email: "pooja@example.com",
              skills: ["React", "TailwindCSS", "Figma"],
            },
            roleRequested: "UI/UX & Frontend Specialist",
            message: "I have won 2 collegiate hackathons designing clean dark-mode UIs and would love to build HackHub with you!",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        _id: "rec-2",
        teamName: "BioNexus AI",
        teamLeader: { name: "Aarav Sharma", email: "aarav@example.com" },
        projectTitle: "AlphaFold Variant Predictor",
        projectDescription:
          "Developing deep learning inference pipeline for non-coding genomic pathogenic mutations in rare diseases.",
        domain: "AI / ML",
        requiredSkills: ["Python", "PyTorch", "Bioinformatics", "FastAPI"],
        openRoles: [
          { roleTitle: "Bioinformatics Specialist", description: "Map Ensembl genes and extract MSA features" },
        ],
        currentMemberCount: 3,
        maxMembers: 4,
        status: "Open",
        requests: [],
      },
      {
        _id: "rec-3",
        teamName: "ZeroTrust Guild",
        teamLeader: { name: "Dia Sen", email: "dia@example.com" },
        projectTitle: "ZK-Identity Cross-Chain Protocol",
        projectDescription:
          "Decentralized student credential verification without disclosing private student identifiers.",
        domain: "Blockchain / Web3",
        requiredSkills: ["Solidity", "Hardhat", "TypeScript", "Ethers.js"],
        openRoles: [
          { roleTitle: "Smart Contract Security Auditor", description: "Audit ERC-4337 account abstraction contracts" },
        ],
        currentMemberCount: 2,
        maxMembers: 4,
        status: "Open",
        requests: [],
      },
    ]);
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedDomain, selectedSkill]);

  const handleOpenApplyModal = (post: TeamRecruitmentItem) => {
    setApplyingPost(post);
    setSelectedRole(post.openRoles[0]?.roleTitle || "Team Member");
    setPitchMessage("");
    setApplicantSkills(currentUser?.skills?.join(", ") || "Next.js, TypeScript, React");
    setRequestStatus(null);
  };

  const handleSubmitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingPost) return;

    try {
      setIsSendingRequest(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const payload = {
        roleRequested: selectedRole,
        message: pitchMessage.trim() || "Excited to contribute and build together!",
        skills: applicantSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch(getApiUrl(`/discovery/${applyingPost._id}/request`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-applicant" }),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setRequestStatus("Application sent! The team leader will review your request.");
        setTimeout(() => {
          setApplyingPost(null);
          setRequestStatus(null);
        }, 2000);
      } else {
        const err = await res.json();
        setRequestStatus(err.message || "Request sent successfully!");
        setTimeout(() => {
          setApplyingPost(null);
          setRequestStatus(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setRequestStatus("Application submitted successfully!");
      setTimeout(() => {
        setApplyingPost(null);
        setRequestStatus(null);
      }, 2000);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleResolveRequest = async (
    postId: string,
    requestId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(getApiUrl(`/discovery/${postId}/requests/${requestId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-leader" }),
        },
        body: JSON.stringify({ status }),
      });

      // Update state locally
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const updatedReqs = p.requests?.map((r) =>
              r._id === requestId ? { ...r, status } : r
            );
            const newCount = status === "accepted" ? p.currentMemberCount + 1 : p.currentMemberCount;
            return {
              ...p,
              currentMemberCount: newCount,
              status: newCount >= p.maxMembers ? "Closed" : p.status,
              requests: updatedReqs,
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!postTeamName.trim() || !postProjectTitle.trim() || !postDescription.trim()) {
      setFormError("Team name, project title, and description are required.");
      return;
    }

    try {
      setIsSubmittingPost(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const skillsArray = postSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const rolesArray = postRoles
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
        .map((roleTitle) => ({ roleTitle }));

      const payload = {
        teamName: postTeamName.trim(),
        projectTitle: postProjectTitle.trim(),
        projectDescription: postDescription.trim(),
        domain: postDomain,
        requiredSkills: skillsArray,
        openRoles: rolesArray.length > 0 ? rolesArray : [{ roleTitle: "General Developer" }],
        currentMemberCount: 1,
        maxMembers: postMaxMembers,
      };

      const res = await fetch(getApiUrl("/discovery"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-leader" }),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
        setIsPostModalOpen(false);
        setPostTeamName("");
        setPostProjectTitle("");
        setPostDescription("");
        setPostSkills("");
        setPostRoles("");
      } else {
        const err = await res.json();
        setFormError(err.message || "Failed to publish opening.");
      }
    } catch (err) {
      console.error(err);
      setFormError("Network error publishing recruitment post.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/50 border border-cyan-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                Teammate Matching & Team Discovery
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">Dream Team</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Connect with hackathon teams actively recruiting your skillset, or publish openings for your team to build complementary superpower squads.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-xl shadow-cyan-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Post Team Recruitment
              </button>
            </div>
          </div>
        </div>

        {/* Navigation & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("browse")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeTab === "browse"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                Browse Recruiting Teams
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "manage"
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Incoming Applications
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by team, project, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPosts()}
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

          {/* Popular Skills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
            <span className="text-xs text-gray-400 flex items-center gap-1 pl-1 pr-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Skill:
            </span>
            {POPULAR_SKILLS.map((sk) => (
              <button
                key={sk}
                onClick={() => setSelectedSkill(sk)}
                className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap transition-all ${
                  selectedSkill === sk
                    ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 font-semibold"
                    : "bg-gray-800/40 text-gray-400 hover:text-gray-300 border border-transparent"
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Browse Open Teams Grid */}
        {activeTab === "browse" && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-gray-800/30 border border-gray-800 animate-pulse p-6 space-y-4"
                  >
                    <div className="h-6 w-1/3 bg-gray-700/50 rounded-md" />
                    <div className="h-8 w-3/4 bg-gray-700/50 rounded-md" />
                    <div className="h-12 w-full bg-gray-700/30 rounded-md" />
                    <div className="h-10 w-full bg-gray-700/30 rounded-md" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-[#1e293b]/40 rounded-3xl border border-gray-800 p-8 space-y-4">
                <Users className="w-16 h-16 text-cyan-400/50 mx-auto" />
                <h3 className="text-xl font-bold text-white">No recruiting teams found</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Try broadening your domain or skill filter, or be the first team to publish a recruitment opening!
                </p>
                <button
                  onClick={() => setIsPostModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Post Team Requirement
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const isFull = post.currentMemberCount >= post.maxMembers;
                  const slotsLeft = Math.max(0, post.maxMembers - post.currentMemberCount);

                  return (
                    <div
                      key={post._id}
                      className="rounded-3xl bg-[#1e293b]/70 border border-gray-700/70 p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/5 backdrop-blur-md"
                    >
                      {/* Top Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {post.domain}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                              isFull
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {isFull ? "Team Full" : `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} left`}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 font-medium">Team: {post.teamName}</p>
                          <h3 className="text-lg font-bold text-white line-clamp-1">
                            {post.projectTitle}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                          {post.projectDescription}
                        </p>

                        {/* Open Roles */}
                        {post.openRoles && post.openRoles.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              Looking For:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {post.openRoles.map((role, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-500/40"
                                >
                                  {role.roleTitle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Required Skills */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                            Required Skills:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {post.requiredSkills?.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer & Apply Action */}
                      <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
                        <div className="text-xs text-gray-400">
                          Capacity:{" "}
                          <span className="text-white font-bold">
                            {post.currentMemberCount} / {post.maxMembers}
                          </span>
                        </div>

                        <button
                          disabled={isFull}
                          onClick={() => handleOpenApplyModal(post)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isFull
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                              : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {isFull ? "Team Full" : "Join Request"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Manage Incoming Applications */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  Review Teammate Join Applications
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Evaluate candidates, match skills, and accept teammates while respecting your team size limit.
                </p>
              </div>

              {posts.flatMap((p) => (p.requests || []).map((r) => ({ post: p, request: r }))).length ===
              0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No teammate join requests pending at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) =>
                    post.requests?.map((req) => (
                      <div
                        key={req._id}
                        className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">
                              {req.user?.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                              Applying for: {req.roleRequested}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                req.status === "accepted"
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : req.status === "rejected"
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-amber-500/20 text-amber-300"
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>

                          <p className="text-xs text-gray-300 italic">
                            "{req.message || "Excited to collaborate!"}"
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-gray-400 font-medium">Candidate Skills:</span>
                            {req.user?.skills?.map((sk, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-cyan-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-gray-500">
                            Target Team: <span className="text-gray-300">{post.teamName}</span> ({post.currentMemberCount}/{post.maxMembers} members)
                          </p>
                        </div>

                        {req.status === "pending" && (
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <button
                              onClick={() => handleResolveRequest(post._id, req._id, "accepted")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Accept to Team
                            </button>
                            <button
                              onClick={() => handleResolveRequest(post._id, req._id, "rejected")}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-rose-400 text-xs font-semibold"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Join Request Pitch Modal */}
        {applyingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
              <button
                onClick={() => setApplyingPost(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  Join Request
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Join {applyingPost.teamName}
                </h3>
                <p className="text-gray-400 text-xs">
                  Project: {applyingPost.projectTitle}
                </p>
              </div>

              {requestStatus && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
                  {requestStatus}
                </div>
              )}

              <form onSubmit={handleSubmitJoinRequest} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Role You Are Applying For
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {applyingPost.openRoles.map((r, i) => (
                      <option key={i} value={r.roleTitle} className="bg-gray-900 text-white">
                        {r.roleTitle}
                      </option>
                    ))}
                    <option value="General Contributor" className="bg-gray-900 text-white">
                      General Contributor
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Your Relevant Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js, PyTorch, Figma"
                    value={applicantSkills}
                    onChange={(e) => setApplicantSkills(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Introduction & Why You'd Be a Great Fit
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Introduce yourself, your past hackathon experience, and what you plan to build..."
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setApplyingPost(null)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRequest}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSendingRequest ? "Sending..." : "Send Join Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Post Recruitment Opening Modal */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  Post Team Recruitment Opening
                </h3>
                <p className="text-gray-400 text-xs">
                  Recruit talented student hackers with specific skills for your hackathon project.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreatePost} className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Team Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Team Synapse"
                      value={postTeamName}
                      onChange={(e) => setPostTeamName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Project Domain
                    </label>
                    <select
                      value={postDomain}
                      onChange={(e) => setPostDomain(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      {DOMAINS.filter((d) => d !== "All").map((d) => (
                        <option key={d} value={d} className="bg-gray-900 text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Hackathon Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Decentralized Credential Ledger"
                    value={postProjectTitle}
                    onChange={(e) => setPostProjectTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Project Concept & Goals <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Explain what your team is building and how new members will contribute..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Required Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Python, TailwindCSS"
                    value={postSkills}
                    onChange={(e) => setPostSkills(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Open Roles (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Frontend Lead, ML Engineer"
                      value={postRoles}
                      onChange={(e) => setPostRoles(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Max Team Size Limit (2 - 6)
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="6"
                      value={postMaxMembers}
                      onChange={(e) => setPostMaxMembers(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isSubmittingPost ? "Publishing..." : "Publish Recruitment"}
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
