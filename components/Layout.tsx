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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Files", href: "/files", icon: FileText },
    { name: "Pitch", href: "/pitch", icon: Mic },
    { name: "Team", href: "/team", icon: Users },
  ];

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
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-700/60 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Rocket className="text-white w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight">HackHub</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors focus:outline-none"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#0f172a] border-r border-gray-700 p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between pb-3 border-b border-gray-700/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="text-white w-4 h-4" />
            </div>
            <span className="font-semibold text-xl">HackHub</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-800/60"
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
            <div className="ml-3 overflow-hidden">
              <p className="font-medium text-sm truncate">{currentUser?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser?.role || "Team Member"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/60 transition-all text-sm"
          >
            <LogOut className="mr-3 w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar (hidden on mobile, visible on md and up) */}
      <aside className="hidden md:flex w-64 h-screen bg-[#0f172a]/70 backdrop-blur-md border-r border-gray-700 p-4 flex-col flex-shrink-0 sticky top-0">
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
                    className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-md"
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
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">{currentUser?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser?.role || "Team Member"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-all text-sm"
          >
            <LogOut className="mr-3 w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-full">{children}</main>
    </div>
  );
};

export default Layout;
