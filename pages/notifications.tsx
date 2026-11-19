import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Users,
  UserCheck,
  ClipboardList,
  Clock,
  MessageSquare,
  Trophy,
  Award,
  Filter,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { NotificationCategory, InAppNotification } from '../types/notifications';

const getCategoryBadge = (category: NotificationCategory) => {
  switch (category) {
    case 'team_invitation':
      return { label: 'Team Invitation', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    case 'team_membership':
      return { label: 'Team Update', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    case 'task_assigned':
      return { label: 'Task Assigned', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
    case 'task_deadline':
      return { label: 'Urgent Deadline', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'team_chat':
      return { label: 'Chat Message', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    case 'hackathon_update':
      return { label: 'Hackathon Alert', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    case 'participation_status':
      return { label: 'Status Change', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    default:
      return { label: 'General', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  }
};

export default function NotificationsPage() {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    addNotification,
  } = useAppContext();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = notifications.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (filterRead === 'unread') return !item.read;
    if (filterRead === 'read') return item.read;
    return true;
  });

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'team_invitation', label: 'Team Invitations' },
    { key: 'team_membership', label: 'Team Memberships' },
    { key: 'task_assigned', label: 'Task Assignments' },
    { key: 'task_deadline', label: 'Task Deadlines' },
    { key: 'team_chat', label: 'Chat Messages' },
    { key: 'hackathon_update', label: 'Hackathon Updates' },
    { key: 'participation_status', label: 'Participation Status' },
  ];

  const handleSimulateNotification = () => {
    const templates: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>[] = [
      {
        category: 'team_invitation',
        title: 'New Team Invitation',
        message: 'DevTeam Quantum sent you an invitation to collaborate as Frontend Lead.',
        actionUrl: '/team',
      },
      {
        category: 'task_deadline',
        title: 'Submissions Closing Soon',
        message: 'Reminder: Project code freeze occurs in 4 hours. Verify your repository link!',
        actionUrl: '/tasks',
      },
      {
        category: 'participation_status',
        title: 'Mentorship Session Approved',
        message: 'Mentor Sarah Jenkins accepted your team mentorship slot for 3:00 PM UTC.',
        actionUrl: '/dashboard',
      },
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    addNotification(pick);
  };

  return (
    <>
      <Head>
        <title>In-App Notifications | HackHub</title>
        <meta name="description" content="Manage all your team, task, and hackathon notifications in real time." />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <Link
                  href="/dashboard"
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  In-App Notification Center & Activity Feed
                </h1>
              </div>
              <p className="text-sm text-slate-400">
                Track team invitations, task deadlines, chats, and participation status updates.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSimulateNotification}
                className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sky-400 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simulate Event</span>
              </button>
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              {/* Category selector */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-slate-400 flex items-center space-x-1 font-medium">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Category:</span>
                </span>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-sky-400 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Read/Unread Status */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setFilterRead('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterRead === 'all'
                      ? 'bg-sky-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterRead('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterRead === 'unread'
                      ? 'bg-sky-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unread ({unreadNotificationCount})
                </button>
                <button
                  onClick={() => setFilterRead('read')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterRead === 'read'
                      ? 'bg-sky-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Read ({notifications.length - unreadNotificationCount})
                </button>
              </div>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800/60 p-16 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-semibold text-slate-300">No Notifications Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No notifications match your current filter criteria. Try selecting &quot;All Categories&quot; or simulate a new event.
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const badge = getCategoryBadge(item.category);
                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      !item.read
                        ? 'bg-slate-900/90 border-sky-500/40 shadow-lg shadow-sky-950/20'
                        : 'bg-slate-900/40 border-slate-800/70 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                          )}
                          <h3
                            className={`text-base ${
                              !item.read ? 'font-semibold text-white' : 'font-medium text-slate-300'
                            }`}
                          >
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{item.message}</p>
                        <div className="flex items-center space-x-3 text-xs text-slate-500 pt-1">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.timestamp}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 sm:self-center shrink-0">
                        {item.actionUrl && (
                          <Link
                            href={item.actionUrl}
                            className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-medium transition-colors"
                          >
                            Open Link
                          </Link>
                        )}
                        {!item.read && (
                          <button
                            onClick={() => markNotificationAsRead(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
