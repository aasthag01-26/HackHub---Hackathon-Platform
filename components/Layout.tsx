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

  GraduationCap,
  Compass,
  Calendar,
  Menu,
  X,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { logout, currentUser } = useAppContext();

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
    { name: "Files", href: "/files", icon: FileText },
    { name: "Pitch", href: "/pitch", icon: Mic },
    { name: "Team", href: "/team", icon: Users },

    { name: "Mentors", href: "/mentors", icon: GraduationCap },
    { name: "Hackathons", href: "/hackathons", icon: Compass },
    { name: "Organizer", href: "/organizer", icon: Calendar },
  ];

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
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
          <div className="mb-3 flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-sm">
              👤
            </div>
            <div className="ml-3 min-w-0">
              <p className="truncate font-medium">{currentUser?.name || "User"}</p>
              <p className="truncate text-xs text-gray-400">
                {currentUser?.role || "Team Member"}
              </p>
            </div>
          </div>
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
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-sm">
              👤
            </div>
            <div className="ml-3 min-w-0">
              <p className="truncate font-medium">{currentUser?.name || "User"}</p>
              <p className="truncate text-xs text-gray-400">
                {currentUser?.role || "Team Member"}
              </p>
            </div>
          </div>

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
