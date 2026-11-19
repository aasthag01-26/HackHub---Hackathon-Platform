import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  FileText,
  Mic,
  Users,
  LogOut,
  Rocket,
  BookOpen,
  Sparkles,
  User,
  GraduationCap,
  Compass,
  Menu,
  X,
  Bell,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { logout, currentUser, unreadNotificationCount } = useAppContext();

  const [isLoading, setIsLoading] = useState(true);
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      setIsLocallyAuthenticated(authStatus);
      setIsLoading(false);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    if (!isLoading && !isLocallyAuthenticated) {
      router.push("/auth");
    }
  }, [isLocallyAuthenticated, router, isLoading]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "Team", href: "/team", icon: Users },
    { name: "Mentors", href: "/mentors", icon: GraduationCap },
    { name: "Hackathons", href: "/hackathons", icon: Compass },
    { name: "AI Pitch Copilot", href: "/pitch", icon: Sparkles },
    { name: "Profile", href: "/profile", icon: User },
  ];
  const isNotificationsActive = router.pathname === "/notifications";
  const unreadBadge = unreadNotificationCount > 99 ? "99+" : unreadNotificationCount;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("isAuthenticated");
    router.push("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#312e81] text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLocallyAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#0f172a] to-[#312e81] text-white">
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-gray-700/60 bg-[#0f172a]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">HackHub</span>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label={
              unreadNotificationCount > 0
                ? `Notifications, ${unreadNotificationCount} unread`
                : "Notifications"
            }
            aria-current={isNotificationsActive ? "page" : undefined}
            className={`relative rounded-lg p-2 transition-colors hover:bg-gray-800/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
              isNotificationsActive ? "text-cyan-300" : "text-gray-300"
            }`}
          >
            <Bell className="h-6 w-6" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white">
                {unreadBadge}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-gray-800/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-controls="mobile-navigation"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <aside
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-700 bg-[#0f172a] p-4 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between border-b border-gray-700/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-semibold">HackHub</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1" aria-label="Mobile sections">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-gray-700 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-gray-800/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-shrink-0 flex-col border-r border-gray-700 bg-[#0f172a]/70 p-4 backdrop-blur-md md:flex md:sticky md:top-0">
        <div className="mb-6 text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-lg">
            <Rocket className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-semibold">HackHub</h1>
          <p className="text-sm text-zinc-300 mt-1">Innovate. Collaborate. Launch.</p>
        </div>

        {/* Notifications: single entry point, goes straight to the full-page Notification Center */}
        <Link
          href="/notifications"
          aria-current={isNotificationsActive ? "page" : undefined}
          className={`mb-4 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
            isNotificationsActive
              ? "border-cyan-500/50 bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
              : "border-slate-700/60 bg-slate-800/60 text-slate-200 hover:bg-slate-800"
          }`}
        >
          <span className="flex items-center gap-2">
            <Bell className={`h-4 w-4 ${isNotificationsActive ? "text-white" : "text-sky-400"}`} />
            Notifications
          </span>
          {unreadNotificationCount > 0 ? (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {unreadBadge}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">All read</span>
          )}
        </Link>

        <nav className="flex-1">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white"
                        : "text-gray-300 hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="mr-3 w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-all"
          >
            <LogOut className="mr-3 w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default Layout;
