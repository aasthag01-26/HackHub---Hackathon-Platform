import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  User,
  Github,
  Linkedin,
  Globe,
  Share2,
  Check,
  Award,
  Code2,
  ExternalLink,
  MapPin,
  School,
  Lock,
  ArrowLeft,
  Sparkles,
  Layers,
  FolderGit2,
} from "lucide-react";

interface ProjectItem {
  title: string;
  description: string;
  techStack: string[];
  projectUrl?: string;
  githubUrl?: string;
}

interface HackathonItem {
  name: string;
  role: string;
  achievement: string;
  year: string;
}

interface PublicProfileData {
  username: string;
  fullName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  education?: {
    institution?: string;
    degree?: string;
    graduationYear?: string;
  };
  skills: string[];
  domainsOfInterest: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  projects: ProjectItem[];
  hackathons: HackathonItem[];
}

export default function PublicProfilePage() {
  const router = useRouter();
  const { username } = router.query;

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!username) return;

    const uname = (username as string).toLowerCase();

    // 1. Immediately check local storage cache for instant sync
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(`hackhub_profile_${uname}`) || (uname === "me" ? localStorage.getItem("hackhub_current_profile") : null);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse cached profile", e);
        }
      }
    }

    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

    const fetchPublicProfile = async () => {
      try {
        setErrorMsg("");
        const res = await fetch(`${API_BASE}/api/profile/${uname}`);

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (typeof window !== "undefined") {
            localStorage.setItem(`hackhub_profile_${uname}`, JSON.stringify(data));
          }
        } else if (res.status === 403) {
          setErrorMsg("This student profile is private.");
        } else {
          // If in local mock or demo mode and not already loaded, fallback gracefully
          loadFallbackProfile(uname);
        }
      } catch (err) {
        console.error(err);
        loadFallbackProfile(uname);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const loadFallbackProfile = (uname: string) => {
    // If already populated from local storage, don't overwrite
    setProfile((prev) => {
      if (prev && prev.username.toLowerCase() === uname) return prev;
      const formattedName = uname.charAt(0).toUpperCase() + uname.slice(1);
      return {
        username: uname,
        fullName: formattedName,
        headline: "Full Stack Engineer & Hackathon Builder",
        bio: `Passionate student developer and collaborative builder on HackHub. Active in hackathons and open-source software engineering.`,
        location: "Delhi, India",
        education: {
          institution: "IGDTUW / University",
          degree: "B.Tech Computer Science",
          graduationYear: "2026",
        },
        skills: ["TypeScript", "Next.js", "React", "Node.js", "MongoDB", "TailwindCSS"],
        domainsOfInterest: ["Distributed Systems", "AI Agents", "Open Source Software"],
        socialLinks: {
          github: `https://github.com/${uname}`,
          linkedin: `https://linkedin.com/in/${uname}`,
        },
        projects: [
          {
            title: "HackHub Workspace",
            description: "Collaborative hackathon management platform with team chat, task boards, and resource hub.",
            techStack: ["Next.js", "Node.js", "MongoDB", "Socket.IO"],
            projectUrl: "https://intern-project-igdtuw.vercel.app",
            githubUrl: `https://github.com/${uname}/HackHub---Hackathon-Platform`,
          },
        ],
        hackathons: [
          {
            name: "HackHub Global Hackathon 2026",
            role: "Full Stack Developer",
            achievement: "Top Participant",
            year: "2026",
          },
        ],
      };
    });
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading developer portfolio...</p>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
          <Lock className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold">{errorMsg || "Student Profile Not Found"}</h2>
        <p className="text-gray-400 text-sm max-w-md">
          The requested profile does not exist or has been made private by the student.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to HackHub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b] text-white py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to HackHub
          </Link>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-gray-700 text-xs font-semibold transition-all shadow-md"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? "Copied" : "Share Portfolio"}
          </button>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#1e293b]/90 to-indigo-950/50 border border-cyan-500/20 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar / Monogram */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-cyan-500/20 shrink-0">
              {profile.fullName ? profile.fullName.charAt(0) : "H"}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-medium mb-2">
                  @{profile.username}
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                  {profile.fullName}
                </h1>
                <p className="text-indigo-300 font-medium text-sm md:text-base mt-1">
                  {profile.headline}
                </p>
              </div>

              {profile.bio && (
                <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Meta details */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-400 pt-2">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {profile.location}
                  </span>
                )}
                {profile.education?.institution && (
                  <span className="flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-cyan-400" />
                    {profile.education.institution}
                  </span>
                )}
              </div>

              {/* Social links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-all border border-gray-700"
                  >
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 text-xs font-semibold transition-all border border-blue-500/30"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
                {profile.socialLinks?.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-300 text-xs font-semibold transition-all border border-cyan-500/30"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Domains Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 space-y-4 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Technical Stack & Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 space-y-4 shadow-xl backdrop-blur-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Domains of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.domainsOfInterest?.map((domain, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              Showcase Projects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-indigo-500/50 transition-all backdrop-blur-md"
                >
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">{proj.title}</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {proj.techStack?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 border border-gray-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                    {proj.projectUrl && (
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 text-xs font-semibold transition-all border border-cyan-500/30"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                    )}
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-all border border-gray-700"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hackathons Section */}
        {profile.hackathons && profile.hackathons.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Hackathon Participations & Awards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.hackathons.map((hack, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#1e293b]/60 border border-gray-800 p-5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">{hack.name}</h4>
                    <p className="text-xs text-gray-400">{hack.role} • {hack.year}</p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                    {hack.achievement}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
