import { FormEvent, useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Participant {
  _id: string;
  name: string;
  email: string;
}

interface Invitation {
  email: string;
  token: string;
  status: "pending" | "accepted";
}

interface ProjectDetails {
  title: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string;
}

interface Participation {
  _id: string;
  hackathonName: string;
  mode: "individual" | "team";
  teamName?: string;
  createdBy: string;
  members: Array<{ user: Participant; role: string }>;
  invitations: Invitation[];
  project: ProjectDetails;
  registrationStatus: string;
  participationStatus: "registered" | "in_progress" | "completed";
}

interface PendingInvitation {
  token: string;
  hackathonName: string;
  teamName: string;
}

interface ExistingTeam {
  _id: string;
  name: string;
}

interface ProjectDraft extends ProjectDetails {}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Your session is missing. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "The request could not be completed");
  }
  return result as T;
}

export default function ParticipationPage() {
  const router = useRouter();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([]);
  const [existingTeam, setExistingTeam] = useState<ExistingTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hackathonName, setHackathonName] = useState("");
  const [mode, setMode] = useState<"individual" | "team">("individual");
  const [teamChoice, setTeamChoice] = useState<"create" | "existing">("create");
  const [teamName, setTeamName] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [invitationToken, setInvitationToken] = useState("");
  const [projectDrafts, setProjectDrafts] = useState<
    Record<string, ProjectDraft>
  >({});
  const [statusDrafts, setStatusDrafts] = useState<
    Record<string, Participation["participationStatus"]>
  >({});
  const [inviteTarget, setInviteTarget] = useState("");

  const loadData = useCallback(async () => {
    setError("");
    try {
      const [registrationResult, invitationResult] = await Promise.all([
        apiRequest<{ participations: Participation[] }>("/participation/mine"),
        apiRequest<{ invitations: PendingInvitation[] }>(
          "/participation/invitations"
        ),
      ]);
      setParticipations(registrationResult.participations);
      setPendingInvitations(invitationResult.invitations);
      setProjectDrafts(
        Object.fromEntries(
          registrationResult.participations.map((participation) => [
            participation._id,
            participation.project,
          ])
        )
      );
      setStatusDrafts(
        Object.fromEntries(
          registrationResult.participations.map((participation) => [
            participation._id,
            participation.participationStatus,
          ])
        )
      );

      const token = localStorage.getItem("token");
      const teamResponse = await fetch(`${API_URL}/teams/myteam`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (teamResponse.ok) {
        const teamResult = await teamResponse.json();
        setExistingTeam(teamResult.team);
      } else if (teamResponse.status === 404) {
        setExistingTeam(null);
      } else {
        const teamResult = await teamResponse.json();
        throw new Error(teamResult.message || "Could not load your existing team");
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your hackathon registrations"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (router.isReady && typeof router.query.invite === "string") {
      setInvitationToken(router.query.invite);
    }
  }, [router.isReady, router.query.invite]);

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const emails = inviteEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      await apiRequest("/participation/register", {
        method: "POST",
        body: JSON.stringify({
          hackathonName,
          mode,
          ...(mode === "team" && teamChoice === "create"
            ? { teamName }
            : {}),
          ...(mode === "team" && teamChoice === "existing" && existingTeam
            ? { existingTeamId: existingTeam._id }
            : {}),
          inviteEmails: mode === "team" ? emails : [],
        }),
      });
      setHackathonName("");
      setTeamName("");
      setInviteEmails("");
      setNotice("Your hackathon registration is complete.");
      await loadData();
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Could not complete the registration"
      );
    } finally {
      setSaving(false);
    }
  };

  const acceptInvitation = async (token: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest("/participation/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setInvitationToken("");
      setNotice("Invitation accepted. You are now registered with the team.");
      await loadData();
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Could not accept this invitation"
      );
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (id: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/participation/${id}/project`, {
        method: "PATCH",
        body: JSON.stringify(projectDrafts[id]),
      });
      setNotice("Project details saved.");
      await loadData();
    } catch (projectError) {
      setError(
        projectError instanceof Error
          ? projectError.message
          : "Could not save project details"
      );
    } finally {
      setSaving(false);
    }
  };

  const saveStatus = async (id: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/participation/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusDrafts[id] }),
      });
      setNotice("Participation status updated.");
      await loadData();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Could not update participation status"
      );
    } finally {
      setSaving(false);
    }
  };

  const sendInvitations = async (id: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const emails = inviteEmails
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      const result = await apiRequest<{ invitations: Invitation[] }>(
        `/participation/${id}/invitations`,
        {
          method: "POST",
          body: JSON.stringify({ emails }),
        }
      );
      setNotice(
        `Invitations created. Share the invitation link${
          result.invitations.length === 1 ? "" : "s"
        } with the students.`
      );
      setInviteEmails("");
      await loadData();
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Could not create invitations"
      );
    } finally {
      setSaving(false);
    }
  };

  const updateProjectDraft = (
    id: string,
    field: keyof ProjectDetails,
    value: string
  ) => {
    setProjectDrafts((drafts) => ({
      ...drafts,
      [id]: { ...drafts[id], [field]: value },
    }));
  };

  const shareInvitation = async (token: string) => {
    const url = `${window.location.origin}/participation?invite=${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Invitation link copied. Share it with the invited student.");
    } catch {
      setNotice(`Invitation link: ${url}`);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Hackathon Participation - HackHub</title>
      </Head>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-display-md font-display text-gradient-primary text-glow">
            Hackathon Participation
          </h1>
          <p className="mt-2 text-body-sm font-body text-zinc-400">
            Register, coordinate with teammates, submit project details, and
            track your participation.
          </p>
        </header>

        {(error || notice) && (
          <div
            className={`card ${
              error ? "border border-red-500/40 text-red-200" : "text-emerald-200"
            }`}
            role={error ? "alert" : "status"}
          >
            {error || notice}
          </div>
        )}

        {pendingInvitations.length > 0 && (
          <section className="card">
            <h2 className="text-heading-lg font-heading mb-4">
              Team Invitations
            </h2>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.token}
                  className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4"
                >
                  <p>
                    <span className="font-semibold">{invitation.teamName}</span>
                    <span className="text-zinc-400">
                      {" "}
                      invited you to {invitation.hackathonName}
                    </span>
                  </p>
                  <button
                    className="btn-primary"
                    disabled={saving}
                    onClick={() => acceptInvitation(invitation.token)}
                  >
                    Accept invitation
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {invitationToken && (
          <section className="card">
            <h2 className="text-heading-lg font-heading mb-3">
              Accept an invitation
            </h2>
            <p className="mb-4 text-body-sm text-zinc-400">
              Invitations can only be accepted by the student email address
              they were sent to.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className="input-enhanced min-w-0 flex-1"
                aria-label="Invitation token"
                value={invitationToken}
                onChange={(event) => setInvitationToken(event.target.value)}
              />
              <button
                className="btn-primary"
                disabled={saving}
                onClick={() => acceptInvitation(invitationToken)}
              >
                Accept invitation
              </button>
            </div>
          </section>
        )}

        <section className="card">
          <h2 className="text-heading-lg font-heading mb-4">
            Register for a hackathon
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label-enhanced" htmlFor="hackathon-name">
                Hackathon name
              </label>
              <input
                id="hackathon-name"
                className="input-enhanced mt-1 w-full"
                value={hackathonName}
                onChange={(event) => setHackathonName(event.target.value)}
                maxLength={120}
                required
              />
            </div>

            <div>
              <label className="label-enhanced" htmlFor="registration-mode">
                Registration type
              </label>
              <select
                id="registration-mode"
                className="input-enhanced mt-1 w-full"
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as "individual" | "team")
                }
              >
                <option value="individual">Register individually</option>
                <option value="team">Register with a team</option>
              </select>
            </div>

            {mode === "team" && (
              <>
                <div>
                  <label className="label-enhanced" htmlFor="team-choice">
                    Team
                  </label>
                  <select
                    id="team-choice"
                    className="input-enhanced mt-1 w-full"
                    value={teamChoice}
                    onChange={(event) =>
                      setTeamChoice(event.target.value as "create" | "existing")
                    }
                  >
                    <option value="create">Create a new hackathon team</option>
                    {existingTeam && (
                      <option value="existing">
                        Use existing team: {existingTeam.name}
                      </option>
                    )}
                  </select>
                </div>
                {teamChoice === "create" ? (
                  <div>
                    <label className="label-enhanced" htmlFor="team-name">
                      Team name
                    </label>
                    <input
                      id="team-name"
                      className="input-enhanced mt-1 w-full"
                      value={teamName}
                      onChange={(event) => setTeamName(event.target.value)}
                      maxLength={80}
                      required
                    />
                  </div>
                ) : (
                  existingTeam && (
                    <p className="text-body-sm text-zinc-400">
                      The existing team leader must submit this registration.
                    </p>
                  )
                )}
                <div>
                  <label className="label-enhanced" htmlFor="invite-emails">
                    Invite students by email
                  </label>
                  <input
                    id="invite-emails"
                    className="input-enhanced mt-1 w-full"
                    value={inviteEmails}
                    onChange={(event) => setInviteEmails(event.target.value)}
                    placeholder="student@example.edu, teammate@example.edu"
                  />
                  <p className="mt-1 text-caption text-zinc-500">
                    Separate up to 10 email addresses with commas. Invitation
                    links can be shared after registration.
                  </p>
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Registering..." : "Complete registration"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-heading-lg font-heading mb-4">
            Your registrations
          </h2>
          {loading ? (
            <div className="card text-zinc-400">Loading registrations...</div>
          ) : participations.length === 0 ? (
            <div className="card text-zinc-400">
              You do not have any hackathon registrations yet.
            </div>
          ) : (
            <div className="space-y-5">
              {participations.map((participation) => {
                const draft = projectDrafts[participation._id] || {
                  title: "",
                  description: "",
                  repositoryUrl: "",
                  demoUrl: "",
                };
                const canManageTeam =
                  participation.createdBy ===
                  participation.members.find(
                    (member) => member.role === "leader"
                  )?.user?._id;

                return (
                  <article key={participation._id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="text-heading-lg font-heading">
                          {participation.hackathonName}
                        </h3>
                        <p className="mt-1 text-body-sm text-zinc-400">
                          {participation.mode === "team"
                            ? `Team: ${participation.teamName}`
                            : "Individual registration"}
                        </p>
                      </div>
                      <div className="text-right text-body-sm">
                        <p>
                          Registration:{" "}
                          <span className="text-emerald-300">
                            {participation.registrationStatus}
                          </span>
                        </p>
                        <p className="mt-1">
                          Participation:{" "}
                          <span className="text-cyan-300">
                            {participation.participationStatus.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    {participation.mode === "team" && (
                      <div className="mt-4">
                        <h4 className="font-semibold">Team members</h4>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {participation.members.map((member) => (
                            <li
                              className="rounded-full bg-slate-700/70 px-3 py-1 text-sm"
                              key={member.user._id}
                            >
                              {member.user.name} · {member.role}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          className="label-enhanced"
                          htmlFor={`project-title-${participation._id}`}
                        >
                          Project title
                        </label>
                        <input
                          id={`project-title-${participation._id}`}
                          className="input-enhanced mt-1 w-full"
                          value={draft.title}
                          maxLength={120}
                          onChange={(event) =>
                            updateProjectDraft(
                              participation._id,
                              "title",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label
                          className="label-enhanced"
                          htmlFor={`project-repository-${participation._id}`}
                        >
                          Repository URL
                        </label>
                        <input
                          id={`project-repository-${participation._id}`}
                          className="input-enhanced mt-1 w-full"
                          type="url"
                          value={draft.repositoryUrl}
                          onChange={(event) =>
                            updateProjectDraft(
                              participation._id,
                              "repositoryUrl",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label
                          className="label-enhanced"
                          htmlFor={`project-demo-${participation._id}`}
                        >
                          Demo URL
                        </label>
                        <input
                          id={`project-demo-${participation._id}`}
                          className="input-enhanced mt-1 w-full"
                          type="url"
                          value={draft.demoUrl}
                          onChange={(event) =>
                            updateProjectDraft(
                              participation._id,
                              "demoUrl",
                              event.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label
                          className="label-enhanced"
                          htmlFor={`participation-status-${participation._id}`}
                        >
                          Participation status
                        </label>
                        <select
                          id={`participation-status-${participation._id}`}
                          className="input-enhanced mt-1 w-full"
                          value={
                            statusDrafts[participation._id] ||
                            participation.participationStatus
                          }
                          onChange={(event) =>
                            setStatusDrafts((statuses) => ({
                              ...statuses,
                              [participation._id]: event.target
                                .value as Participation["participationStatus"],
                            }))
                          }
                        >
                          <option value="registered">Registered</option>
                          <option value="in_progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          className="label-enhanced"
                          htmlFor={`project-description-${participation._id}`}
                        >
                          Project description
                        </label>
                        <textarea
                          id={`project-description-${participation._id}`}
                          className="input-enhanced mt-1 min-h-24 w-full"
                          value={draft.description}
                          maxLength={3000}
                          onChange={(event) =>
                            updateProjectDraft(
                              participation._id,
                              "description",
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="btn-primary"
                        disabled={saving}
                        onClick={() => saveProject(participation._id)}
                      >
                        Save project details
                      </button>
                      <button
                        className="btn-secondary"
                        disabled={saving}
                        onClick={() => saveStatus(participation._id)}
                      >
                        Update status
                      </button>
                    </div>

                    {participation.mode === "team" && canManageTeam && (
                      <div className="mt-5 border-t border-slate-600/60 pt-4">
                        <label
                          className="label-enhanced"
                          htmlFor={`team-invites-${participation._id}`}
                        >
                          Invite more students
                        </label>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                          <input
                            id={`team-invites-${participation._id}`}
                            className="input-enhanced min-w-0 flex-1"
                            value={
                              inviteTarget === participation._id
                                ? inviteEmails
                                : ""
                            }
                            onFocus={() => setInviteTarget(participation._id)}
                            onChange={(event) => {
                              setInviteTarget(participation._id);
                              setInviteEmails(event.target.value);
                            }}
                            placeholder="student@example.edu"
                          />
                          <button
                            className="btn-secondary"
                            disabled={saving}
                            onClick={() => sendInvitations(participation._id)}
                          >
                            Send invitations
                          </button>
                        </div>
                        {participation.invitations.some(
                          (invitation) => invitation.status === "pending"
                        ) && (
                          <div className="mt-3 space-y-2">
                            {participation.invitations
                              .filter(
                                (invitation) =>
                                  invitation.status === "pending"
                              )
                              .map((invitation) => (
                                <div
                                  key={invitation.token}
                                  className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-300"
                                >
                                  <span>{invitation.email} · Pending</span>
                                  <button
                                    className="text-cyan-300 underline"
                                    onClick={() =>
                                      shareInvitation(invitation.token)
                                    }
                                  >
                                    Copy invitation link
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
