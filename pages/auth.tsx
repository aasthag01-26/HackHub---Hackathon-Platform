import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAppContext } from "../context/AppContext";
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  inviteCode?: string;
}

const PENDING_INVITE_KEY = "hackhub_pending_invite_code";

export default function Auth() {
  const router = useRouter();
  const { isAuthenticated, login } = useAppContext();

  const [view, setView] = useState<"initial" | "login" | "signup" | "join">("initial");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const rawApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const API_URL = rawApi.endsWith("/api")
    ? rawApi
    : `${rawApi.replace(/\/+$/, "")}/api`;

  const joinTeamWithCode = useCallback(
    async (codeToJoin: string, authToken: string): Promise<boolean> => {
      const cleanCode = codeToJoin.trim();
      if (!cleanCode || !authToken) return false;

      const res = await fetch(`${API_URL}/teams/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ inviteCode: cleanCode }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to join invited team.");
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem(PENDING_INVITE_KEY);
        if (data.team?._id) {
          const userRaw = localStorage.getItem("user");
          if (userRaw) {
            try {
              const parsedUser = JSON.parse(userRaw);
              parsedUser.teamId = data.team._id;
              localStorage.setItem("user", JSON.stringify(parsedUser));
            } catch {
              // ignore
            }
          }
        }
      }
      return true;
    },
    [API_URL]
  );

  // Read inviteCode, email, and mode from query params
  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") return;

    const queryInvite =
      typeof router.query.inviteCode === "string"
        ? router.query.inviteCode.trim()
        : "";
    const queryEmail =
      typeof router.query.email === "string" ? router.query.email.trim() : "";
    const queryMode =
      typeof router.query.mode === "string" ? router.query.mode.trim() : "";

    if (queryEmail) {
      setEmail(queryEmail);
    }

    if (queryInvite) {
      setInviteCode(queryInvite);
      localStorage.setItem(PENDING_INVITE_KEY, queryInvite);
      if (queryMode === "login") {
        setView("login");
      } else {
        setView("signup");
      }
    } else {
      const savedInvite = localStorage.getItem(PENDING_INVITE_KEY);
      if (savedInvite) {
        setInviteCode(savedInvite);
      }
    }
  }, [router.isReady, router.query.inviteCode, router.query.email, router.query.mode]);

  useEffect(() => {
    const timer = setTimeout(() => setIsCheckingAuth(false), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated || typeof window === "undefined") return;

    const pendingCode =
      inviteCode.trim() || localStorage.getItem(PENDING_INVITE_KEY) || "";
    const token = localStorage.getItem("token");

    if (pendingCode && token) {
      joinTeamWithCode(pendingCode, token)
        .then(() => {
          router.replace("/dashboard");
        })
        .catch(() => {
          router.replace("/dashboard");
        });
      return;
    }

    const fromSignup = localStorage.getItem("fromSignup") === "true";
    if (fromSignup) {
      localStorage.removeItem("fromSignup");
      router.replace("/team-setup");
    } else {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router, isCheckingAuth, inviteCode, joinTeamWithCode]);

  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const clearErrors = () => {
    setFieldErrors({});
    setGlobalError("");
    setSuccessMessage("");
  };

  // LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const errors: FieldErrors = {};
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const pendingCode =
        inviteCode.trim() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(PENDING_INVITE_KEY) || ""
          : "");

      login(data.user?.name || email.split("@")[0], password);

      if (pendingCode && data.token) {
        try {
          await joinTeamWithCode(pendingCode, data.token);
        } catch (joinErr) {
          console.warn("Auto-join after login warning:", joinErr);
        }
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP HANDLER (with automatic team join when inviteCode is present)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const errors: FieldErrors = {};
    if (!username.trim()) {
      errors.name = "Your name is required";
    } else if (username.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address (e.g. user@domain.com)";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "Registration failed. Email may already be in use."
        );
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      const pendingCode =
        inviteCode.trim() ||
        (typeof window !== "undefined"
          ? localStorage.getItem(PENDING_INVITE_KEY) || ""
          : "");

      login(username.trim(), password);

      if (pendingCode && data.token) {
        try {
          await joinTeamWithCode(pendingCode, data.token);
          router.push("/dashboard");
          return;
        } catch (joinErr) {
          const msg =
            joinErr instanceof Error
              ? joinErr.message
              : "Account created, but auto-joining team failed.";
          setGlobalError(msg);
          setView("join");
          return;
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("fromSignup", "true");
      }
      router.push("/team-setup");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to register. Please try again.";
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  // JOIN TEAM WITH CODE HANDLER
  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const errors: FieldErrors = {};
    if (!inviteCode.trim()) {
      errors.inviteCode = "Invite code is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      if (typeof window !== "undefined") {
        localStorage.setItem(PENDING_INVITE_KEY, inviteCode.trim());
      }
      setGlobalError(
        "Please create an account or sign in first—your invite code is saved and will auto-join right after."
      );
      setView("signup");
      return;
    }

    setLoading(true);
    try {
      await joinTeamWithCode(inviteCode.trim(), token);
      setSuccessMessage("Joined team successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to join team. Please verify the code.";
      setGlobalError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen dark-theme-background flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen gradient-bg bg-pattern flex items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>HackHub - Collaborative Hackathon Platform</title>
      </Head>

      <div className="auth-container w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <div className="auth-logo w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="auth-title text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
            HackHub
          </h1>
          <p className="text-slate-400">Where Innovation Meets Collaboration</p>
        </div>

        <div className="auth-card vibrant-card p-8 border border-purple-500/30">
          {inviteCode.trim() && (
            <div className="mb-5 p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs flex items-center justify-between gap-2">
              <span>
                Team Invite Code detected:{" "}
                <strong className="font-mono text-white">{inviteCode.trim()}</strong>
              </span>
              <span className="text-[11px] text-cyan-300">Auto-join enabled</span>
            </div>
          )}

          {globalError && (
            <div className="mb-6 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{globalError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Initial View */}
          {view === "initial" && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Get Started</h2>
              <p className="text-slate-300 mb-8">
                Choose how you&apos;d like to participate in the hackathon
              </p>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("login");
                  }}
                  className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold py-3.5 px-6 rounded-xl border border-slate-600/50 transition-all duration-300"
                >
                  Sign In to Existing Account
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("signup");
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create New Account &amp; Team
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("join");
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Join Team with Invite Code
                </button>
              </div>
            </div>
          )}

          {/* Sign In View */}
          {view === "login" && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("initial");
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                <div className="w-8"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email)
                        setFieldErrors({ ...fieldErrors, email: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-700/60 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-all ${
                      fieldErrors.email
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-600 focus:border-purple-500"
                    }`}
                    placeholder="e.g. member@hackhub.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password)
                          setFieldErrors({ ...fieldErrors, password: undefined });
                      }}
                      className={`w-full px-4 py-2.5 bg-slate-700/60 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-all pr-10 ${
                        fieldErrors.password
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-600 focus:border-purple-500"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-400 mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : inviteCode.trim() ? (
                    "Sign In & Join Team"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="text-center mt-5 text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("signup");
                  }}
                  className="text-pink-400 hover:underline font-semibold ml-1"
                >
                  Create one now
                </button>
              </div>
            </div>
          )}

          {/* Sign Up View */}
          {view === "signup" && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("initial");
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h2 className="text-xl font-bold text-white">Create Account</h2>
                <div className="w-8"></div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (fieldErrors.name)
                        setFieldErrors({ ...fieldErrors, name: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-700/60 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-all ${
                      fieldErrors.name
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-600 focus:border-purple-500"
                    }`}
                    placeholder="e.g. Riya Verma"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-rose-400 mt-1">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email)
                        setFieldErrors({ ...fieldErrors, email: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-700/60 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-all ${
                      fieldErrors.email
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-600 focus:border-purple-500"
                    }`}
                    placeholder="e.g. riya@gmail.com"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-400 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password (min. 6 characters) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password)
                          setFieldErrors({ ...fieldErrors, password: undefined });
                      }}
                      className={`w-full px-4 py-2.5 bg-slate-700/60 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-all pr-10 ${
                        fieldErrors.password
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                          : "border-slate-600 focus:border-purple-500"
                      }`}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-400 mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {inviteCode.trim() && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Invite Code
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-cyan-500/40 rounded-lg text-cyan-300 font-mono text-sm"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : inviteCode.trim() ? (
                    "Create Account & Join Team"
                  ) : (
                    "Sign Up & Create Team"
                  )}
                </button>
              </form>

              <div className="text-center mt-5 text-xs text-slate-400">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("login");
                  }}
                  className="text-purple-400 hover:underline font-semibold ml-1"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* Join Team View */}
          {view === "join" && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    clearErrors();
                    setView("initial");
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h2 className="text-xl font-bold text-white">Join Existing Team</h2>
                <div className="w-8"></div>
              </div>

              <form onSubmit={handleJoinTeam} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter the invite code provided by your team leader.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Team Invite Code *
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      if (fieldErrors.inviteCode)
                        setFieldErrors({ ...fieldErrors, inviteCode: undefined });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-700/60 border rounded-lg text-white font-mono tracking-widest placeholder-slate-500 focus:outline-none transition-all ${
                      fieldErrors.inviteCode
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-600 focus:border-cyan-400"
                    }`}
                    placeholder="e.g. LMBkklRX"
                  />
                  {fieldErrors.inviteCode && (
                    <p className="text-xs text-rose-400 mt-1">
                      {fieldErrors.inviteCode}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Joining Team...</span>
                    </>
                  ) : (
                    "Join Team Now"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}