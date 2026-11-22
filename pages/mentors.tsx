import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
  ExternalLink,
  Github,
  PlusCircle,
  Star,
  UserCheck,
  Send,
  X,
  BookOpen,
  Layers,
  Award,
} from "lucide-react";

export interface FeedbackItem {
  _id?: string;
  milestone: string;
  feedback: string;
  rating: number;
  givenBy: string;
  createdAt?: string | Date;
}

export interface MentorshipRequestItem {
  _id: string;
  teamName: string;
  projectName: string;
  mentorId: string;
  mentorName: string;
  domain: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  requestMessage: string;
  projectRepoUrl?: string;
  projectDemoUrl?: string;
  feedbackHistory: FeedbackItem[];
  createdAt?: string | Date;
}

export interface MentorProfile {
  _id: string;
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  domains: string[];
  skills: string[];
  bio: string;
  experienceYears: number;
  availabilityStatus: "available" | "busy" | "unavailable";
  contactEmail: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

const DOMAINS = [
  "All",
  "AI / ML",
  "Web3 & Blockchain",
  "Cloud & DevOps",
  "Healthcare",
  "FinTech",
  "Mobile Apps",
  "Open Innovation",
];

const INITIAL_MENTORS: MentorProfile[] = [
  {
    _id: "mentor-1",
    name: "Dr. Alistair Vance",
    title: "Principal Research Scientist",
    company: "Google DeepMind",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    domains: ["AI / ML", "Healthcare", "Cloud & DevOps"],
    skills: ["PyTorch", "LLM Fine-tuning", "Autonomous Agents", "Distributed Training"],
    bio: "12+ years pioneering transformer architectures and biomedical computer vision models. Passionate about empowering student builders.",
    experienceYears: 12,
    availabilityStatus: "available",
    contactEmail: "alistair.vance@deepmind.example",
    githubUrl: "https://github.com/alistair-vance",
    linkedinUrl: "https://linkedin.com/in/alistair-vance",
  },
  {
    _id: "mentor-2",
    name: "Elena Rostova",
    title: "Lead Cryptography & Protocol Engineer",
    company: "Ethereum Foundation",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    domains: ["Web3 & Blockchain", "Cybersecurity"],
    skills: ["Solidity", "Zero-Knowledge Proofs", "Rust", "Smart Contract Security"],
    bio: "Core contributor to zk-Rollup scaling solutions and EVM security audits. Helping teams build safe decentralized systems.",
    experienceYears: 8,
    availabilityStatus: "available",
    contactEmail: "elena.rostova@protocol.example",
    githubUrl: "https://github.com/elena-rostova",
    linkedinUrl: "https://linkedin.com/in/elena-rostova",
  },
  {
    _id: "mentor-3",
    name: "Marcus Thorne",
    title: "Staff Cloud Platform Architect",
    company: "AWS / Open Infrastructure",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    domains: ["Cloud & DevOps", "Open Innovation", "FinTech"],
    skills: ["Kubernetes", "Terraform", "Serverless", "System Observability"],
    bio: "Designs resilient multi-region architectures handling 100k+ RPS. Specializes in optimizing build latency and developer velocity.",
    experienceYears: 10,
    availabilityStatus: "available",
    contactEmail: "marcus.thorne@cloud.example",
    githubUrl: "https://github.com/marcus-thorne",
    linkedinUrl: "https://linkedin.com/in/marcus-thorne",
  },
  {
    _id: "mentor-4",
    name: "Sophia Chen",
    title: "VP of Product Engineering",
    company: "Stripe",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    domains: ["FinTech", "Mobile Apps", "Web Development"],
    skills: ["React", "TypeScript", "Payment APIs", "Microfrontends"],
    bio: "Built global billing primitives and merchant checkout platforms. Loves reviewing user onboarding flows and API ergonomics.",
    experienceYears: 9,
    availabilityStatus: "busy",
    contactEmail: "sophia.chen@fintech.example",
    githubUrl: "https://github.com/sophia-chen",
    linkedinUrl: "https://linkedin.com/in/sophia-chen",
  },
];

const INITIAL_REQUESTS: MentorshipRequestItem[] = [
  {
    _id: "req-1",
    teamName: "NeuralWeavers",
    projectName: "BioPulse AI Diagnostics",
    mentorId: "mentor-1",
    mentorName: "Dr. Alistair Vance",
    domain: "Healthcare",
    status: "accepted",
    requestMessage:
      "We need architectural guidance on edge inference quantisation (INT8) and zero-shot hallucination guardrails.",
    projectRepoUrl: "https://github.com/NeuralWeavers/biopulse",
    projectDemoUrl: "https://biopulse-demo.vercel.app",
    feedbackHistory: [
      {
        _id: "fb-1",
        milestone: "System Architecture Review",
        feedback:
          "Solid foundation. Recommend switching the clinical reasoning prompt chain to use structured JSON schema enforcement before evaluating confidence scores.",
        rating: 5,
        givenBy: "Dr. Alistair Vance",
        createdAt: "2026-11-17T18:00:00Z",
      },
      {
        _id: "fb-2",
        milestone: "MVP Demo & Code Quality",
        feedback:
          "Latency benchmark improved from 1.4s to 320ms. Ensure proper error boundary handling if WebSocket drops.",
        rating: 4,
        givenBy: "Dr. Alistair Vance",
        createdAt: "2026-11-18T10:00:00Z",
      },
    ],
  },
  {
    _id: "req-2",
    teamName: "QuantumBlock",
    projectName: "AetherZero ZK-Rollup",
    mentorId: "mentor-2",
    mentorName: "Elena Rostova",
    domain: "Web3 & Blockchain",
    status: "pending",
    requestMessage:
      "Looking for a mentor to review our Groth16 circuit constraints and verify gas optimization benchmarks.",
    projectRepoUrl: "https://github.com/QuantumBlock/aether-zk",
    projectDemoUrl: "https://aetherzero.network",
    feedbackHistory: [],
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function MentorsPage() {
  const [activeTab, setActiveTab] = useState<"explore" | "requests" | "portal">("explore");
  const [mentors, setMentors] = useState<MentorProfile[]>(INITIAL_MENTORS);
  const [requests, setRequests] = useState<MentorshipRequestItem[]>(INITIAL_REQUESTS);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [targetRequest, setTargetRequest] = useState<MentorshipRequestItem | null>(null);
  const [showCreateMentorModal, setShowCreateMentorModal] = useState<boolean>(false);

  // Request Form
  const [reqTeamName, setReqTeamName] = useState("AlphaDevs");
  const [reqProjectName, setReqProjectName] = useState("Nexora Platform");
  const [reqDomain, setReqDomain] = useState("AI / ML");
  const [reqMessage, setReqMessage] = useState("");
  const [reqRepoUrl, setReqRepoUrl] = useState("");
  const [reqDemoUrl, setReqDemoUrl] = useState("");

  // Feedback Form
  const [fbMilestone, setFbMilestone] = useState("MVP Demo & Code Quality");
  const [fbContent, setFbContent] = useState("");
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbGivenBy, setFbGivenBy] = useState("Lead Mentor");

  // Mentor Creation Form
  const [newMentorName, setNewMentorName] = useState("");
  const [newMentorTitle, setNewMentorTitle] = useState("");
  const [newMentorCompany, setNewMentorCompany] = useState("");
  const [newMentorEmail, setNewMentorEmail] = useState("");
  const [newMentorBio, setNewMentorBio] = useState("");
  const [newMentorDomain, setNewMentorDomain] = useState("AI / ML");
  const [newMentorSkills, setNewMentorSkills] = useState("");

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMentors = await fetch(`${API_BASE}/api/mentors`);
        if (resMentors.ok) {
          const data = await resMentors.json();
          if (data.mentors && data.mentors.length > 0) setMentors(data.mentors);
        }
      } catch {
        // fallback to INITIAL_MENTORS
      }

      try {
        const resReqs = await fetch(`${API_BASE}/api/mentors/requests`);
        if (resReqs.ok) {
          const data = await resReqs.json();
          if (data.requests && data.requests.length > 0) setRequests(data.requests);
        }
      } catch {
        // fallback to INITIAL_REQUESTS
      }

      const savedM = localStorage.getItem("hackhub_mentors_data");
      if (savedM) {
        try {
          const p = JSON.parse(savedM);
          if (Array.isArray(p) && p.length > 0) setMentors(p);
        } catch {}
      }

      const savedR = localStorage.getItem("hackhub_mentorship_requests");
      if (savedR) {
        try {
          const p = JSON.parse(savedR);
          if (Array.isArray(p) && p.length > 0) setRequests(p);
        } catch {}
      }
    };

    fetchData();
  }, []);

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const domains = Array.isArray(m.domains) ? m.domains : [];
      const skills = Array.isArray(m.skills) ? m.skills : [];
      const matchDomain =
        selectedDomain === "All" ||
        domains.some((d) => d.toLowerCase() === selectedDomain.toLowerCase());
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        skills.some((s) => s.toLowerCase().includes(q));
      return matchDomain && matchSearch;
    });
  }, [mentors, selectedDomain, searchQuery]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    if (!reqTeamName.trim() || !reqProjectName.trim() || !reqMessage.trim()) {
      showToast("Please fill all required fields.");
      return;
    }

    const newReq: MentorshipRequestItem = {
      _id: "req-" + Date.now(),
      teamName: reqTeamName.trim(),
      projectName: reqProjectName.trim(),
      mentorId: selectedMentor._id,
      mentorName: selectedMentor.name,
      domain: reqDomain,
      status: "pending",
      requestMessage: reqMessage.trim(),
      projectRepoUrl: reqRepoUrl.trim(),
      projectDemoUrl: reqDemoUrl.trim(),
      feedbackHistory: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    localStorage.setItem("hackhub_mentorship_requests", JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/mentors/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq),
      });
    } catch {}

    setShowRequestModal(false);
    setReqMessage("");
    showToast(`Mentorship request sent to ${selectedMentor.name}!`);
    setActiveTab("requests");
  };

  const handleUpdateStatus = async (
    reqId: string,
    newStatus: "accepted" | "rejected" | "completed"
  ) => {
    const updated = requests.map((r) =>
      r._id === reqId ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
    localStorage.setItem("hackhub_mentorship_requests", JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/mentors/requests/${reqId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}

    showToast(`Request marked as ${newStatus}.`);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRequest) return;

    if (!fbContent.trim()) {
      showToast("Feedback message is required.");
      return;
    }

    const newFb: FeedbackItem = {
      _id: "fb-" + Date.now(),
      milestone: fbMilestone,
      feedback: fbContent.trim(),
      rating: Number(fbRating),
      givenBy: fbGivenBy.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = requests.map((r) => {
      if (r._id === targetRequest._id) {
        return {
          ...r,
          feedbackHistory: [...(r.feedbackHistory || []), newFb],
        };
      }
      return r;
    });

    setRequests(updated);
    localStorage.setItem("hackhub_mentorship_requests", JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/mentors/requests/${targetRequest._id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFb),
      });
    } catch {}

    setShowFeedbackModal(false);
    setFbContent("");
    showToast("Progress feedback recorded in team's permanent history!");
  };

  const handleRegisterMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName.trim() || !newMentorEmail.trim() || !newMentorTitle.trim()) {
      showToast("Please complete all required fields.");
      return;
    }

    const payload: MentorProfile = {
      _id: "mentor-" + Date.now(),
      name: newMentorName.trim(),
      title: newMentorTitle.trim(),
      company: newMentorCompany.trim() || "Independent Advisor",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
      domains: [newMentorDomain],
      skills: newMentorSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bio: newMentorBio.trim(),
      experienceYears: 5,
      availabilityStatus: "available",
      contactEmail: newMentorEmail.trim(),
    };

    const updated = [payload, ...mentors];
    setMentors(updated);
    localStorage.setItem("hackhub_mentors_data", JSON.stringify(updated));

    try {
      await fetch(`${API_BASE}/api/mentors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}

    setShowCreateMentorModal(false);
    setNewMentorName("");
    setNewMentorTitle("");
    setNewMentorEmail("");
    showToast("Mentor profile registered successfully!");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-indigo-400/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              Expert Mentorship & Feedback
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Mentor Connection & Reviews
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Connect with seasoned domain mentors, request architecture reviews, and maintain structured feedback history.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowCreateMentorModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-indigo-300 text-sm font-semibold transition"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              Become a Mentor
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 pb-3 overflow-x-auto">
          {[
            { id: "explore", label: "Explore Mentors", icon: BookOpen },
            { id: "requests", label: "My Team's Feedback Timeline", icon: Layers },
            { id: "portal", label: "Mentor Review Portal", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "explore" | "requests" | "portal")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "explore" && (
          <div>
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-4 md:p-6 mb-8 backdrop-blur">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-5">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mentor by name, company, or skill..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
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

                <div className="text-xs text-slate-400">
                  Showing <span className="font-bold text-white">{filteredMentors.length}</span> verified mentors
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Domain:
                </span>
                {DOMAINS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                      selectedDomain === d
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold"
                        : "bg-slate-900/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor._id}
                  className="bg-slate-800/50 border border-slate-700/70 hover:border-indigo-500/50 rounded-2xl p-6 transition-all transform hover:-translate-y-1 shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition truncate">
                          {mentor.name}
                        </h3>
                        <p className="text-xs text-indigo-300 font-medium truncate">
                          {mentor.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{mentor.company}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {mentor.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(mentor.domains || []).map((dom) => (
                        <span
                          key={dom}
                          className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[11px] font-semibold border border-indigo-500/20"
                        >
                          {dom}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-5">
                      {(mentor.skills || []).slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px]"
                        >
                          #{s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          mentor.availabilityStatus === "available"
                            ? "bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <span className="text-xs text-slate-400 capitalize">
                        {mentor.availabilityStatus || "available"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Request Mentorship
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Mentorship Connections & Progress History
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                Structured feedback records provided by your mentors across project development milestones.
              </p>

              {requests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="font-semibold text-slate-300">No active mentorship requests found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Head over to &quot;Explore Mentors&quot; and send a review request to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-white">{req.projectName}</h4>
                            <span className="text-xs text-indigo-400 font-medium">
                              ({req.teamName})
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Assigned Mentor:{" "}
                            <span className="text-slate-200 font-semibold">{req.mentorName}</span>{" "}
                            • Track: {req.domain}
                          </p>
                        </div>

                        <div>
                          {req.status === "accepted" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & Active
                            </span>
                          )}
                          {req.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" /> Pending Review
                            </span>
                          )}
                          {req.status === "rejected" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                              <XCircle className="w-3.5 h-3.5" /> Declined
                            </span>
                          )}
                          {req.status === "completed" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
                              <Award className="w-3.5 h-3.5" /> Mentorship Completed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 mb-5">
                        <span className="font-semibold text-slate-400 block mb-1">
                          Request Notes:
                        </span>
                        {req.requestMessage}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          Structured Feedback History ({req.feedbackHistory?.length || 0})
                        </h5>

                        {!req.feedbackHistory || req.feedbackHistory.length === 0 ? (
                          <div className="p-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                            Awaiting first milestone feedback from {req.mentorName}.
                          </div>
                        ) : (
                          <div className="space-y-3 relative pl-4 border-l-2 border-indigo-500/30">
                            {req.feedbackHistory.map((fb, idx) => (
                              <div
                                key={fb._id || idx}
                                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
                                      {fb.milestone}
                                    </span>
                                    <div className="flex text-amber-400 text-xs">
                                      {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-slate-500">
                                    By {fb.givenBy}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                  &quot;{fb.feedback}&quot;
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "portal" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Mentor Incoming Requests</h3>
              <p className="text-sm text-slate-400 mb-6">
                Review submitted requests from hackathon teams, approve mentorship engagements, and record progress feedback.
              </p>

              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="bg-slate-900/70 border border-slate-700/80 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-white text-base">{req.teamName}</h4>
                        <span className="text-xs text-slate-400">— {req.projectName}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px] border border-slate-700">
                          {req.domain}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                        &quot;{req.requestMessage}&quot;
                      </p>
                      {req.projectRepoUrl && (
                        <a
                          href={req.projectRepoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline mt-2 mr-3"
                        >
                          <Github className="w-3 h-3" /> View Repository
                        </a>
                      )}
                      {req.projectDemoUrl && (
                        <a
                          href={req.projectDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req._id, "accepted")}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req._id, "rejected")}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold border border-rose-500/30 transition"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {req.status === "accepted" && (
                        <button
                          onClick={() => {
                            setTargetRequest(req);
                            setShowFeedbackModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Provide Feedback
                        </button>
                      )}

                      {req.status === "rejected" && (
                        <span className="text-xs text-slate-500 font-medium">Declined</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showRequestModal && selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedMentor.avatarUrl}
                  alt={selectedMentor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-indigo-500/40"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">Request Mentorship</h3>
                  <p className="text-xs text-indigo-300 font-medium">
                    With {selectedMentor.name} ({selectedMentor.title})
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reqTeamName}
                      onChange={(e) => setReqTeamName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reqProjectName}
                      onChange={(e) => setReqProjectName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Domain
                  </label>
                  <select
                    value={reqDomain}
                    onChange={(e) => setReqDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {(selectedMentor.domains || DOMAINS.filter((d) => d !== "All")).map(
                      (dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Guidance Request & Key Challenges *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    placeholder="Specific areas where your team needs architectural, code quality, or domain guidance..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      GitHub Repository URL
                    </label>
                    <input
                      type="url"
                      value={reqRepoUrl}
                      onChange={(e) => setReqRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Live Preview URL
                    </label>
                    <input
                      type="url"
                      value={reqDemoUrl}
                      onChange={(e) => setReqDemoUrl(e.target.value)}
                      placeholder="https://...vercel.app"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showFeedbackModal && targetRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Record Milestone Feedback</h3>
                  <p className="text-xs text-slate-400">
                    For {targetRequest.teamName} — {targetRequest.projectName}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Development Milestone *
                  </label>
                  <select
                    value={fbMilestone}
                    onChange={(e) => setFbMilestone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Initial Project Ideation">Initial Project Ideation</option>
                    <option value="System Architecture Review">System Architecture Review</option>
                    <option value="MVP Demo & Code Quality">MVP Demo & Code Quality</option>
                    <option value="Final Pitch & Deployment Review">
                      Final Pitch & Deployment Review
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className={`p-2 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                          fbRating >= star
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${fbRating >= star ? "fill-amber-400" : ""}`}
                        />
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Structured Review Notes & Actionable Guidance *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={fbContent}
                    onChange={(e) => setFbContent(e.target.value)}
                    placeholder="Constructive feedback, edge cases spotted, performance bottlenecks, and recommendations..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mentor Signature
                  </label>
                  <input
                    type="text"
                    value={fbGivenBy}
                    onChange={(e) => setFbGivenBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold shadow-md"
                  >
                    Save to Feedback History
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCreateMentorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setShowCreateMentorModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Join as a Mentor</h3>
                  <p className="text-xs text-slate-400">
                    Share your expertise to guide hackathon participants.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRegisterMentor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newMentorName}
                      onChange={(e) => setNewMentorName(e.target.value)}
                      placeholder="e.g. Dr. Priya Sharma"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newMentorEmail}
                      onChange={(e) => setNewMentorEmail(e.target.value)}
                      placeholder="mentor@example.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newMentorTitle}
                      onChange={(e) => setNewMentorTitle(e.target.value)}
                      placeholder="e.g. Senior Machine Learning Engineer"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={newMentorCompany}
                      onChange={(e) => setNewMentorCompany(e.target.value)}
                      placeholder="e.g. Meta / Google / Stanford"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Primary Domain
                    </label>
                    <select
                      value={newMentorDomain}
                      onChange={(e) => setNewMentorDomain(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {DOMAINS.filter((d) => d !== "All").map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newMentorSkills}
                      onChange={(e) => setNewMentorSkills(e.target.value)}
                      placeholder="e.g. PyTorch, React, WebSockets"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bio & Guidance Interests
                  </label>
                  <textarea
                    rows={2}
                    value={newMentorBio}
                    onChange={(e) => setNewMentorBio(e.target.value)}
                    placeholder="Brief background and how you can support teams..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateMentorModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                  >
                    Publish Mentor Profile
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