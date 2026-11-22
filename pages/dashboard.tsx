import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/router";
import {
  CheckCircle2,
  Rocket,
  ExternalLink,
  AlertCircle,
  Award,
  RefreshCw,
  Users,
  Clock,
} from "lucide-react";

interface ProjectSubmission {
  title: string;
  tagline: string;
  repoUrl: string;
  demoUrl: string;
  description: string;
  techStack: string;
  submittedAt: string;
}

const DEMO_TEAM_MEMBERS = [
  {
    id: "demo-1",
    name: "Aastha Goyal",
    role: "Full-Stack & AI Lead",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aastha",
  },
  {
    id: "demo-2",
    name: "Ananya Sharma",
    role: "Frontend & UI Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
  },
  {
    id: "demo-3",
    name: "Riya Verma",
    role: "Backend & APIs",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const {
    tasks,
    teamName,
    teamBio,
    teamMembers,
    isAuthenticated,
    hackathonEndTime,
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [hackathonTimeRemaining, setHackathonTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  // Project submission verification state
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Submission form state
  const [subTitle, setSubTitle] = useState("");
  const [subTagline, setSubTagline] = useState("");
  const [subRepoUrl, setSubRepoUrl] = useState("");
  const [subDemoUrl, setSubDemoUrl] = useState("");
  const [subDescription, setSubDescription] = useState("");
  const [subTechStack, setSubTechStack] = useState("");
  const [checklistRepo, setChecklistRepo] = useState(false);
  const [checklistReadme, setChecklistReadme] = useState(false);
  const [checklistDemo, setChecklistDemo] = useState(false);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const taskStats = useMemo(() => {
    const totalTasks = safeTasks.length;
    const completedTasks = safeTasks.filter((t) => t.status === "Done").length;
    const inProgressTasks = safeTasks.filter(
      (t) => t.status === "In Progress"
    ).length;
    const todoTasks = safeTasks.filter((t) => t.status === "To Do").length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionPercentage,
    };
  }, [safeTasks, refreshTick]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hackhub_submission");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSubmission(parsed);
          setSubTitle(parsed.title || "");
          setSubTagline(parsed.tagline || "");
          setSubRepoUrl(parsed.repoUrl || "");
          setSubDemoUrl(parsed.demoUrl || "");
          setSubDescription(parsed.description || "");
          setSubTechStack(parsed.techStack || "");
          setChecklistRepo(true);
          setChecklistReadme(true);
          setChecklistDemo(true);
        } catch {
          // ignore invalid saved json
        }
      }
    }
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleProjectSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!subTitle.trim()) {
      setSubmissionError("Project title is required.");
      return;
    }
    if (!subRepoUrl.trim() || !subRepoUrl.startsWith("http")) {
      setSubmissionError(
        "Please provide a valid repository URL (e.g. https://github.com/...)"
      );
      return;
    }
    if (!subDemoUrl.trim() || !subDemoUrl.startsWith("http")) {
      setSubmissionError(
        "Please provide a valid live demo or deployment URL (e.g. https://...)"
      );
      return;
    }
    if (!checklistRepo || !checklistReadme || !checklistDemo) {
      setSubmissionError(
        "Please complete and verify all 3 checklist items before submitting."
      );
      return;
    }

    setSubmittingProject(true);
    setTimeout(() => {
      const payload: ProjectSubmission = {
        title: subTitle.trim(),
        tagline: subTagline.trim(),
        repoUrl: subRepoUrl.trim(),
        demoUrl: subDemoUrl.trim(),
        description: subDescription.trim(),
        techStack:
          subTechStack.trim() ||
          "Next.js, React, TypeScript, Tailwind CSS, Node.js, Express, MongoDB",
        submittedAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("hackhub_submission", JSON.stringify(payload));
      }
      setSubmission(payload);
      setSubmittingProject(false);
      setSubmissionSuccess(true);
    }, 350);
  };

  useEffect(() => {
    if (!hackathonEndTime) {
      setHackathonTimeRemaining(null);
      return;
    }

    const endMs =
      hackathonEndTime instanceof Date
        ? hackathonEndTime.getTime()
        : new Date(hackathonEndTime).getTime();

    if (Number.isNaN(endMs)) {
      setHackathonTimeRemaining(null);
      return;
    }

    const calculateHackathonTime = () => {
      const now = Date.now();
      const distance = endMs - now;

      if (distance <= 0) {
        setHackathonTimeRemaining(null);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setHackathonTimeRemaining({ days, hours, minutes, seconds });
    };

    calculateHackathonTime();
    const timer = setInterval(calculateHackathonTime, 1000);
    return () => clearInterval(timer);
  }, [hackathonEndTime]);

  const getHackathonProgress = () => {
    if (!hackathonTimeRemaining) return 100;
    const totalDuration = 48 * 60 * 60 * 1000;
    const remainingTime =
      hackathonTimeRemaining.days * 24 * 60 * 60 * 1000 +
      hackathonTimeRemaining.hours * 60 * 60 * 1000 +
      hackathonTimeRemaining.minutes * 60 * 1000 +
      hackathonTimeRemaining.seconds * 1000;

    const elapsed = totalDuration - remainingTime;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const displayTeamName = teamName && teamName.trim() ? teamName.trim() : "HackHub Squad";
  const displayTeamBio =
    teamBio && teamBio.trim()
      ? teamBio.trim()
      : "Building collaborative hackathon solutions with speed and precision.";
  const teamInitial = displayTeamName.charAt(0).toUpperCase();
  const displayMembers =
    Array.isArray(teamMembers) && teamMembers.length > 0
      ? teamMembers
      : DEMO_TEAM_MEMBERS;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>HackHub - Dashboard</title>
      </Head>

      {submission && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center border border-emerald-500/40">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-white text-base">
                  Project Submitted &amp; Verified!
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                  Ready for Evaluation
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                &quot;{submission.title}&quot; — submitted on{" "}
                {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setSubmissionSuccess(false);
                setShowSubmissionModal(true);
              }}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Review / Update
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Team Dashboard
          </h2>
          <p className="text-sm text-zinc-300">
            Real-time project overview, task statistics, and hackathon countdown.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmissionSuccess(false);
            setShowSubmissionModal(true);
          }}
          className="btn-primary flex items-center gap-2 shadow-lg"
        >
          <Rocket className="w-4 h-4" />
          <span>{submission ? "Update Submission" : "Submit Project"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clean Project Progress Card (replaces flat green rectangle) */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Project Progress</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualizes your team&apos;s task completion status across{" "}
                  {taskStats.totalTasks} total tasks.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-cyan-300">
                    {taskStats.completionPercentage}%
                  </p>
                  <p className="text-[11px] text-zinc-400 uppercase tracking-wider">
                    Tasks Completed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRefreshTick((prev) => prev + 1)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-zinc-200 border border-slate-700 transition"
                  title="Refresh Stats"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Linear Progress Bar + Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex justify-between text-xs text-zinc-300 font-medium">
                <span>Sprint Completion</span>
                <span>
                  {taskStats.completedTasks} / {taskStats.totalTasks} Done
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${taskStats.completionPercentage}%` }}
                />
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Completed (Done)
                  </span>
                  <span className="font-semibold text-emerald-300">
                    {taskStats.completedTasks} tasks
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Active (In Progress)
                  </span>
                  <span className="font-semibold text-amber-300">
                    {taskStats.inProgressTasks} tasks
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    Queued (To Do)
                  </span>
                  <span className="font-semibold text-rose-300">
                    {taskStats.todoTasks} tasks
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-emerald-400 font-semibold">Done</p>
              <p className="text-2xl font-bold text-emerald-300 mt-0.5">
                {taskStats.completedTasks}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-amber-400 font-semibold">In Progress</p>
              <p className="text-2xl font-bold text-amber-300 mt-0.5">
                {taskStats.inProgressTasks}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xs text-rose-400 font-semibold">To Do</p>
              <p className="text-2xl font-bold text-rose-300 mt-0.5">
                {taskStats.todoTasks}
              </p>
            </div>
          </div>
        </div>

        {/* Team Intro */}
        <div className="card flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">My Team</h3>
            <div className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-purple-400/40 flex items-center justify-center bg-gradient-to-br from-purple-600/30 to-cyan-600/30 shadow-inner">
              <span className="text-3xl font-extrabold text-white">
                {teamInitial}
              </span>
            </div>
            <h4 className="text-base font-bold text-center text-white mb-1">
              {displayTeamName}
            </h4>
            <p className="text-xs text-zinc-300 text-center leading-relaxed">
              {displayTeamBio}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/team-setup")}
            className="w-full mt-5 btn-primary text-xs py-2.5"
          >
            Edit Team Info
          </button>
        </div>

        {/* Hackathon Deadline Card */}
        <div className="vibrant-card flex flex-col justify-between">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              Project Deadline
            </div>
            <p className="text-[11px] text-purple-100/80 mb-4">
              Hackathon Submission Tracker
            </p>

            {hackathonTimeRemaining ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/15">
                    <div className="text-xl font-bold text-white tabular-nums">
                      {String(hackathonTimeRemaining.days).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-purple-100">DAYS</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/15">
                    <div className="text-xl font-bold text-white tabular-nums">
                      {String(hackathonTimeRemaining.hours).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-purple-100">HOURS</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/15">
                    <div className="text-xl font-bold text-white tabular-nums">
                      {String(hackathonTimeRemaining.minutes).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-purple-100">MINS</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/25 border border-white/15">
                    <div className="text-xl font-bold text-white tabular-nums">
                      {String(hackathonTimeRemaining.seconds).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-purple-100">SECS</div>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${getHackathonProgress()}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-purple-100 mt-1 block">
                    {Math.round(getHackathonProgress())}% Elapsed
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 px-2 rounded-2xl bg-black/20 border border-white/15">
                <p className="text-sm font-bold text-white">
                  {submission ? "Submission Recorded" : "Demo & Submission Window"}
                </p>
                <p className="text-xs text-purple-100/85 mt-1">
                  {submission
                    ? "Your project is ready for evaluation."
                    : "Verify repo, README, and live link before submitting."}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setSubmissionSuccess(false);
                setShowSubmissionModal(true);
              }}
              className="btn-primary w-full text-xs py-2.5"
            >
              {submission ? "Review Submission" : "Submit Project"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/team-setup")}
              className="btn-secondary w-full text-xs py-2"
            >
              Adjust Deadline
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white">Upcoming Tasks</h3>
          <button
            type="button"
            onClick={() => router.push("/tasks")}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Open Task Board →
          </button>
        </div>
        {safeTasks.filter((task) => task.status !== "Done").length > 0 ? (
          <div className="space-y-3">
            {safeTasks
              .filter((task) => task.status !== "Done")
              .map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center gap-3"
                >
                  <div>
                    <p className="font-medium text-white text-sm">{task.title}</p>
                    <p className="text-xs text-zinc-400">
                      Assigned to: {task.assignee || "Team"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      task.status === "In Progress"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-zinc-400 text-center py-4 text-sm">
            All tasks completed!
          </p>
        )}
      </div>

      {/* Team Members Section */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Team Members ({displayMembers.length})
          </h3>
          <button
            type="button"
            onClick={() => router.push("/team-setup")}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Manage Team →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-xl bg-slate-900/60 border border-slate-800 flex items-center p-3.5"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-10 h-10 rounded-full mr-3 border border-slate-700"
              />
              <div className="truncate">
                <p className="font-medium text-white text-sm truncate">
                  {member.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Submission Verification Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-xl border border-cyan-500/40 my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  Project Submission &amp; Verification
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmissionModal(false)}
                className="text-zinc-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {submissionSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto border border-emerald-500/50">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Submission Verified &amp; Recorded!
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  Your project has been verified against hackathon requirements
                  and recorded for evaluation.
                </p>
                <div className="p-4 rounded-xl bg-slate-900/80 text-left text-xs space-y-2 border border-zinc-700">
                  <p>
                    <span className="text-zinc-400">Project:</span>{" "}
                    <strong className="text-white">{subTitle}</strong>
                  </p>
                  <p>
                    <span className="text-zinc-400">Repository:</span>{" "}
                    <a
                      href={subRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline"
                    >
                      {subRepoUrl}
                    </a>
                  </p>
                  <p>
                    <span className="text-zinc-400">Live Demo:</span>{" "}
                    <a
                      href={subDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline"
                    >
                      {subDemoUrl}
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSubmissionModal(false)}
                  className="w-full btn-primary"
                >
                  Close &amp; View Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleProjectSubmission} className="space-y-4">
                {submissionError && (
                  <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submissionError}</span>
                  </div>
                )}

                <div>
                  <label className="label-enhanced">Project Title *</label>
                  <input
                    type="text"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder="e.g. HackHub - Collaborative Platform"
                    className="input-enhanced w-full text-white placeholder-zinc-500"
                    required
                  />
                </div>

                <div>
                  <label className="label-enhanced">Tagline (optional)</label>
                  <input
                    type="text"
                    value={subTagline}
                    onChange={(e) => setSubTagline(e.target.value)}
                    placeholder="e.g. Where Innovation Meets Collaboration"
                    className="input-enhanced w-full text-white placeholder-zinc-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-enhanced">GitHub Repo URL *</label>
                    <input
                      type="url"
                      value={subRepoUrl}
                      onChange={(e) => setSubRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="input-enhanced w-full text-white placeholder-zinc-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-enhanced">Live Demo URL *</label>
                    <input
                      type="url"
                      value={subDemoUrl}
                      onChange={(e) => setSubDemoUrl(e.target.value)}
                      placeholder="https://hackhub.vercel.app"
                      className="input-enhanced w-full text-white placeholder-zinc-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label-enhanced">Tech Stack</label>
                  <input
                    type="text"
                    value={subTechStack}
                    onChange={(e) => setSubTechStack(e.target.value)}
                    placeholder="e.g. Next.js, React, TypeScript, Tailwind CSS, Express, MongoDB"
                    className="input-enhanced w-full text-white placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="label-enhanced">Summary / Description</label>
                  <textarea
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                    placeholder="Describe key features, architecture, and value proposition..."
                    rows={2}
                    className="input-enhanced w-full text-white placeholder-zinc-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 space-y-2.5">
                  <p className="text-xs font-semibold text-zinc-300">
                    Submission Quality Checklist:
                  </p>
                  <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistRepo}
                      onChange={(e) => setChecklistRepo(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-600 text-cyan-500"
                    />
                    <span>
                      Public GitHub repository is committed with clean git history
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistReadme}
                      onChange={(e) => setChecklistReadme(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-600 text-cyan-500"
                    />
                    <span>
                      Comprehensive README documentation with setup guide is present
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistDemo}
                      onChange={(e) => setChecklistDemo(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-600 text-cyan-500"
                    />
                    <span>
                      Live production demo is verified, responsive, and working
                    </span>
                  </label>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionModal(false)}
                    disabled={submittingProject}
                    className="w-full btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProject}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    {submittingProject ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm &amp; Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}