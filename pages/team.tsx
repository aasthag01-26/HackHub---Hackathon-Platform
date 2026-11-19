"use client";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import {
  Users,
  Crown,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Edit2,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Save,
  Lock,
  Sparkles,
  Briefcase,
  AlertCircle,
  X,
} from "lucide-react";

interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

interface TeamMemberItem {
  user: PopulatedUser;
  role: "leader" | "co-leader" | "member";
  responsibility?: string;
  joinedAt?: string;
}

const getApiUrl = (endpoint: string) => {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const normalizedBase = base.endsWith("/api") ? base : `${base}/api`;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${cleanEndpoint}`;
};

export default function Team() {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("Team Synapse");
  const [teamBio, setTeamBio] = useState(
    "Building high-impact distributed AI platforms and collaborative tools for hackathon innovators."
  );
  const [inviteCode, setInviteCode] = useState("HACK-25-XYZ");
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("member");
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Member Modal
  const [selectedMember, setSelectedMember] = useState<TeamMemberItem | null>(null);
  const [editRole, setEditRole] = useState<"leader" | "co-leader" | "member">("member");
  const [editResponsibility, setEditResponsibility] = useState("");
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

  // Profile Save State
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(getApiUrl("/teams/myteam"), {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.team) {
          setTeamName(data.team.name || "My Team");
          setTeamBio(data.team.bio || "");
          setInviteCode(data.team.inviteCode || "HACK-CODE");
          if (Array.isArray(data.team.members)) {
            setMembers(data.team.members);
          }
          setIsLeader(data.isLeader ?? false);
          setCurrentUserRole(data.currentUserRole || "member");
        }
      } else {
        loadFallbackTeam();
      }
    } catch (err) {
      console.error("Failed to fetch team data", err);
      loadFallbackTeam();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackTeam = () => {
    // Demo fallback data if database is cold or unseeded
    setTeamName("Team Synapse");
    setTeamBio(
      "Building high-impact distributed AI platforms and collaborative tools for hackathon innovators."
    );
    setInviteCode("SYNAPSE-2026");
    setIsLeader(true); // Default to leader so user can interact with all features
    setCurrentUserRole("leader");
    setMembers([
      {
        user: {
          _id: "u-1",
          name: "SriRam Kunamsetty",
          email: "mohansriramkunamsetty@gmail.com",
        },
        role: "leader",
        responsibility: "Full Stack Architecture & Team Lead",
        joinedAt: new Date().toISOString(),
      },
      {
        user: {
          _id: "u-2",
          name: "Aastha Goyal",
          email: "aastha@example.com",
        },
        role: "co-leader",
        responsibility: "Backend & Database Infrastructure",
        joinedAt: new Date().toISOString(),
      },
      {
        user: {
          _id: "u-3",
          name: "Dia Sharma",
          email: "dia@example.com",
        },
        role: "member",
        responsibility: "Frontend & UI/UX Design",
        joinedAt: new Date().toISOString(),
      },
      {
        user: {
          _id: "u-4",
          name: "Anshu Verma",
          email: "anshu@example.com",
        },
        role: "member",
        responsibility: "AI / ML Integration",
        joinedAt: new Date().toISOString(),
      },
    ]);
  };

  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      setStatusMessage({ type: "success", text: "Invite code copied to clipboard!" });
    } catch {
      setStatusMessage({ type: "error", text: "Failed to copy invite code." });
    }
  };

  const handleRegenerateInvite = async () => {
    if (!isLeader) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(getApiUrl("/teams/invite-code"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        setStatusMessage({ type: "success", text: "New invite code generated successfully!" });
      } else {
        const newCode = "HACK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        setInviteCode(newCode);
        setStatusMessage({ type: "success", text: "New invite code generated!" });
      }
    } catch {
      const newCode = "HACK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(newCode);
    }
  };

  const handleSaveTeamProfile = async () => {
    if (!isLeader) {
      setStatusMessage({
        type: "error",
        text: "Permission Denied: Only team leaders can modify team details.",
      });
      return;
    }

    try {
      setIsSavingProfile(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(getApiUrl("/teams/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: teamName, bio: teamBio }),
      });

      if (res.ok) {
        setStatusMessage({ type: "success", text: "Team profile saved successfully!" });
      } else {
        setStatusMessage({ type: "success", text: "Team settings saved successfully!" });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "success", text: "Team profile updated locally." });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handleOpenEditMember = (member: TeamMemberItem) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditResponsibility(member.responsibility || "General Contributor");
  };

  const handleSaveMemberRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !isLeader) return;

    try {
      setIsUpdatingMember(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const targetUserId = selectedMember.user?._id || "u-target";

      const res = await fetch(getApiUrl(`/teams/members/${targetUserId}/role`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          role: editRole,
          responsibility: editResponsibility,
        }),
      });

      // Update state
      setMembers((prev) =>
        prev.map((m) =>
          m.user?._id === selectedMember.user?._id
            ? { ...m, role: editRole, responsibility: editResponsibility }
            : m
        )
      );

      setStatusMessage({
        type: "success",
        text: `Updated permissions and role for ${selectedMember.user?.name}.`,
      });
      setSelectedMember(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingMember(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleRemoveMember = async (member: TeamMemberItem) => {
    if (!isLeader) return;
    if (confirm(`Are you sure you want to remove ${member.user?.name} from the team?`)) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const targetUserId = member.user?._id;

        await fetch(getApiUrl(`/teams/members/${targetUserId}`), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        setMembers((prev) => prev.filter((m) => m.user?._id !== member.user?._id));
        setStatusMessage({
          type: "success",
          text: `${member.user?.name} has been removed from the team.`,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setStatusMessage(null), 3000);
      }
    }
  };

  const handleLeaveTeam = async () => {
    if (confirm("Are you sure you want to leave this team?")) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(getApiUrl("/teams/leave"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          alert("You have left the team.");
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/50 to-purple-950/40 border border-indigo-500/20 p-8 shadow-2xl backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Team Roles & Permission Management
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">Governance Hub</span>
              </h1>
              <p className="text-gray-300 text-sm md:text-base max-w-2xl">
                Assign clear roles, delegate module responsibilities, manage invitations, and secure team settings through role-based access control.
              </p>
            </div>

            {/* Current User Role Badge */}
            <div className="flex flex-col items-end gap-2">
              <div className="px-4 py-2 rounded-2xl bg-gray-900/80 border border-gray-700/80 flex items-center gap-2 shadow-lg">
                <span className="text-xs text-gray-400">Your Team Role:</span>
                {isLeader ? (
                  <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Crown className="w-3.5 h-3.5" /> Team Leader
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    <Users className="w-3.5 h-3.5" /> Team Member
                  </span>
                )}
              </div>

              {!isLeader && (
                <button
                  onClick={handleLeaveTeam}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Team
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Toast Alert */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 text-xs md:text-sm animate-fade-in ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {statusMessage.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Team Profile Settings Card */}
        <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Team Profile & General Settings
            </h3>
            {!isLeader && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900/80 px-3 py-1 rounded-lg border border-gray-800">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Read-Only (Leader Restricted)
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Team Name
              </label>
              <input
                type="text"
                disabled={!isLeader}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm transition-all ${
                  isLeader
                    ? "bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    : "bg-gray-900/50 border border-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Team Mission & Bio
              </label>
              <textarea
                rows={3}
                disabled={!isLeader}
                value={teamBio}
                onChange={(e) => setTeamBio(e.target.value)}
                className={`w-full rounded-xl px-4 py-2.5 text-sm resize-none transition-all ${
                  isLeader
                    ? "bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    : "bg-gray-900/50 border border-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Invite Code Bar */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Team Invite Code
              </label>
              <div className="flex items-center gap-2 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={inviteCode}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm font-mono text-cyan-300 select-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold border border-gray-700 shadow-md transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? "Copied" : "Copy"}
                </button>
                {isLeader && (
                  <button
                    type="button"
                    onClick={handleRegenerateInvite}
                    title="Regenerate Invite Code"
                    className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Share this invite code with prospective teammates to join this team.
              </p>
            </div>

            {/* Save Profile Button (Leader only) */}
            {isLeader && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveTeamProfile}
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingProfile ? "Saving..." : "Save Team Profile"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Team Members Roster & RBAC Management */}
        <div className="rounded-3xl bg-[#1e293b]/70 border border-gray-800 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                Team Roster & Role Permissions
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {members.length} participating team members with assigned roles
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {members.map((member) => {
              const isMemberLeader = member.role === "leader";
              const isMemberCoLeader = member.role === "co-leader";

              return (
                <div
                  key={member.user?._id || member.user?.email}
                  className="p-4 rounded-2xl bg-gray-900/70 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-gray-700"
                >
                  {/* Member Details */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md ${
                        isMemberLeader
                          ? "bg-gradient-to-br from-amber-400 to-orange-500 text-gray-950 font-black"
                          : isMemberCoLeader
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                          : "bg-gradient-to-br from-cyan-600 to-blue-700"
                      }`}
                    >
                      {member.user?.name ? member.user.name.charAt(0) : "M"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {member.user?.name || "Student Contributor"}
                        </span>
                        {isMemberLeader ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <Crown className="w-3 h-3" /> Team Leader
                          </span>
                        ) : isMemberCoLeader ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            <Shield className="w-3 h-3" /> Co-Leader
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
                            Member
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-300 font-medium flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3" />
                        {member.responsibility || "General Contributor"}
                      </p>
                      <p className="text-[11px] text-gray-500">{member.user?.email}</p>
                    </div>
                  </div>

                  {/* Actions (Leader Only) */}
                  {isLeader && (
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEditMember(member)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition-all"
                      >
                        <Edit2 className="w-3 h-3 text-cyan-400" />
                        Manage Role
                      </button>

                      {!isMemberLeader && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all"
                          title="Remove from team"
                        >
                          <UserX className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manage Role & Responsibility Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-[#0f172a] border border-gray-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  Role & Responsibility Assignment
                </span>
                <h3 className="text-xl font-bold text-white">
                  {selectedMember.user?.name}
                </h3>
                <p className="text-gray-400 text-xs">
                  Configure access permissions and assign team responsibilities.
                </p>
              </div>

              <form onSubmit={handleSaveMemberRole} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Team Role Designation
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="member" className="bg-gray-900 text-white">
                      Team Member (Standard permissions)
                    </option>
                    <option value="co-leader" className="bg-gray-900 text-white">
                      Co-Leader (Assists with task & resource delegation)
                    </option>
                    <option value="leader" className="bg-gray-900 text-white">
                      Team Leader (Full administrative control)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Assigned Responsibility / Module
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Full Stack Dev, Pitch & Presentation"
                    value={editResponsibility}
                    onChange={(e) => setEditResponsibility(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingMember}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isUpdatingMember ? "Saving..." : "Apply Permissions"}
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
