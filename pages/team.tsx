import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import { useRouter } from "next/router";
import { Users, Copy, CheckCircle2, AlertCircle, LogOut, Edit2, RefreshCw } from "lucide-react";

interface DisplayMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email?: string;
}

interface BackendTeamMember {
  user: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
  role: string;
  _id?: string;
}

interface BackendTeam {
  _id: string;
  name: string;
  inviteCode: string;
  members: BackendTeamMember[];
}

export default function Team() {
  const router = useRouter();
  const {
    teamName: contextTeamName,
    setTeamName: updateContextTeamName,
    teamBio: contextTeamBio,
    setTeamBio: updateContextTeamBio,
  } = useAppContext();

  const [teamName, setTeamName] = useState(contextTeamName || "My Team");
  const [teamBio, setTeamBio] = useState(contextTeamBio || "Collaborative hackathon team.");
  const [inviteCode, setInviteCode] = useState("");
  const [members, setMembers] = useState<DisplayMember[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [currentMember, setCurrentMember] = useState<DisplayMember | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      : { "Content-Type": "application/json" };
  };

  // Fetch real team details from backend
  const fetchMyTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/teams/myteam`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data: { team: BackendTeam } = await res.json();
        if (data.team) {
          setTeamName(data.team.name);
          updateContextTeamName(data.team.name);
          setInviteCode(data.team.inviteCode);

          if (Array.isArray(data.team.members)) {
            const mapped: DisplayMember[] = data.team.members.map((m, idx) => {
              const u = typeof m.user === "object" && m.user ? m.user : null;
              const name = u?.name || `Teammate ${idx + 1}`;
              const email = u?.email;
              const avatar = `https://placehold.co/40x40/38bdf8/ffffff?text=${name
                .charAt(0)
                .toUpperCase()}`;

              return {
                id: m._id || (typeof m.user === "string" ? m.user : String(idx)),
                name,
                role: m.role || "Member",
                avatar,
                email,
              };
            });
            setMembers(mapped);
          }
        }
      } else {
        // Fallback default
        setInviteCode("HACK-" + Math.random().toString(36).substring(2, 6).toUpperCase());
      }
    } catch (err) {
      console.warn("Backend team fetch error, using local state:", err);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE, updateContextTeamName]);

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  const copyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      showToast("success", "Invite code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      showToast("error", "Unable to copy code to clipboard");
    }
  };

  const saveTeamProfile = () => {
    if (!teamName.trim()) {
      showToast("error", "Team name cannot be empty");
      return;
    }
    setIsSaving(true);
    updateContextTeamName(teamName.trim());
    updateContextTeamBio(teamBio.trim());
    setTimeout(() => {
      setIsSaving(false);
      showToast("success", "Team profile updated successfully!");
    }, 300);
  };

  const handleLeaveTeam = async () => {
    setIsLeaving(true);
    try {
      const res = await fetch(`${API_BASE}/teams/leave`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        showToast("success", "Left team successfully.");
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
          const user = JSON.parse(userRaw);
          delete user.teamId;
          localStorage.setItem("user", JSON.stringify(user));
        }
        setTimeout(() => router.push("/team-setup"), 600);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.message || "Failed to leave team.");
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Network error while leaving team.");
    } finally {
      setIsLeaving(false);
      setShowLeaveModal(false);
    }
  };

  const openEditMemberModal = (member: DisplayMember) => {
    setCurrentMember(member);
    setShowEditMemberModal(true);
  };

  const closeEditMemberModal = () => {
    setShowEditMemberModal(false);
    setCurrentMember(null);
  };

  const handleSaveMemberRole = () => {
    if (!currentMember) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === currentMember.id ? currentMember : m))
    );
    closeEditMemberModal();
    showToast("success", `Updated role for ${currentMember.name}`);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-display-md font-display text-gradient-primary mb-1 text-glow">
            Team Workspace & Settings
          </h2>
          <p className="text-body-sm font-body text-zinc-400 max-w-3xl">
            Manage your team's identity, share the unique join code, and view
            all active team members.
          </p>
        </div>
        <button
          onClick={() => fetchMyTeam()}
          disabled={isLoading}
          className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
          title="Refresh team details"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div
          className={`mb-6 p-3.5 rounded-xl border flex items-center gap-2.5 transition-all text-sm ${
            toastMessage.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
              : "bg-rose-500/20 border-rose-500/40 text-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Team Profile Card */}
      <div className="card mb-6 border border-purple-500/20">
        <h3 className="text-heading-lg font-heading text-white mb-4">Team Profile</h3>

        <div className="space-y-4">
          <div>
            <label className="label-enhanced">Team Name *</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="input-enhanced w-full mt-1 text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="label-enhanced">Team Bio</label>
            <textarea
              value={teamBio}
              onChange={(e) => setTeamBio(e.target.value)}
              className="input-enhanced w-full mt-1 h-20 text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="label-enhanced">Team Invite Code</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                readOnly
                value={inviteCode || "Loading..."}
                className="input-enhanced w-full font-mono font-bold tracking-widest text-cyan-400 bg-zinc-900"
              />
              <button
                type="button"
                onClick={copyInviteCode}
                className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-1.5 shrink-0"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-caption text-zinc-500 mt-1">
              Give this code to teammates so they can join your workspace.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={saveTeamProfile}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Profile Changes"}
            </button>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="btn-secondary border-rose-500/40 text-rose-300 hover:border-rose-400 hover:text-rose-200 text-xs px-3 py-2 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Leave Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Members Card */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-heading-lg font-heading text-white">Team Members</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300">
              {members.length}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="loader mx-auto mb-2"></div>
            <p className="text-xs text-zinc-400">Loading team members...</p>
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="glass rounded-xl flex justify-between items-center p-3.5 transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <img
                    src={member.avatar}
                    className="w-10 h-10 rounded-full ring-2 ring-zinc-700 shrink-0"
                    alt={member.name}
                  />
                  <div className="min-w-0">
                    <p className="text-heading-sm font-heading text-white truncate">
                      {member.name}
                    </p>
                    {member.email && (
                      <p className="text-xs text-zinc-400 truncate">{member.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-cyan-300 font-medium">
                    {member.role}
                  </span>
                  <button
                    onClick={() => openEditMemberModal(member)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Edit role"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center rounded-xl border border-dashed border-zinc-800">
            <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-300">No members found</p>
            <p className="text-xs text-zinc-500 mt-1 mb-3">
              Share your team invite code to collaborate with teammates.
            </p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {showEditMemberModal && currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card w-full max-w-sm border border-purple-500/30">
            <h2 className="text-heading-xl font-heading mb-4 text-white">
              Edit Member Role
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label-enhanced">Member Name</label>
                <input
                  type="text"
                  readOnly
                  value={currentMember.name}
                  className="input-enhanced w-full text-zinc-400 bg-zinc-800/60"
                />
              </div>

              <div>
                <label className="label-enhanced">Assign Role</label>
                <select
                  value={currentMember.role}
                  onChange={(e) =>
                    setCurrentMember({
                      ...currentMember,
                      role: e.target.value,
                    })
                  }
                  className="input-enhanced w-full bg-zinc-900 text-white"
                >
                  <option value="Leader" className="bg-zinc-900 text-white">Leader</option>
                  <option value="Frontend" className="bg-zinc-900 text-white">Frontend</option>
                  <option value="Backend" className="bg-zinc-900 text-white">Backend</option>
                  <option value="AI/ML" className="bg-zinc-900 text-white">AI/ML</option>
                  <option value="Designer" className="bg-zinc-900 text-white">Designer</option>
                  <option value="Full Stack" className="bg-zinc-900 text-white">Full Stack</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={closeEditMemberModal}
                  className="w-full btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMemberRole}
                  className="w-full btn-primary"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Team Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card w-full max-w-sm border border-rose-500/40">
            <h2 className="text-heading-xl font-heading text-rose-400 mb-3 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-400" />
              Leave Team?
            </h2>
            <p className="text-body-sm text-zinc-300 mb-5">
              Are you sure you want to leave <strong>{teamName}</strong>? You will
              lose access to team tasks, files, and chat until you re-join.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeaving}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeaveTeam}
                disabled={isLeaving}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50 text-sm"
              >
                {isLeaving ? "Leaving..." : "Confirm Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
