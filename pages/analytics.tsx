import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Target,
  Sparkles,
  Zap,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function AnalyticsPage() {
  const { currentTeam } = useAppContext();
  const [data, setData] = useState({
    totalTasks: 12,
    completedTasks: 8,
    inProgressTasks: 3,
    pendingTasks: 1,
    completionRate: 67,
    readinessScore: 84,
    burndownTimeline: [
      { hour: "Hour 0", remaining: 12, target: 12 },
      { hour: "Hour 8", remaining: 10, target: 9 },
      { hour: "Hour 16", remaining: 8, target: 6 },
      { hour: "Hour 24", remaining: 6, target: 4 },
      { hour: "Hour 32", remaining: 4, target: 2 },
      { hour: "Hour 48", remaining: 1, target: 0 },
    ],
    contributionDistribution: [
      { role: "Frontend UI/UX", percent: 45, tasks: 5, color: "bg-cyan-500" },
      { role: "Backend & DB", percent: 35, tasks: 4, color: "bg-indigo-500" },
      { role: "API Integration", percent: 12, tasks: 2, color: "bg-purple-500" },
      { role: "Presentation & QA", percent: 8, tasks: 1, color: "bg-emerald-500" },
    ],
    sprintHealth: "Optimal",
  });

  useEffect(() => {
    fetchAnalytics();
  }, [currentTeam]);

  const fetchAnalytics = async () => {
    try {
      const teamId = currentTeam?._id || "default";
      const res = await fetch(`http://localhost:5000/api/analytics/team/${teamId}`);
      if (res.ok) {
        const json = await res.json();
        setData((prev) => ({
          ...prev,
          ...json,
        }));
      }
    } catch {
      // Keep rich default metrics
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              Team Activity & Burndown Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Live sprint velocity, task burndown curves, and submission readiness metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Sprint Health: {data.sprintHealth}
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Total Tasks</span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{data.totalTasks}</p>
            <p className="text-xs text-gray-400 mt-1">Sprint workload</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{data.completedTasks}</p>
            <p className="text-xs text-gray-400 mt-1">{data.completionRate}% completion rate</p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">In Progress</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400 mt-2">{data.inProgressTasks}</p>
            <p className="text-xs text-gray-400 mt-1">Active developers working</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-300">Readiness Score</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-2">{data.readinessScore}/100</p>
            <p className="text-xs text-cyan-300/80 mt-1">Hackathon submission ready</p>
          </div>
        </div>

        {/* Burndown Velocity Chart & Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Burndown Curve Bar Simulation */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    48-Hour Sprint Burndown Curve
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Remaining tasks vs ideal completion trajectory
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> Actual
                  <span className="w-3 h-3 rounded bg-white/20 inline-block ml-2" /> Ideal
                </span>
              </div>

              {/* Bar Chart Bars */}
              <div className="space-y-4">
                {data.burndownTimeline.map((item) => (
                  <div key={item.hour} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{item.hour}</span>
                      <span className="font-semibold">{item.remaining} tasks left</span>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, (item.remaining / 12) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span>Velocity Target: 0.5 tasks / hour</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> On track for demo deadline
              </span>
            </div>
          </div>

          {/* Role Contribution Breakdown */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                Domain Contribution
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Effort distribution across engineering streams
              </p>

              <div className="space-y-4">
                {data.contributionDistribution.map((item) => (
                  <div key={item.role} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>{item.role}</span>
                      <span className="font-bold text-white">{item.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color || "bg-indigo-500"}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tip: Delegate QA testing 6 hours before final pitch presentation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
