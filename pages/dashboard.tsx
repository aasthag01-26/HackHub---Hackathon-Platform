import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Head from "next/head";
import Script from "next/script";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/router";
import { CheckCircle2, Rocket, ExternalLink, AlertCircle, Award } from "lucide-react";

// Strongly typed Chart.js window declaration
interface ChartInstance {
  destroy: () => void;
}

interface ChartTooltipItem {
  label?: string;
  parsed: number | null;
}

interface ChartConstructor {
  new (
    ctx: CanvasRenderingContext2D,
    config: Record<string, unknown>
  ): ChartInstance;
  getChart: (canvas: HTMLCanvasElement) => ChartInstance | undefined;
}

declare global {
  interface Window {
    Chart?: ChartConstructor;
  }
}

interface ProjectSubmission {
  title: string;
  tagline: string;
  repoUrl: string;
  demoUrl: string;
  description: string;
  techStack: string;
  submittedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const {
    tasks,
    teamName,
    teamBio,
    teamMembers,
    isAuthenticated,
    deadline,
    hackathonEndTime,
  } = useAppContext();

  const chartRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const [chartJsLoaded, setChartJsLoaded] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
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

  // Calculate task statistics
  const taskStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Done").length;
    const inProgressTasks = tasks.filter(
      (t) => t.status === "In Progress"
    ).length;
    const todoTasks = tasks.filter((t) => t.status === "To Do").length;
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionPercentage,
      chartData: [completedTasks, inProgressTasks, todoTasks],
    };
  }, [tasks]);

  // Load existing project submission
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
          // ignore
        }
      }
    }
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
    }, 400);
  };

  // Simplified chart initialization function
  const initializeChart = useCallback(() => {
    if (!chartRef.current || !window.Chart) {
      return;
    }

    try {
      setChartLoading(true);
      setChartError(null);

      const ctx = chartRef.current.getContext("2d");
      if (!ctx) {
        setChartError("Could not get canvas context");
        setChartLoading(false);
        return;
      }

      const existingChart = window.Chart.getChart(chartRef.current);
      if (existingChart) {
        existingChart.destroy();
      }

      new window.Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Done", "In Progress", "To Do"],
          datasets: [
            {
              data: taskStats.chartData,
              backgroundColor: [
                "#10b981", // emerald-500
                "#f59e0b", // amber-500
                "#f43f5e", // rose-500
              ],
              borderColor: "#18181b", // zinc-900
              borderWidth: 4,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          animation: {
            duration: 500,
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#f8fafc",
                font: { size: 14, weight: 600 },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context: ChartTooltipItem) {
                  let label = context.label || "";
                  if (label) label += ": ";
                  if (context.parsed !== null && context.parsed !== undefined)
                    label += context.parsed + " tasks";
                  return label;
                },
              },
            },
          },
        },
      });

      setChartError(null);
      setChartLoading(false);
    } catch (error) {
      setChartError(
        `Error creating chart: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setChartLoading(false);
    }
  }, [taskStats]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined" && window.Chart) {
      setChartJsLoaded(true);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Calculate time remaining until deadline
  useEffect(() => {
    if (!deadline) {
      setTimeRemaining("Deadline not set");
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const distance = deadline.getTime() - now;

      if (distance < 0) {
        setTimeRemaining("Expired");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      return `${days} days, ${hours} hours, ${minutes} minutes remaining`;
    };

    setTimeRemaining(calculateTimeRemaining() || null);

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining() || null);
    }, 60000);

    return () => clearInterval(timer);
  }, [deadline]);

  // Hackathon countdown timer
  useEffect(() => {
    if (!hackathonEndTime) return;

    const calculateHackathonTime = () => {
      const now = new Date().getTime();
      const distance = hackathonEndTime.getTime() - now;

      if (distance < 0) {
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
    if (!hackathonEndTime || !hackathonTimeRemaining) return 100;
    const totalDuration = 48 * 60 * 60 * 1000;
    const remainingTime =
      hackathonTimeRemaining.days * 24 * 60 * 60 * 1000 +
      hackathonTimeRemaining.hours * 60 * 60 * 1000 +
      hackathonTimeRemaining.minutes * 60 * 1000 +
      hackathonTimeRemaining.seconds * 1000;

    const elapsed = totalDuration - remainingTime;
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  useEffect(() => {
    if (!isClient || !chartJsLoaded || !window.Chart || !chartRef.current) {
      return;
    }
    const timer = setTimeout(() => {
      initializeChart();
    }, 200);
    return () => clearTimeout(timer);
  }, [isClient, chartJsLoaded, initializeChart, taskStats.totalTasks]);

  useEffect(() => {
    return () => {
      try {
        if (chartRef.current && window.Chart) {
          const existingChart = window.Chart.getChart(chartRef.current);
          if (existingChart) {
            existingChart.destroy();
          }
        }
      } catch (e) {
        console.error("Error cleaning up chart:", e);
      }
    };
  }, []);

  const teamInitial = teamName ? teamName.charAt(0) : "T";

  if (isLoading) {
    return (
      <div className="min-h-screen dark-theme-background flex items-center justify-center">
        <div className="loader"></div>
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
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          setChartJsLoaded(true);
          setTimeout(() => {
            if (chartRef.current && window.Chart) {
              initializeChart();
            }
          }, 100);
        }}
        onError={(e) => {
          console.error("Failed to load Chart.js", e);
          setChartError("Failed to load Chart.js");
        }}
      />

      {/* Verified Submission Banner */}
      {submission && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xl border border-emerald-500/40">
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white text-base">
                  Project Submitted & Verified!
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                  Ready for Evaluation
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                "{submission.title}" — submitted on{" "}
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
          <h2 className="text-display-md font-display text-gradient-primary mb-1 text-glow">
            Team Dashboard
          </h2>
          <p className="text-body-sm font-body text-zinc-400">
            Real-time project overview, Kanban statistics, and hackathon countdown.
          </p>
        </div>
        <button
          onClick={() => {
            setSubmissionSuccess(false);
            setShowSubmissionModal(true);
          }}
          className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20"
        >
          <Rocket className="w-4 h-4" />
          <span>{submission ? "Update Submission 🚀" : "Submit Project 🚀"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Chart */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-heading-lg font-heading">Project Progress</h3>
            <button
              onClick={() => {
                setChartError(null);
                setChartLoading(true);
                if (chartRef.current && window.Chart) {
                  const existingChart = window.Chart.getChart(chartRef.current);
                  if (existingChart) existingChart.destroy();
                }
                setTimeout(initializeChart, 100);
              }}
              className="btn-primary text-xs px-3 py-1.5"
              title="Refresh Chart"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-body-sm font-body text-zinc-400">
                Visualizes your team's task completion status.
              </p>
            </div>
            <div className="text-right">
              <p className="text-display-sm font-display text-gradient-primary">
                {taskStats.completionPercentage}%
              </p>
              <p className="text-caption text-zinc-400">Tasks Completed</p>
            </div>
          </div>

          <div className="chart-enhanced relative h-64 p-4">
            {chartError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90 rounded-lg">
                <div className="text-center p-4">
                  <p className="text-rose-400 mb-2">{chartError}</p>
                  <button
                    onClick={() => {
                      setChartError(null);
                      setChartLoading(true);
                      initializeChart();
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            {(!chartJsLoaded || chartLoading) && !chartError && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded-lg">
                <div className="text-center">
                  <div className="loader mb-2"></div>
                  <p className="text-zinc-400 text-sm">
                    {!chartJsLoaded
                      ? "Loading Chart.js..."
                      : "Initializing chart..."}
                  </p>
                </div>
              </div>
            )}

            <canvas
              ref={chartRef}
              id="progressChart"
              className="w-full h-full"
            ></canvas>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="text-center p-3 glass rounded-xl">
              <p className="text-sm text-emerald-400 font-semibold">Done</p>
              <p className="text-2xl font-bold text-emerald-300">
                {taskStats.completedTasks}
              </p>
            </div>
            <div className="text-center p-3 glass rounded-xl">
              <p className="text-sm text-amber-400 font-semibold">In Progress</p>
              <p className="text-2xl font-bold text-amber-300">
                {taskStats.inProgressTasks}
              </p>
            </div>
            <div className="text-center p-3 glass rounded-xl">
              <p className="text-sm text-rose-400 font-semibold">To Do</p>
              <p className="text-2xl font-bold text-rose-300">
                {taskStats.todoTasks}
              </p>
            </div>
          </div>
        </div>

        {/* Team Intro */}
        <div className="card">
          <h3 className="text-heading-lg font-heading mb-4">{teamName}</h3>
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-zinc-700
                       flex items-center justify-center 
                       bg-gradient-to-br from-zinc-800 to-zinc-900"
          >
            <span className="text-4xl font-display text-gradient-primary">
              {teamInitial}
            </span>
          </div>

          <p className="text-body-sm font-body text-zinc-400 text-center">
            {teamBio}
          </p>
          <button
            onClick={() => router.push("/team-setup")}
            className="w-full mt-4 btn-primary"
          >
            Edit Team Info
          </button>
        </div>

        {/* Hackathon Timer Card */}
        <div className="vibrant-card glow-purple">
          <div>
            <div className="text-center">
              <h3 className="text-heading-lg font-heading mb-1 text-white">
                Project Deadline
              </h3>
              <p className="text-caption text-gray-300 mb-4">
                Time remaining until IEEE IGDTUW deadline
              </p>

              {hackathonTimeRemaining ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="timer-digit-enhanced glow-purple p-2 sm:p-3">
                      <div className="text-display-sm font-display text-white tabular-nums">
                        {hackathonTimeRemaining.days.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[11px] text-gray-200">DAYS</div>
                    </div>
                    <div className="timer-digit-enhanced glow-pink p-2 sm:p-3">
                      <div className="text-display-sm font-display text-white tabular-nums">
                        {hackathonTimeRemaining.hours.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[11px] text-gray-200">HOURS</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="timer-digit-enhanced glow-orange p-2 sm:p-3">
                      <div className="text-display-sm font-display text-white tabular-nums">
                        {hackathonTimeRemaining.minutes
                          .toString()
                          .padStart(2, "0")}
                      </div>
                      <div className="text-[11px] text-gray-200">MINS</div>
                    </div>
                    <div className="timer-digit-enhanced glow-purple p-2 sm:p-3">
                      <div className="text-display-sm font-display text-white tabular-nums">
                        {hackathonTimeRemaining.seconds
                          .toString()
                          .padStart(2, "0")}
                      </div>
                      <div className="text-[11px] text-gray-200">SECS</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-200 mb-1.5">
                      <span>Start</span>
                      <span>Finish</span>
                    </div>
                    <div className="w-full bg-zinc-700/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="progress-enhanced h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${getHackathonProgress()}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-200 font-medium">
                        {Math.round(getHackathonProgress())}% Elapsed
                      </span>
                    </div>
                  </div>

                  {/* Quick submission button inside timer */}
                  <button
                    onClick={() => {
                      setSubmissionSuccess(false);
                      setShowSubmissionModal(true);
                    }}
                    className="w-full mt-2 btn-primary text-xs py-2"
                  >
                    {submission ? "✓ Submission Verified" : "Submit Project 🚀"}
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 timer-complete">
                  <div className="text-3xl font-display text-gradient-accent mb-2">
                    🎉
                  </div>
                  <p className="text-heading-md font-heading text-white">
                    Deadline Reached!
                  </p>
                  <p className="text-body-sm text-gray-200 mt-1 mb-4">
                    Ready to submit your finalized project.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSubmissionSuccess(false);
                        setShowSubmissionModal(true);
                      }}
                      className="btn-primary w-full"
                    >
                      {submission ? "Review Submission 🚀" : "Submit Project 🚀"}
                    </button>
                    <button
                      onClick={() => router.push("/team-setup")}
                      className="btn-secondary w-full text-xs"
                    >
                      Adjust Deadline
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks Section */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-white">Upcoming Tasks</h3>
          <button
            onClick={() => router.push("/tasks")}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline"
          >
            Open Task Board →
          </button>
        </div>
        {tasks.filter((task) => task.status !== "Done").length > 0 ? (
          <div className="space-y-3">
            {tasks
              .filter((task) => task.status !== "Done")
              .map((task) => (
                <div
                  key={task.id}
                  className="p-4 glass rounded-xl flex justify-between items-center transition-all duration-300"
                >
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="text-xs text-zinc-400">
                      Assigned to: {task.assignee}
                    </p>
                  </div>
                  <span
                    className={`status-badge ${
                      task.status === "In Progress"
                        ? "status-progress"
                        : "status-todo"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-zinc-400 text-center py-4">
            All tasks completed! 🎉
          </p>
        )}
      </div>

      {/* Team Members Section */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-4 text-lg text-white">Team Members</h3>
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="glass rounded-xl flex items-center p-4"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="truncate">
                  <p className="font-medium text-white truncate">{member.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-zinc-400 mb-3">No team members yet</p>
            <button
              onClick={() => router.push("/team-setup")}
              className="btn-primary"
            >
              Add Team Members
            </button>
          </div>
        )}
      </div>

      {/* Project Submission Verification Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="card w-full max-w-xl border border-cyan-500/40 my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-cyan-400" />
                <h2 className="text-heading-xl font-heading text-white">
                  Project Submission & Verification
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
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto border border-emerald-500/50">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Submission Verified & Recorded!
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto">
                  Your project has been verified against hackathon requirements
                  and recorded for evaluation.
                </p>
                <div className="glass p-4 rounded-xl text-left text-xs space-y-2 border border-zinc-700">
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
                  Close & View Dashboard
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

                {/* Pre-submission Verification Checklist */}
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/80 space-y-2.5">
                  <p className="text-xs font-semibold text-zinc-300">
                    Submission Quality Checklist:
                  </p>
                  <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistRepo}
                      onChange={(e) => setChecklistRepo(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-600 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>
                      Public GitHub repository is committed with clean git
                      history
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistReadme}
                      onChange={(e) => setChecklistReadme(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-600 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span>
                      Comprehensive README documentation with setup guide is
                      present
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistDemo}
                      onChange={(e) => setChecklistDemo(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-600 text-cyan-500 focus:ring-cyan-400"
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
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Submit</span>
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
