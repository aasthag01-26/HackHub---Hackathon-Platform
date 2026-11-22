import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAppContext } from "../context/AppContext";
import { Users, Copy, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

interface SetupMemberRow {
  name: string;
  email: string;
  role: string;
}

export default function TeamSetup() {
  const router = useRouter();
  const {
    setTeamName: updateTeamName,
    setTeamBio: updateTeamBio,
    setDeadline: updateDeadline,
  } = useAppContext();

  const [teamName, setTeamName] = useState("");
  const [teamBio, setTeamBio] = useState(
    "Our team is participating in a hackathon!"
  );
  const [deadline, setDeadline] = useState("");
  const [members, setMembers] = useState<SetupMemberRow[]>([
    { name: "", email: "", role: "Frontend" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const rawApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const API_URL = rawApi.endsWith("/api")
    ? rawApi
    : `${rawApi.replace(/\/+$/, "")}/api`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
      const isAuth = localStorage.getItem("isAuthenticated") === "true";
      if (!isAuth) {
        router.replace("/auth");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const addMemberInput = () => {
    setMembers([...members, { name: "", email: "", role: "Frontend" }]);
  };

  const removeMemberInput = (index: number) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (
    index: number,
    field: "name" | "email" | "role",
    value: string
  ) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      // fallback
    }
  };

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!teamName.trim() || teamName.trim().length < 3) {
      setErrorMessage("Team name must be at least 3 characters long.");
      return;
    }

    if (deadline) {
      const selectedDate = new Date(deadline);
      if (selectedDate.getTime() <= Date.now()) {
        setErrorMessage("Hackathon deadline must be in the future.");
        return;
      }
    }

    // If Member Name is entered, Gmail is mandatory
    for (let i = 0; i < members.length; i++) {
      const mName = members[i].name.trim();
      const mEmail = members[i].email.trim();
      if (mName && !mEmail) {
        setErrorMessage(
          `Gmail is required for Member ${i + 1} (${mName}) when name is entered.`
        );
        return;
      }
      if (mEmail && !isValidEmail(mEmail)) {
        setErrorMessage(`Please enter a valid Gmail address for Member ${i + 1}.`);
        return;
      }
    }

    setLoading(true);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let generatedInvite = `HACK-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      if (token) {
        const res = await fetch(`${API_URL}/teams`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: teamName.trim() }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.team?.inviteCode) {
            generatedInvite = data.team.inviteCode;
          }
          if (data.team?._id) {
            const userRaw = localStorage.getItem("user");
            if (userRaw) {
              const user = JSON.parse(userRaw);
              user.teamId = data.team._id;
              user.role = "leader";
              localStorage.setItem("user", JSON.stringify(user));
            }
          }
        }

        // Send pending invites for rows where email is provided
        for (const member of members) {
          const cleanEmail = member.email.trim().toLowerCase();
          if (cleanEmail) {
            await fetch(`${API_URL}/teams/invite`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ email: cleanEmail }),
            }).catch(() => {});
          }
        }
      }

      updateTeamName(teamName.trim());
      updateTeamBio(teamBio.trim());

      if (deadline) {
        updateDeadline(new Date(deadline));
      }

      setInviteCode(generatedInvite);
      setSuccess(true);
    } catch (error) {
      console.error("Error setting up team:", error);
      setErrorMessage("An unexpected error occurred while setting up your team.");
    } finally {
      setLoading(false);
    }
  };

  const enterDashboard = () => {
    router.push("/dashboard");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen dark-theme-background flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark-theme-background flex items-center justify-center p-4">
      <Head>
        <title>HackHub - Team Setup</title>
      </Head>

      <div className="max-w-2xl mx-auto w-full">
        {!success ? (
          <div className="card border border-purple-500/30">
            <h2 className="text-display-md font-display text-gradient-primary mb-2 text-center text-glow">
              Setup Your Team
            </h2>
            <p className="text-body-sm font-body text-zinc-400 mb-6 text-center">
              Configure your hackathon team identity and invite teammates.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-enhanced">Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Synapse Innovators"
                  className="input-enhanced w-full mt-1 text-white placeholder-zinc-500"
                  required
                />
              </div>

              <div>
                <label className="label-enhanced">Team Bio</label>
                <textarea
                  value={teamBio}
                  onChange={(e) => setTeamBio(e.target.value)}
                  placeholder="Brief description of your hackathon project mission..."
                  className="input-enhanced w-full mt-1 text-white placeholder-zinc-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="label-enhanced">Hackathon Project Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input-enhanced w-full mt-1 text-white"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-caption text-zinc-500 mt-1">
                  Synchronizes with your dashboard countdown timer.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="label-enhanced">
                    Teammates (optional — Gmail required if name is added)
                  </label>
                  <button
                    type="button"
                    onClick={addMemberInput}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>

                {members.map((member, index) => {
                  const nameEntered = Boolean(member.name.trim());
                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
                    >
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          updateMember(index, "name", e.target.value)
                        }
                        placeholder={`Member ${index + 1} Name`}
                        className="input-enhanced flex-1 text-white placeholder-zinc-500"
                      />
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          updateMember(index, "email", e.target.value)
                        }
                        placeholder={
                          nameEntered ? "Gmail * (required)" : "Gmail (optional)"
                        }
                        required={nameEntered}
                        className="input-enhanced flex-1 text-white placeholder-zinc-500"
                      />
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateMember(index, "role", e.target.value)
                        }
                        className="input-enhanced sm:w-36 bg-zinc-900 text-white"
                      >
                        <option value="Frontend" className="bg-zinc-900 text-white">
                          Frontend
                        </option>
                        <option value="Backend" className="bg-zinc-900 text-white">
                          Backend
                        </option>
                        <option value="AI/ML" className="bg-zinc-900 text-white">
                          AI/ML
                        </option>
                        <option value="Designer" className="bg-zinc-900 text-white">
                          Designer
                        </option>
                        <option value="Full Stack" className="bg-zinc-900 text-white">
                          Full Stack
                        </option>
                      </select>
                      {members.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMemberInput(index)}
                          className="p-2 text-zinc-500 hover:text-rose-400 self-end sm:self-center"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-4 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Team &amp; Generating Code...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Create Team &amp; Generate Invite Code</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="vibrant-card text-center p-8 border border-cyan-500/40">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-3xl mx-auto mb-4 border border-cyan-500/50">
              🎉
            </div>
            <h2 className="text-display-sm font-display text-gradient-accent mb-2">
              Team Created Successfully!
            </h2>
            <p className="text-body-sm font-body text-zinc-300 mb-6 max-w-md mx-auto">
              Share this unique team code with your teammates to let them join your
              HackHub workspace.
            </p>

            <div className="glass border-2 border-dashed border-cyan-400/80 rounded-2xl p-6 mb-6 max-w-sm mx-auto">
              <p className="text-display-md font-mono tracking-widest text-gradient-primary font-bold">
                {inviteCode}
              </p>
              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-3 btn-secondary text-xs px-4 py-1.5 flex items-center gap-1.5 mx-auto"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={enterDashboard}
              className="w-full max-w-sm mx-auto btn-primary py-3"
            >
              Enter Team Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}