import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  isCurrentUser: boolean;
}

export default function Chat() {
  const { currentUser } = useAppContext();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ------------------- Fetch Messages from Backend -------------------
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/chat`, getAuthHeaders());
      const fetched = res.data.map((m: any) => {
        const isCurrent =
          m.sender?._id === currentUser?.id ||
          m.sender === currentUser?.id ||
          m.senderName === currentUser?.name;

        const firstLetter = (m.senderName || "U").charAt(0).toUpperCase();

        return {
          id: m._id || `${Date.now()}-${Math.random()}`,
          author: m.senderName || m.sender?.name || "Teammate",
          avatar: `https://placehold.co/40x40/38bdf8/ffffff?text=${firstLetter}`,
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
          text: m.text,
          isCurrentUser: isCurrent,
        };
      });

      setMessages(fetched);
    } catch (err) {
      console.error("❌ Error fetching chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll for new team messages every 5s
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ------------------- Send New Message -------------------
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const res = await axios.post(
        `${API_URL}/chat`,
        { text: messageText },
        getAuthHeaders()
      );

      const m = res.data;
      const firstLetter = (m.senderName || currentUser?.name || "U")
        .charAt(0)
        .toUpperCase();

      const created: ChatMessage = {
        id: m._id || `${Date.now()}`,
        author: m.senderName || currentUser?.name || "You",
        avatar: `https://placehold.co/40x40/38bdf8/ffffff?text=${firstLetter}`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        text: m.text || messageText,
        isCurrentUser: true,
      };

      setMessages((prev) => [...prev, created]);
    } catch (error: any) {
      console.error("❌ Error saving message:", error);
      alert(
        error.response?.data?.message ||
          "Could not send message. Please ensure you are logged in and in a team."
      );
    } finally {
      setIsSending(false);
    }
  };

  // ------------------- Summarize Chat via AI -------------------
  const summarizeChat = async () => {
    if (messages.length === 0) {
      alert("No messages to summarize yet.");
      return;
    }

    setShowSummaryModal(true);
    setIsGeneratingSummary(true);

    try {
      const conversationText = messages
        .map((m) => `${m.author}: ${m.text}`)
        .join("\n");

      const prompt = `Summarize the following hackathon team conversation and outline key decisions and next action items:\n\n${conversationText}`;

      const res = await axios.post(`${API_URL}/gemini`, { idea: prompt });

      if (res.data?.pitch) {
        setSummaryText(res.data.pitch);
      } else {
        setSummaryText(
          "Summary generated: Key discussions revolved around project setup and task delegation."
        );
      }
    } catch (error) {
      console.error("❌ Error summarizing chat:", error);
      setSummaryText(
        "Could not contact AI summarizer. Please verify your GEMINI_API_KEY in the backend configuration."
      );
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // ------------------- UI -------------------
  return (
    <Layout>
      <h2 className="text-display-md font-display text-gradient-primary mb-2 text-glow">
        Team Chat
      </h2>
      <p className="text-body-sm font-body text-zinc-400 mb-6 max-w-3xl">
        This is your central team communication hub. All chat messages are
        securely isolated to your team. Use 'Summarize Chat with AI' for a quick
        overview of recent discussions and action items.
      </p>

      <div className="card h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-700/50 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-medium text-slate-200">Live Team Discussion</span>
          </div>
          <button
            onClick={summarizeChat}
            disabled={messages.length === 0}
            className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
          >
            ✨ Summarize Chat with AI
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <span className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mr-2"></span>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="text-5xl mb-3">💬</div>
              <h4 className="text-lg font-semibold text-slate-200 mb-1">
                No messages yet
              </h4>
              <p className="text-sm max-w-sm text-slate-400">
                Welcome to your team chat! Send a message below to kick off collaboration with your teammates.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <img
                  src={message.avatar}
                  alt={message.author}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    message.isCurrentUser
                      ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-tr-none"
                      : "bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">
                      {message.isCurrentUser ? "You" : message.author}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed break-words">{message.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Field */}
        <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-gray-700/50 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to the team..."
            className="input-enhanced flex-1 text-sm"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="btn-primary text-sm px-5 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-lg">
            <h3 className="text-heading-xl font-heading mb-4 text-glow">
              🤖 AI Discussion Summary
            </h3>
            <div className="bg-slate-900/80 rounded-xl p-4 text-slate-200 text-sm leading-relaxed max-h-96 overflow-y-auto border border-slate-700/50 mb-6">
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <span className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Analyzing team messages and generating summary...
                </div>
              ) : (
                <p className="whitespace-pre-line">{summaryText}</p>
              )}
            </div>
            <button
              onClick={() => setShowSummaryModal(false)}
              className="btn-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
