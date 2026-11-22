import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import Link from "next/link";
import {
  User,
  Github,
  Linkedin,
  Globe,
  Share2,
  Check,
  Plus,
  Trash2,
  Shield,
  Eye,
  Award,
  Code2,
  FolderGit2,
  ExternalLink,
  Save,
  Sparkles,
  School,
  MapPin,
  Lock,
} from "lucide-react";

interface ProjectItem {
  title: string;
  description: string;
  techStack: string[];
  projectUrl: string;
  githubUrl: string;
}

interface HackathonItem {
  name: string;
  role: string;
  achievement: string;
  year: string;
}

export default function ProfilePage() {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states - dynamically derived from currentUser
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("Full Stack Developer & Hackathon Innovator");
  const [bio, setBio] = useState(
    "Passionate software engineer building robust distributed platforms and full-stack hackathon applications."
  );
  const [avatarUrl, setAvatarUrl] = useState("");
  const [location, setLocation] = useState("Delhi, India");
  const [institution, setInstitution] = useState("IGDTUW / University");
  const [degree, setDegree] = useState("B.Tech Computer Science");
  const [graduationYear, setGraduationYear] = useState("2026");

  // Skills & Domains
  const [skills, setSkills] = useState<string[]>([
    "TypeScript",
    "Next.js",
    "React",
    "Node.js",
    "MongoDB",
    "TailwindCSS",
    "Python",
    "Git / GitHub",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const [domains, setDomains] = useState<string[]>([
    "Web Application Architecture",
    "Artificial Intelligence",
    "Open Source Tooling",
    "Hackathon Platforms",
  ]);
  const [newDomain, setNewDomain] = useState("");

  // Socials
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Initialize or pre-fill from currentUser & localStorage
  useEffect(() => {
    const rawName = currentUser?.name || currentUser?.username || "Student Hacker";
    const initialUname = (currentUser?.username || rawName.toLowerCase().replace(/\s+/g, "")).toLowerCase();
    
    // Check localStorage first
    let loadedFromLocal = false;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hackhub_current_profile") || localStorage.getItem(`hackhub_profile_${initialUname}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          applyProfileData(parsed);
          loadedFromLocal = true;
        } catch (e) {
          console.error("Failed to parse cached profile", e);
        }
      }
    }

    if (!loadedFromLocal) {
      setUsername(initialUname);
      setFullName(rawName);
      if (currentUser?.email) setBio(`Passionate developer (${currentUser.email}) building innovative projects on HackHub.`);
      if (currentUser?.username) setGithubUrl(`https://github.com/${currentUser.username}`);
    }

    fetchProfile(initialUname);
  }, [currentUser]);

  // Projects & Hackathons
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      title: "HackHub Platform",
      description: "An integrated hackathon operating system featuring team coordination, live chat, and resource management.",
      techStack: ["Next.js", "Node.js", "MongoDB", "Socket.IO"],
      projectUrl: "https://intern-project-igdtuw.vercel.app",
      githubUrl: "https://github.com/SriRamkunamsetty/HackHub---Hackathon-Platform",
    },
  ]);

  const [hackathons, setHackathons] = useState<HackathonItem[]>([
    {
      name: "HackHub Global Hackathon 2026",
      role: "Lead Full Stack Engineer",
      achievement: "Top Project Contributor",
      year: "2026",
    },
  ]);

  // Privacy
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showProjects, setShowProjects] = useState(true);
  const [showHackathons, setShowHackathons] = useState(true);

  // New Project Form Modal/State
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projLive, setProjLive] = useState("");
  const [projGh, setProjGh] = useState("");

  const applyProfileData = (data: any) => {
    if (!data) return;
    if (data.username) setUsername(data.username);
    if (data.fullName) setFullName(data.fullName);
    if (data.headline) setHeadline(data.headline);
    if (data.bio) setBio(data.bio);
    if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
    if (data.location) setLocation(data.location);
    if (data.education) {
      setInstitution(data.education.institution || "");
      setDegree(data.education.degree || "");
      setGraduationYear(data.education.graduationYear || "");
    }
    if (Array.isArray(data.skills) && data.skills.length > 0) setSkills(data.skills);
    if (Array.isArray(data.domainsOfInterest) && data.domainsOfInterest.length > 0)
      setDomains(data.domainsOfInterest);
    if (data.socialLinks) {
      setGithubUrl(data.socialLinks.github || "");
      setLinkedinUrl(data.socialLinks.linkedin || "");
      setTwitterUrl(data.socialLinks.twitter || "");
      setPortfolioUrl(data.socialLinks.portfolio || "");
    }
    if (Array.isArray(data.projects)) setProjects(data.projects);
    if (Array.isArray(data.hackathons)) setHackathons(data.hackathons);
    if (data.privacySettings) {
      setIsPublic(data.privacySettings.isPublic ?? true);
      setShowEmail(data.privacySettings.showEmail ?? false);
      setShowProjects(data.privacySettings.showProjects ?? true);
      setShowHackathons(data.privacySettings.showHackathons ?? true);
    }
  };

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "");

  const fetchProfile = async (fallbackUname?: string) => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-user" }),
        },
      });

      if (res.ok) {
        const data = await res.json();
        applyProfileData(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("hackhub_current_profile", JSON.stringify(data));
          if (data.username) {
            localStorage.setItem(`hackhub_profile_${data.username.toLowerCase()}`, JSON.stringify(data));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile from API, utilizing local cache", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const cleanUsername = (username || "hacker").toLowerCase().trim();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const payload = {
        username: cleanUsername,
        fullName: fullName || "Student Hacker",
        headline,
        bio,
        avatarUrl,
        location,
        education: { institution, degree, graduationYear },
        skills,
        domainsOfInterest: domains,
        socialLinks: {
          github: githubUrl,
          linkedin: linkedinUrl,
          twitter: twitterUrl,
          portfolio: portfolioUrl,
        },
        projects,
        hackathons,
        privacySettings: {
          isPublic,
          showEmail,
          showProjects,
          showHackathons,
        },
      };

      // 1. Immediately persist to localStorage for instant local preview & fallback
      if (typeof window !== "undefined") {
        localStorage.setItem("hackhub_current_profile", JSON.stringify(payload));
        localStorage.setItem(`hackhub_profile_${cleanUsername}`, JSON.stringify(payload));
      }

      // 2. Persist to API
      try {
        await fetch(`${API_BASE}/api/profile/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : { "x-user-id": "demo-user" }),
          },
          body: JSON.stringify(payload),
        });
      } catch (apiErr) {
        console.warn("API save failed, local storage fallback active", apiErr);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddDomain = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      setDomains([...domains, newDomain.trim()]);
      setNewDomain("");
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setDomains(domains.filter((d) => d !== domainToRemove));
  };

  const handleAddProject = () => {
    if (!projTitle.trim()) return;
    const newProj: ProjectItem = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      techStack: projTech
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      projectUrl: projLive.trim(),
      githubUrl: projGh.trim(),
    };
    setProjects([...projects, newProj]);
    setProjTitle("");
    setProjDesc("");
    setProjTech("");
    setProjLive("");
    setProjGh("");
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleCopyPublicLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/profile/${username}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/50 to-blue-950/40 border border-cyan-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Developer Profile & Portfolio
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Identity Hub</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl">
                Showcase your skills, hackathon achievements, and open-source contributions. Generate a public shareable portfolio URL.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/profile/${username}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 shadow-md transition-all"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                View Public Portfolio
              </Link>
              <button
                onClick={handleCopyPublicLink}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? "Link Copied!" : "Share Profile Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <User className="w-5 h-5 text-cyan-400" />
              Basic Information & Developer Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Public Username / Handle <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Your portfolio URL: <span className="text-cyan-400 font-mono">/profile/{username}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Bio / About Me</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">College / Institution</label>
                <div className="relative">
                  <School className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Skills & Domains */}
          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Code2 className="w-5 h-5 text-indigo-400" />
              Technical Skills & Areas of Expertise
            </h3>

            {/* Skills */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-300">Technical Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Next.js, Rust)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill(e))}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Domains */}
            <div className="space-y-3 pt-3 border-t border-gray-800">
              <label className="block text-xs font-semibold text-gray-300">Domains of Interest</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {domains.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
                  >
                    {domain}
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(domain)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add domain (e.g. HealthTech, AI Agents)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDomain(e))}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddDomain}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Social & Developer Links */}
          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Globe className="w-5 h-5 text-emerald-400" />
              Social & Portfolio Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">GitHub Profile Link</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">LinkedIn Profile Link</label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Projects Showcase */}
          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              Featured Projects in Portfolio
            </h3>

            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                    <p className="text-xs text-gray-400">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.techStack?.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add Project Form inline */}
              <div className="p-4 rounded-2xl bg-gray-900/40 border border-dashed border-gray-700 space-y-3">
                <h5 className="text-xs font-semibold text-gray-300">Add a New Project</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Tech Stack (comma separated)"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="Live Demo URL"
                    value={projLive}
                    onChange={(e) => setProjLive(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="url"
                    placeholder="GitHub Repo URL"
                    value={projGh}
                    onChange={(e) => setProjGh(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Short Project Summary"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white resize-none"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save Project to List
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Privacy Settings */}
          <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Shield className="w-5 h-5 text-rose-400" />
              Public Visibility & Privacy Controls
            </h3>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <div>
                  <div className="font-semibold text-white">Public Profile Searchable</div>
                  <div className="text-gray-400 text-xs">Allow your profile to appear in HackHub directory and search.</div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <div>
                  <div className="font-semibold text-white">Show Projects on Public Page</div>
                  <div className="text-gray-400 text-xs">Display your completed projects portfolio to viewers.</div>
                </div>
                <input
                  type="checkbox"
                  checked={showProjects}
                  onChange={(e) => setShowProjects(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <div>
                  <div className="font-semibold text-white">Show Hackathon Participations</div>
                  <div className="text-gray-400 text-xs">Display your past hackathon awards and badges.</div>
                </div>
                <input
                  type="checkbox"
                  checked={showHackathons}
                  onChange={(e) => setShowHackathons(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Save Action Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/90 border border-gray-800">
            <div>
              {saveSuccess && (
                <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Profile updated successfully!
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
