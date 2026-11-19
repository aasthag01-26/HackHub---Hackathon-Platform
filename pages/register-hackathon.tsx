import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Upload,
  Github,
  Globe,
  Video,
  FileCheck,
  AlertCircle,
  Plus,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import Layout from '../components/Layout';
import { StudentRegistration, HackathonInvitation, HackathonProjectSubmission } from '../types/registration';
import { INITIAL_REGISTRATIONS, INITIAL_INVITATIONS } from '../data/mockRegistration';

export default function HackathonRegistrationPage() {
  const [registrations, setRegistrations] = useState<StudentRegistration[]>(INITIAL_REGISTRATIONS);
  const [invitations, setInvitations] = useState<HackathonInvitation[]>(INITIAL_INVITATIONS);

  // New Registration Modal Form State
  const [activeTab, setActiveTab] = useState<'my_registrations' | 'create_registration' | 'team_invites'>('my_registrations');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create registration state
  const [regType, setRegType] = useState<'individual' | 'team'>('team');
  const [hackathonTitle, setHackathonTitle] = useState('Global NextGen AI Summit 2026');
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [pendingTeammates, setPendingTeammates] = useState<string[]>([]);

  // Project submission state
  const [submittingRegId, setSubmittingRegId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectTagline, setProjectTagline] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectTech, setProjectTech] = useState('');
  const [projectRepo, setProjectRepo] = useState('');
  const [projectDemo, setProjectDemo] = useState('');
  const [projectVideo, setProjectVideo] = useState('');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddTeammate = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    if (!pendingTeammates.includes(inviteEmail)) {
      setPendingTeammates([...pendingTeammates, inviteEmail]);
    }
    setInviteEmail('');
  };

  const handleRemoveTeammate = (email: string) => {
    setPendingTeammates(pendingTeammates.filter(e => e !== email));
  };

  const handleCreateRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const newReg: StudentRegistration = {
      id: `reg-${Date.now()}`,
      hackathonId: `hack-${Date.now()}`,
      hackathonTitle,
      registrationType: regType,
      teamName: regType === 'team' ? (teamName || 'Innovators Alpha') : undefined,
      teamMembers: [
        { name: 'You', email: 'you@hackhub.io', role: regType === 'team' ? 'Team Lead' : 'Solo Participant', confirmed: true },
        ...pendingTeammates.map(email => ({
          name: email.split('@')[0],
          email,
          role: 'Teammate',
          confirmed: false
        }))
      ],
      participationStatus: 'registered',
      invitationCode: `HACK-${Math.floor(1000 + Math.random() * 9000)}-${regType.toUpperCase()}`,
      registeredAt: new Date().toISOString()
    };

    setRegistrations([newReg, ...registrations]);
    setActiveTab('my_registrations');
    setTeamName('');
    setPendingTeammates([]);
  };

  const handleAcceptInvite = (inviteId: string) => {
    const invite = invitations.find(i => i.id === inviteId);
    if (!invite) return;

    // Add to registrations
    const newReg: StudentRegistration = {
      id: `reg-${Date.now()}`,
      hackathonId: `hack-${Date.now()}`,
      hackathonTitle: invite.hackathonTitle,
      registrationType: 'team',
      teamName: invite.teamName,
      teamMembers: [
        { name: invite.inviterName, email: invite.inviterEmail, role: 'Team Lead', confirmed: true },
        { name: 'You', email: 'you@hackhub.io', role: invite.role, confirmed: true }
      ],
      participationStatus: 'accepted',
      invitationCode: `JOINED-${Math.floor(1000 + Math.random() * 9000)}`,
      registeredAt: new Date().toISOString()
    };

    setRegistrations([newReg, ...registrations]);
    setInvitations(invitations.filter(i => i.id !== inviteId));
  };

  const handleDeclineInvite = (inviteId: string) => {
    setInvitations(invitations.filter(i => i.id !== inviteId));
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingRegId) return;

    const submission: HackathonProjectSubmission = {
      projectTitle,
      tagline: projectTagline,
      description: projectDesc,
      techStack: projectTech.split(',').map(s => s.trim()).filter(Boolean),
      repoUrl: projectRepo,
      demoUrl: projectDemo || undefined,
      videoUrl: projectVideo || undefined,
      submittedAt: new Date().toISOString()
    };

    setRegistrations(registrations.map(r => {
      if (r.id === submittingRegId) {
        return {
          ...r,
          participationStatus: 'submitted',
          projectSubmission: submission
        };
      }
      return r;
    }));

    setSubmittingRegId(null);
    setProjectTitle('');
    setProjectTagline('');
    setProjectDesc('');
    setProjectTech('');
    setProjectRepo('');
    setProjectDemo('');
    setProjectVideo('');
  };

  const getStatusBadge = (status: StudentRegistration['participationStatus']) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</span>;
      case 'submitted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> Project Submitted</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Under Review</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Registered</span>;
    }
  };

  return (
    <Layout>
      <Head>
        <title>Hackathon Participation, Teams & Deliverables | HackHub</title>
        <meta name="description" content="Register individually or with teams, invite teammates, and submit hackathon projects." />
      </Head>

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-700/80">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
              Hackathon Participation & Team Registration
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Register individually or with existing teams, send student invitations, and submit project deliverables.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('create_registration')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-900/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register for Hackathon</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gray-700/80 pb-2">
          <button
            onClick={() => setActiveTab('my_registrations')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'my_registrations'
                ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            My Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('team_invites')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'team_invites'
                ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <span>Team Invitations</span>
            {invitations.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                {invitations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('create_registration')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'create_registration'
                ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 text-cyan-300 border border-cyan-500/40'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            New Registration Form
          </button>
        </div>

        {/* Tab 1: My Registrations List */}
        {activeTab === 'my_registrations' && (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className="p-6 rounded-2xl bg-slate-900/70 border border-gray-700/80 hover:border-gray-600 transition-all backdrop-blur-md space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
                      <h2 className="text-xl font-bold text-white">{reg.hackathonTitle}</h2>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                      <span>Type: <strong className="text-gray-300 uppercase">{reg.registrationType}</strong></span>
                      {reg.teamName && <span>• Team: <strong className="text-cyan-300">{reg.teamName}</strong></span>}
                      <span>• Registered: {new Date(reg.registeredAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(reg.participationStatus)}
                  </div>
                </div>

                {/* Team Members & Invite Code Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-gray-800">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      Team Members ({reg.teamMembers.length})
                    </h3>
                    <ul className="space-y-1.5 text-xs">
                      {reg.teamMembers.map((m, idx) => (
                        <li key={idx} className="flex items-center justify-between text-gray-300 py-0.5">
                          <span>{m.name} <span className="text-gray-500">({m.role})</span></span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            m.confirmed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {m.confirmed ? 'Confirmed' : 'Invite Sent'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-purple-400" />
                      Team Invite Code / Registration Key
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      Share this code with teammates so they can link their profile:
                    </p>
                    <div className="flex items-center space-x-2">
                      <code className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-cyan-300 font-bold text-xs select-all">
                        {reg.invitationCode}
                      </code>
                      <button
                        onClick={() => handleCopyCode(reg.invitationCode)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white transition-colors"
                        title="Copy Code"
                      >
                        {copiedCode === reg.invitationCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Submission Area */}
                <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {reg.projectSubmission ? (
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Project: {reg.projectSubmission.projectTitle}</span>
                      </div>
                      <p className="text-xs text-gray-400">{reg.projectSubmission.tagline}</p>
                      <div className="flex items-center space-x-3 text-xs text-cyan-400 pt-1">
                        <a href={reg.projectSubmission.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                          <Github className="w-3.5 h-3.5" /> Repository
                        </a>
                        {reg.projectSubmission.demoUrl && (
                          <a href={reg.projectSubmission.demoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                            <Globe className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>Project deliverables not yet submitted for this hackathon.</span>
                    </div>
                  )}

                  <button
                    onClick={() => setSubmittingRegId(reg.id)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all self-start sm:self-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{reg.projectSubmission ? 'Update Submission' : 'Submit Project'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Team Invitations Received */}
        {activeTab === 'team_invites' && (
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-gray-800">
                <Mail className="w-10 h-10 text-gray-600 mx-auto mb-2 opacity-50" />
                <h3 className="text-base font-semibold text-gray-300">No Pending Invitations</h3>
                <p className="text-xs text-gray-500 mt-1">When teams invite you to collaborate, their requests will appear here.</p>
              </div>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-gray-700/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                      Team Invite
                    </span>
                    <h3 className="text-lg font-bold text-white">{inv.teamName}</h3>
                    <p className="text-xs text-gray-300">
                      Hackathon: <strong className="text-cyan-300">{inv.hackathonTitle}</strong>
                    </p>
                    <p className="text-xs text-gray-400">
                      Invited by {inv.inviterName} ({inv.inviterEmail}) for role: <strong>{inv.role}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAcceptInvite(inv.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept & Join Team</span>
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(inv.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-gray-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Create Registration Form */}
        {activeTab === 'create_registration' && (
          <form
            onSubmit={handleCreateRegistration}
            className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-gray-700/80 backdrop-blur-md space-y-6 shadow-2xl"
          >
            <div>
              <h2 className="text-xl font-bold text-white">Register for Hackathon</h2>
              <p className="text-xs text-gray-400 mt-1">Choose individual or team registration, add team members, and get started.</p>
            </div>

            {/* Target Hackathon */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Hackathon Name
              </label>
              <input
                type="text"
                required
                value={hackathonTitle}
                onChange={(e) => setHackathonTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
              />
            </div>

            {/* Registration Type Radio */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Registration Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRegType('team')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    regType === 'team'
                      ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-cyan-400 text-white shadow-lg'
                      : 'bg-slate-950 border-gray-800 text-gray-400 hover:bg-slate-800/40'
                  }`}
                >
                  <Users className="w-5 h-5 text-cyan-400 mb-1" />
                  <div className="font-bold text-sm">Team Registration</div>
                  <div className="text-xs text-gray-400">Form a team, generate invite code, and add peers.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType('individual')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    regType === 'individual'
                      ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-cyan-400 text-white shadow-lg'
                      : 'bg-slate-950 border-gray-800 text-gray-400 hover:bg-slate-800/40'
                  }`}
                >
                  <UserPlus className="w-5 h-5 text-purple-400 mb-1" />
                  <div className="font-bold text-sm">Solo / Individual</div>
                  <div className="text-xs text-gray-400">Participate as a solo innovator.</div>
                </button>
              </div>
            </div>

            {/* Team specifics if team chosen */}
            {regType === 'team' && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    placeholder="e.g. CodeWarriors Alpha"
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Invite Teammates by Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      placeholder="teammate@example.com"
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTeammate}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
                    >
                      Add Teammate
                    </button>
                  </div>

                  {pendingTeammates.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pendingTeammates.map((em) => (
                        <span
                          key={em}
                          className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-gray-200 flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{em}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeammate(em)}
                            className="text-gray-400 hover:text-rose-400 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('my_registrations')}
                className="px-4 py-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all"
              >
                Complete Registration
              </button>
            </div>
          </form>
        )}

        {/* Modal: Project Submission */}
        {submittingRegId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl bg-slate-900 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">Submit Hackathon Project</h3>
                </div>
                <button
                  onClick={() => setSubmittingRegId(null)}
                  className="text-gray-400 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitProject} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={projectTitle}
                    placeholder="e.g. EcoPulse Dashboard"
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">One-Line Tagline *</label>
                  <input
                    type="text"
                    required
                    value={projectTagline}
                    placeholder="e.g. Real-time carbon tracking for campus infrastructure"
                    onChange={(e) => setProjectTagline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={projectDesc}
                    placeholder="Describe problem statement, solution, architecture, and impact..."
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tech Stack (comma-separated) *</label>
                  <input
                    type="text"
                    required
                    value={projectTech}
                    placeholder="e.g. Next.js, Express, MongoDB, TailwindCSS, WebSockets"
                    onChange={(e) => setProjectTech(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">GitHub Repo URL *</label>
                    <input
                      type="url"
                      required
                      value={projectRepo}
                      placeholder="https://github.com/org/repo"
                      onChange={(e) => setProjectRepo(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Live Demo URL</label>
                    <input
                      type="url"
                      value={projectDemo}
                      placeholder="https://my-project.vercel.app"
                      onChange={(e) => setProjectDemo(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Demo Video / Pitch URL (YouTube, Loom, etc.)</label>
                  <input
                    type="url"
                    value={projectVideo}
                    placeholder="https://youtu.be/..."
                    onChange={(e) => setProjectVideo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-gray-700 text-white text-sm focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSubmittingRegId(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-gray-300 hover:text-white font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/40"
                  >
                    Submit Deliverable
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
