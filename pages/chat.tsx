import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import { MessageSquare, Send, Sparkles, RefreshCw } from "lucide-react";

interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  isCurrentUser: boolean;
}

interface BackendMessage {
  _id: string;
  sender?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Chat() {
  const { currentUser, teamName } = useAppContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Convert backend message to UI chat message
  const formatBackendMessage = useCallback(
    (m: BackendMessage): ChatMessage => {
      const isCurrent =
        Boolean(currentUser?.name) &&
        (m.senderName.toLowerCase() === (currentUser?.name || "").toLowerCase() ||
          m.sender?.name?.toLowerCase() === (currentUser?.name || "").toLowerCase());

      const dateObj = m.createdAt ? new Date(m.createdAt) : new Date();
      const timeStr = dateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: m._id,
        author: m.senderName || m.sender?.name || "Teammate",
        avatar:
          m.senderAvatar ||
          `https://placehold.co/40x40/8b5cf6/ffffff?text=${(
            m.senderName || "T"
          )
            .charAt(0)
            .toUpperCase()}`,
        time: timeStr,
        text: m.text,
        isCurrentUser: isCurrent,
      };
    },
    [currentUser?.name]
  );

  // Fetch messages from backend
  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const res = await fetch(`${API_BASE}/chat`, {
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          const data: BackendMessage[] = await res.json();
          if (Array.isArray(data)) {
            const formatted = data.map(formatBackendMessage);
            setMessages(formatted);
            if (typeof window !== "undefined") {
              localStorage.setItem("hackhub_chat", JSON.stringify(formatted));
            }
          }
        }
      } catch (err) {
        if (!silent) console.warn("Chat backend unavailable, using local history:", err);
        const cached = localStorage.getItem("hackhub_chat");
        if (cached && messages.length === 0) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) setMessages(parsed);
          } catch {
            // ignore
          }
        }
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [API_BASE, formatBackendMessage, messages.length]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time polling for team chat updates (every 3 seconds when document is visible)
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        fetchMessages(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Send new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    const temporaryId = `msg-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: temporaryId,
      author: currentUser?.name || "You",
      avatar:
        currentUser?.avatar ||
        `https://placehold.co/40x40/8b5cf6/ffffff?text=${(
          currentUser?.name || "Y"
        )
          .charAt(0)
          .toUpperCase()}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: messageText,
      isCurrentUser: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: messageText }),
      });

      if (res.ok) {
        const saved: BackendMessage = await res.json();
        const formatted = formatBackendMessage(saved);
        setMessages((prev) =>
          prev.map((m) => (m.id === temporaryId ? formatted : m))
        );
      }
    } catch (err) {
      console.warn("Backend send message error, kept in local state:", err);
    } finally {
      setIsSending(false);
    }
  };

  // AI Chat Summary
  const summarizeChat = async () => {
    setShowSummaryModal(true);
    setIsGeneratingSummary(true);

    try {
      const chatPayload = {
        chat: messages.map((m) => ({
          author: m.author,
          message: m.text,
        })),
      };

      const res = await fetch(`${API_BASE}/gemini/summarize`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(chatPayload),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setSummaryText(data.summary || "Summary generated successfully.");
      } else {
        // Fallback local extractive summary
        const topics = messages
          .slice(-10)
          .map((m) => `• ${m.author}: "${m.text}"`)
          .join("\n");
        setSummaryText(
          `Recent Team Discussion Summary (${messages.length} total messages):\n\n${topics || "No recent messages to summarize."}`
        );
      }
    } catch {
      setSummaryText("Unable to generate automated summary at this time.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-display-md font-display text-gradient-primary mb-1 text-glow">
            Team Chat
          </h2>
          <p className="text-body-sm font-body text-zinc-400 max-w-2xl">
            Real-time, team-isolated discussion channel for {teamName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMessages()}
            disabled={isRefreshing}
            className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
            title="Refresh messages"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <button
            onClick={summarizeChat}
            className="btn-primary text-sm flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Summary</span>
          </button>
        </div>
      </div>

      <div className="card h-[72vh] flex flex-col border border-zinc-700/80 p-0 overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-zinc-800 bg-[#0f172a]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-semibold text-white text-base">#{teamName.toLowerCase().replace(/\s+/g, "-")}</h3>
            <span className="text-xs text-zinc-400">Team Room</span>
          </div>
          <span className="text-xs text-zinc-400">{messages.length} messages</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <img
                  src={message.avatar}
                  className="w-9 h-9 rounded-full ring-2 ring-zinc-700 shrink-0"
                  alt={message.author}
                />
                <div
                  className={`max-w-[80%] sm:max-w-[70%] ${
                    message.isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  <p className="text-xs font-semibold text-zinc-300 mb-1">
                    {message.author}
                    <span className="text-[10px] text-zinc-500 font-normal ml-2">
                      {message.time}
                    </span>
                  </p>
                  <div
                    className={`p-3 rounded-2xl inline-block text-sm leading-relaxed text-left break-words ${
                      message.isCurrentUser
                        ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-md rounded-tr-none"
                        : "glass text-zinc-200 border border-zinc-700/80 rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <MessageSquare className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-base font-medium text-zinc-300">
                Start a conversation!
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                This channel is strictly isolated for {teamName}. Messages sent here
                are persisted in MongoDB and updated in real-time.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-zinc-800 bg-[#0f172a]/95 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Message #${teamName.toLowerCase().replace(/\s+/g, "-")}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="input-enhanced flex-1 text-white placeholder-zinc-500 py-2.5 px-4"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="btn-primary py-2.5 px-4 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* AI Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card w-full max-w-2xl border border-purple-500/40">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h2 className="text-heading-xl font-heading text-white">
                AI Chat Summary
              </h2>
            </div>

            <div className="text-body-md font-body text-zinc-200 max-h-[55vh] overflow-y-auto pr-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              {isGeneratingSummary ? (
                <div className="py-8 text-center">
                  <div className="loader mx-auto mb-2"></div>
                  <p className="text-xs text-zinc-400">Summarizing conversation...</p>
                </div>
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {summaryText}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowSummaryModal(false)}
              className="w-full mt-5 btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
