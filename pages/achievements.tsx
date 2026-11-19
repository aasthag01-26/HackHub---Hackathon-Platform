import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Award,
  Flame,
  GitCommit,
  CheckSquare,
  Users,
  Mic,
  Star,
  Trophy,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface BadgeItem {
  _id?: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpValue: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

interface AchievementData {
  userId: string;
  userName: string;
  totalXp: number;
  level: number;
  tier: string;
  unlockedBadges: { badgeCode: string; unlockedAt: string }[];
}

export default function AchievementsPage() {
  const { currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<"badges" | "leaderboard">("badges");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    achievement: AchievementData;
    allBadges: BadgeItem[];
  }>({
    achievement: {
      userId: "guest",
      userName: "Alex Rivers",
      totalXp: 320,
      level: 4,
      tier: "Silver Shipper",
      unlockedBadges: [
        { badgeCode: "FIRST_COMMIT", unlockedAt: new Date().toISOString() },
        { badgeCode: "TASK_CRUSHER", unlockedAt: new Date().toISOString() },
        { badgeCode: "TEAM_ANCHOR", unlockedAt: new Date().toISOString() },
      ],
    },
    allBadges: [
      {
        code: "FIRST_COMMIT",
        name: "Genesis Hacker",
        description: "Pushed your first code commit or file to a hackathon workspace.",
        icon: "GitCommit",
        category: "building",
        xpValue: 50,
        rarity: "Common",
      },
      {
        code: "TASK_CRUSHER",
        name: "Task Crusher",
        description: "Completed 5 assigned development sprint tasks.",
        icon: "CheckSquare",
        category: "building",
        xpValue: 120,
        rarity: "Rare",
      },
      {
        code: "TEAM_ANCHOR",
        name: "Team Anchor",
        description: "Successfully assembled or led a team of 3+ builders.",
        icon: "Users",
        category: "collaboration",
        xpValue: 150,
        rarity: "Rare",
      },
      {
        code: "PITCH_PRO",
        name: "Stage Master",
        description: "Uploaded and presented a complete project pitch recording.",
        icon: "Mic",
        category: "pitching",
        xpValue: 200,
        rarity: "Epic",
      },
      {
        code: "MENTOR_FAVORITE",
        name: "Mentor Approved",
        description: "Received top evaluation scores and positive review from a mentor.",
        icon: "Star",
        category: "mentorship",
        xpValue: 250,
        rarity: "Epic",
      },
      {
        code: "PODIUM_FINISHER",
        name: "Hackathon Champion",
        description: "Secured a top 3 finish on the HackHub official leaderboard.",
        icon: "Trophy",
        category: "milestone",
        xpValue: 500,
        rarity: "Legendary",
      },
    ],
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([
    { userName: "DevNinja_99", tier: "Diamond Legend", level: 12, totalXp: 1250 },
    { userName: "Sarah Codes", tier: "Gold Architect", level: 8, totalXp: 820 },
    { userName: "Alex Rivers", tier: "Silver Shipper", level: 4, totalXp: 320 },
    { userName: "CodeCraft", tier: "Bronze Builder", level: 2, totalXp: 180 },
  ]);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    const userId = currentUser?._id || currentUser?.email || "guest";
    const userName = currentUser?.name || "Hacker";
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/gamification/user/${userId}?userName=${encodeURIComponent(userName)}`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      const lbRes = await fetch("http://localhost:5000/api/gamification/leaderboard");
      if (lbRes.ok) {
        const lbJson = await lbRes.json();
        if (lbJson.length > 0) setLeaderboard(lbJson);
      }
    } catch {
      // Fallback works automatically
    } finally {
      setLoading(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Epic":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "Rare":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "GitCommit":
        return <GitCommit className="w-6 h-6" />;
      case "CheckSquare":
        return <CheckSquare className="w-6 h-6" />;
      case "Users":
        return <Users className="w-6 h-6" />;
      case "Mic":
        return <Mic className="w-6 h-6" />;
      case "Star":
        return <Star className="w-6 h-6" />;
      case "Trophy":
        return <Trophy className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const isUnlocked = (code: string) => {
    return data.achievement.unlockedBadges.some((b) => b.badgeCode === code);
  };

  const nextLevelXp = data.achievement.level * 100;
  const currentLevelProgress = (data.achievement.totalXp % 100);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
              Achievements & Hacker XP
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Level up by building features, completing tasks, and helping your hackathon squad.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("badges")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "badges"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Badges ({data.achievement.unlockedBadges.length}/{data.allBadges.length})
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Hacker Leaderboard
            </button>
          </div>
        </div>

        {/* Hero Level & Tier Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-[#0f172a] border border-white/15 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                <Flame className="w-10 h-10 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">
                    {data.achievement.userName}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {data.achievement.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Level {data.achievement.level} Hacker • {data.achievement.totalXp} Total XP
                </p>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="md:w-80 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-gray-300 font-medium">
                <span>Progress to Level {data.achievement.level + 1}</span>
                <span>{currentLevelProgress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${currentLevelProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 text-right">
                {100 - currentLevelProgress} XP remaining for next level
              </p>
            </div>
          </div>
        </div>

        {/* Tab 1: Badges Grid */}
        {activeTab === "badges" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Available Achievement Badges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.allBadges.map((badge) => {
                const unlocked = isUnlocked(badge.code);
                return (
                  <div
                    key={badge.code}
                    className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                      unlocked
                        ? "bg-gradient-to-b from-white/10 to-white/5 border-white/20 shadow-xl"
                        : "bg-white/[0.02] border-white/5 opacity-60 grayscale hover:grayscale-0"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className={`p-3 rounded-xl ${
                            unlocked
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                              : "bg-white/10 text-gray-400"
                          }`}
                        >
                          {getBadgeIcon(badge.icon)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRarityBadge(
                              badge.rarity
                            )}`}
                          >
                            {badge.rarity}
                          </span>
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            +{badge.xpValue} XP
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-base text-white">{badge.name}</h4>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                      {unlocked ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Shield className="w-4 h-4" /> Locked
                        </span>
                      )}
                      <span className="text-gray-400 capitalize">{badge.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              HackHub XP Hall of Fame
            </h3>

            <div className="divide-y divide-white/10">
              {leaderboard.map((user, idx) => (
                <div
                  key={user.userName + idx}
                  className="py-4 flex items-center justify-between hover:bg-white/5 px-4 rounded-xl transition"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? "bg-amber-400 text-black font-extrabold"
                          : idx === 1
                          ? "bg-slate-300 text-black font-extrabold"
                          : idx === 2
                          ? "bg-amber-700 text-white font-extrabold"
                          : "text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white text-sm">{user.userName}</p>
                      <p className="text-xs text-gray-400">{user.tier}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-400" />
                      {user.totalXp} XP
                    </p>
                    <p className="text-xs text-gray-400">Level {user.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
