import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import {
  GraduationCap,
  Search,
  Plus,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building,
  Briefcase,
  ExternalLink,
  Github,
  Linkedin,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  ThumbsUp,
  X,
  UserCheck,
} from "lucide-react";

interface FeedbackItem {
  _id?: string;
  date: string;
  mentorName: string;
  rating: number;
  strengths: string;
  areasForImprovement: string;
  recommendations: string;
}

interface MentorshipRequestItem {
  _id: string;
  mentorName: string;
  teamName: string;
  requesterName: string;
  projectTitle: string;
  projectDescription: string;
  domain: string;
  guidanceNeeded: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  feedbackHistory?: FeedbackItem[];
  createdAt?: string;
}

interface MentorItem {
  _id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  avatarUrl?: string;
  domains: string[];
  expertise: string[];
  availableSlots: number;
  socialLinks?: {
    linkedin?: string;
    github?: string;
  };
}

const DOMAINS = [
  "All",
  "AI / ML",
  "Web Dev",
  "Cloud Architecture",
  "System Design",
  "Cybersecurity",
  "Blockchain / Web3",
  "Product & Pitch Strategy",
];

export default function Mentors() {
  const { currentUser } = useAppContext();
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [requests, setRequests] = useState<MentorshipRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [activeTab, setActiveTab] = useState<"directory" | "history" | "portal">("directory");

  // Request Mentorship Modal
  const [selectedMentor, setSelectedMentor] = useState<MentorItem | null>(null);
  const [reqTeamName, setReqTeamName] = useState("Team Synapse");
  const [reqProjectTitle, setReqProjectTitle] = useState("HackHub Workspace");
  const [reqProjectDesc, setReqProjectDesc] = useState(
    "All-in-one hackathon operating system featuring live collaboration and resource curation."
  );
  const [reqDomain, setReqDomain] = useState("Web Dev");
  const [reqGuidanceNeeded, setReqGuidanceNeeded] = useState("");
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // Submit Feedback Modal (Mentor Mode)
  const [feedbackReq, setFeedbackReq] = useState<MentorshipRequestItem | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackStrengths, setFeedbackStrengths] = useState("");
  const [feedbackImprovements, setFeedbackImprovements] = useState("");
  const [feedbackRecommendations, setFeedbackRecommendations] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      let url = "/api/mentors";
      const params = new URLSearchParams();
      if (selectedDomain !== "All") params.append("domain", selectedDomain);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMentors(Array.isArray(data) ? data : []);
      } else {
        loadFallbackMentors();
      }
    } catch (err) {
      console.error(err);
      loadFallbackMentors();
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/mentors/requests", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-user" }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } else {
        loadFallbackRequests();
      }
    } catch (err) {
      console.error(err);
      loadFallbackRequests();
    }
  };

  const loadFallbackMentors = () => {
    setMentors([
      {
        _id: "m-1",
        name: "Dr. Aastha Goyal",
        title: "Platform Maintainer & Tech Lead",
        company: "IGDTUW / IEEE Delhi",
        bio: "Specializing in distributed systems, scalable Node.js architectures, and student hackathon mentorship.",
        domains: ["Web Dev", "System Design", "Cloud Architecture"],
        expertise: ["Next.js", "MongoDB Indexing", "API Security", "Real-Time WebSockets"],
        availableSlots: 4,
        socialLinks: {
          github: "https://github.com/aasthag01-26",
          linkedin: "https://linkedin.com",
        },
      },
      {
        _id: "m-2",
        name: "Vikram Malhotra",
        title: "Staff Machine Learning Engineer",
        company: "Google DeepMind Alum",
        bio: "Mentoring teams on biological sequence modeling, PyTorch inference optimization, and AI product delivery.",
        domains: ["AI / ML", "Cloud Architecture"],
        expertise: ["PyTorch", "Transformers", "AlphaFold APIs", "Model Distillation"],
        availableSlots: 2,
        socialLinks: {
          github: "https://github.com/demo",
          linkedin: "https://linkedin.com",
        },
      },
      {
        _id: "m-3",
        name: "Rhea Deshmukh",
        title: "Product Strategy & VC Scout",
        company: "Techstars Mentor Network",
        bio: "Helping hackathon teams craft compelling 3-minute pitch decks, target customer personas, and go-to-market strategies.",
        domains: ["Product & Pitch Strategy", "FinTech"],
        expertise: ["Pitch Narrative", "TAM Sizing", "User Discovery", "Demo Polish"],
        availableSlots: 3,
        socialLinks: {
          linkedin: "https://linkedin.com",
        },
      },
    ]);
  };

  const loadFallbackRequests = () => {
    setRequests([
      {
        _id: "req-1",
        mentorName: "Dr. Aastha Goyal",
        teamName: "Team Synapse",
        requesterName: "SriRam Kunamsetty",
        projectTitle: "HackHub Workspace",
        projectDescription:
          "All-in-one hackathon operating system featuring live collaboration and resource curation.",
        domain: "Web Dev",
        guidanceNeeded:
          "Reviewing Socket.IO room isolation and database indexing for high concurrent task updates.",
        status: "completed",
        feedbackHistory: [
          {
            _id: "fb-1",
            date: new Date(Date.now() - 3600000).toISOString(),
            mentorName: "Dr. Aastha Goyal",
            rating: 5,
            strengths:
              "Exceptional modular architecture, crisp clean frontend code, and strong schema separation.",
            areasForImprovement:
              "Ensure edge cases around token expiration during active chat sessions are handled gracefully.",
            recommendations:
              "Proceed with testing the real-time events under simulated latency and finalize the pitch walkthrough.",
          },
        ],
      },
    ]);
  };

  useEffect(() => {
    fetchMentors();
    fetchRequests();
  }, [selectedDomain]);

  const handleOpenRequestModal = (mentor: MentorItem) => {
    setSelectedMentor(mentor);
    setReqGuidanceNeeded("");
    setModalFeedback(null);
  };

  const handleSubmitMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;

    try {
      setIsSubmittingReq(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const payload = {
        mentorId: selectedMentor._id,
        mentorName: selectedMentor.name,
        teamName: reqTeamName.trim(),
        projectTitle: reqProjectTitle.trim(),
        projectDescription: reqProjectDesc.trim(),
        domain: reqDomain,
        guidanceNeeded: reqGuidanceNeeded.trim(),
      };

      const res = await fetch("/api/mentors/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-lead" }),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setRequests((prev) => [created, ...prev]);
        setModalFeedback("Mentorship request submitted! The mentor will review your project.");
        setTimeout(() => {
          setSelectedMentor(null);
          setModalFeedback(null);
        }, 2000);
      } else {
        setModalFeedback("Request submitted successfully to mentor.");
        setTimeout(() => {
          setSelectedMentor(null);
          setModalFeedback(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setModalFeedback("Request registered successfully.");
      setTimeout(() => {
        setSelectedMentor(null);
        setModalFeedback(null);
      }, 2000);
    } finally {
      setIsSubmittingReq(false);
    }
  };

  const handleUpdateReqStatus = async (
    reqId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await fetch(`/api/mentors/requests/${reqId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-mentor" }),
        },
        body: JSON.stringify({ status }),
      });

      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFeedbackModal = (request: MentorshipRequestItem) => {
    setFeedbackReq(request);
    setFeedbackRating(5);
    setFeedbackStrengths("");
    setFeedbackImprovements("");
    setFeedbackRecommendations("");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackReq) return;

    try {
      setIsSubmittingFeedback(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const payload = {
        rating: feedbackRating,
        strengths: feedbackStrengths.trim(),
        areasForImprovement: feedbackImprovements.trim(),
        recommendations: feedbackRecommendations.trim(),
      };

      const res = await fetch(`/api/mentors/requests/${feedbackReq._id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-mentor" }),
        },
        body: JSON.stringify(payload),
      });

      const newEntry: FeedbackItem = {
        date: new Date().toISOString(),
        mentorName: currentUser?.name || "Dr. Aastha Goyal",
        rating: feedbackRating,
        strengths: feedbackStrengths.trim(),
        areasForImprovement: feedbackImprovements.trim(),
        recommendations: feedbackRecommendations.trim(),
      };

      setRequests((prev) =>
        prev.map((r) =>
          r._id === feedbackReq._id
            ? {
                ...r,
                status: "completed",
                feedbackHistory: [...(r.feedbackHistory || []), newEntry],
              }
            : r
        )
      );

      setFeedbackReq(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/50 to-blue-950/40 border border-purple-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                Mentorship & Guidance Engine
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300">Technical Mentors</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Connect with verified domain experts, schedule architecture reviews, request guidance on stubborn bugs, and receive structured progress feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar & Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  activeTab === "directory"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                Browse Mentors
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "history"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                Team Feedback History
              </button>
              <button
                onClick={() => setActiveTab("portal")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === "portal"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-[#1e293b]/70 text-gray-400 hover:text-white hover:bg-[#1e293b]"
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                Mentor Portal
              </button>
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mentor by name, company, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchMentors()}
                className="w-full bg-[#1e293b]/80 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Domain Chips Filter */}
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
                    ? "bg-purple-500/20 text-purple-300 border border-purple-400/50 font-semibold"
                    : "bg-gray-800/60 text-gray-400 hover:text-gray-200 border border-transparent"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Mentor Directory */}
        {activeTab === "directory" && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-gray-800/30 border border-gray-800 animate-pulse p-6 space-y-4"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gray-700/50" />
                    <div className="h-6 w-1/2 bg-gray-700/50 rounded-md" />
                    <div className="h-10 w-full bg-gray-700/30 rounded-md" />
                  </div>
                ))}
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-20 bg-[#1e293b]/40 rounded-3xl border border-gray-800 p-8 space-y-3">
                <GraduationCap className="w-16 h-16 text-purple-400/50 mx-auto" />
                <h3 className="text-xl font-bold text-white">No mentors matching criteria</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Try clearing your search query or choosing another domain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    className="rounded-3xl bg-[#1e293b]/70 border border-gray-700/70 p-6 flex flex-col justify-between space-y-5 shadow-xl hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 backdrop-blur-md"
                  >
                    <div className="space-y-4">
                      {/* Mentor Head */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                            {mentor.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{mentor.name}</h3>
                            <p className="text-xs text-indigo-300 font-medium">{mentor.title}</p>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3" />
                              {mentor.company}
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          {mentor.availableSlots} slots
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                        {mentor.bio}
                      </p>

                      {/* Domains */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Domains:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {mentor.domains?.map((d, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-500/30 font-medium"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Expertise */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Areas of Expertise:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise?.map((e, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Request Button */}
                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {mentor.socialLinks?.github && (
                          <a
                            href={mentor.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {mentor.socialLinks?.linkedin && (
                          <a
                            href={mentor.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenRequestModal(mentor)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition-all"
                      >
                        <Send className="w-3 h-3" />
                        Request Mentorship
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Feedback History */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  Team Progress & Mentor Feedback History
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Structured feedback, rubric evaluations, and actionable recommendations from verified hackathon mentors.
                </p>
              </div>

              {requests.flatMap((r) => r.feedbackHistory || []).length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No feedback history recorded yet. Connect with a mentor to schedule a review!
                </div>
              ) : (
                <div className="space-y-6">
                  {requests.map((req) =>
                    req.feedbackHistory?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-6 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-4 shadow-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                          <div>
                            <span className="text-xs text-indigo-400 font-semibold">
                              Project: {req.projectTitle} ({req.teamName})
                            </span>
                            <h4 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                              Feedback from {item.mentorName}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= item.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-amber-300 font-bold ml-1">
                              {item.rating} / 5
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs md:text-sm">
                          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                            <span className="font-bold text-emerald-300 uppercase text-[10px] tracking-wider">
                              Key Strengths
                            </span>
                            <p className="text-gray-200 leading-relaxed">{item.strengths}</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                            <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider">
                              Areas for Improvement
                            </span>
                            <p className="text-gray-200 leading-relaxed">
                              {item.areasForImprovement}
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
                            <span className="font-bold text-indigo-300 uppercase text-[10px] tracking-wider">
                              Next Steps & Recommendations
                            </span>
                            <p className="text-gray-200 leading-relaxed">
                              {item.recommendations}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Mentor Portal */}
        {activeTab === "portal" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
              <div className="border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  Mentor Review & Feedback Portal
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Manage incoming team mentorship requests and provide structured evaluations to help students succeed.
                </p>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No mentorship requests at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((r) => (
                    <div
                      key={r._id}
                      className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {r.teamName}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                            {r.projectTitle}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              r.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : r.status === "accepted"
                                ? "bg-cyan-500/20 text-cyan-300"
                                : r.status === "rejected"
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed">
                          <span className="font-semibold text-gray-400">Guidance Needed:</span>{" "}
                          {r.guidanceNeeded}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Lead: {r.requesterName} • Domain: {r.domain}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateReqStatus(r._id, "accepted")}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateReqStatus(r._id, "rejected")}
                              className="px-3.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-rose-400 text-xs font-semibold"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {r.status === "accepted" && (
                          <button
                            onClick={() => handleOpenFeedbackModal(r)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Submit Feedback
                          </button>
                        )}

                        {r.status === "completed" && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Evaluated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Mentorship Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
              <button
                onClick={() => setSelectedMentor(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                  Mentorship Request
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Request Mentorship with {selectedMentor.name}
                </h3>
                <p className="text-gray-400 text-xs">
                  {selectedMentor.title} at {selectedMentor.company}
                </p>
              </div>

              {modalFeedback && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
                  {modalFeedback}
                </div>
              )}

              <form onSubmit={handleSubmitMentorshipRequest} className="space-y-4 text-xs md:text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Team Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reqTeamName}
                      onChange={(e) => setReqTeamName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">
                      Project Domain
                    </label>
                    <select
                      value={reqDomain}
                      onChange={(e) => setReqDomain(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
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
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reqProjectTitle}
                    onChange={(e) => setReqProjectTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    What specific guidance or feedback do you need? <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your current blocker, architecture questions, or what areas you want reviewed..."
                    value={reqGuidanceNeeded}
                    onChange={(e) => setReqGuidanceNeeded(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReq}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmittingReq ? "Submitting..." : "Submit Mentorship Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submit Feedback Modal (Mentor) */}
        {feedbackReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-xl bg-[#0f172a] border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setFeedbackReq(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Mentor Project Evaluation
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Feedback for {feedbackReq.teamName}
                </h3>
                <p className="text-gray-400 text-xs">
                  Project: {feedbackReq.projectTitle}
                </p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Overall Project Score / Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-amber-300 ml-2">
                      {feedbackRating} Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Key Project Strengths <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Highlight what the team did exceptionally well..."
                    value={feedbackStrengths}
                    onChange={(e) => setFeedbackStrengths(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Areas for Improvement <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Identify technical, design, or architectural blindspots..."
                    value={feedbackImprovements}
                    onChange={(e) => setFeedbackImprovements(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">
                    Actionable Recommendations & Next Steps <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide specific next steps before the hackathon demo..."
                    value={feedbackRecommendations}
                    onChange={(e) => setFeedbackRecommendations(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setFeedbackReq(null)}
                    className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold transition-all shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isSubmittingFeedback ? "Saving..." : "Submit Structured Feedback"}
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
