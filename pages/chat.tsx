import { FormEvent, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

interface ChatMessage {
  _id: string;
  content: string;
  createdAt: string;
  team: string;
  isCurrentUser: boolean;
  sender: {
    _id: string;
    name: string;
  } | null;
}

interface TeamInfo {
  _id: string;
  name: string;
}

export default function Chat() {
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const fetchTeamChat = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Your session is missing. Please sign in again.");
        }

        const headers = { Authorization: `Bearer ${token}` };
        const teamResponse = await fetch(`${API_URL}/teams/myteam`, {
          headers,
        });
        const teamResult = await teamResponse.json();
        if (!teamResponse.ok) {
          throw new Error(teamResult.message || "Could not load your team");
        }
        if (!active) return;

        const currentTeam: TeamInfo = {
          _id: teamResult.team._id,
          name: teamResult.team.name,
        };
        const messagesResponse = await fetch(
          `${API_URL}/chat/${currentTeam._id}/messages`,
          { headers }
        );
        const messageResult = await messagesResponse.json();
        if (!messagesResponse.ok) {
          throw new Error(
            messageResult.message || "Could not load team messages"
          );
        }
        if (active) {
          setMessages(messageResult.messages);
          setTeam(currentTeam);
        }
      } catch (fetchError) {
        if (active) {
          setTeam(null);
          setMessages([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load team chat"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTeamChat();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!team) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your session is missing. Please sign in again.");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      autoConnect: false,
    });

    const handleMessage = (message: ChatMessage) => {
      if (message.team !== team._id) return;
      setMessages((currentMessages) =>
        currentMessages.some((current) => current._id === message._id)
          ? currentMessages
          : [...currentMessages, message]
      );
    };

    socket.on("connect", () => {
      socket.emit(
        "chat:join",
        team._id,
        (result: { ok: boolean; message?: string }) => {
          if (result.ok) {
            setError("");
          } else {
            setError(result.message || "Could not join team chat");
          }
        }
      );
    });
    socket.on("chat:message", handleMessage);
    socket.on("disconnect", () => {
      setError("Real-time chat disconnected. Reconnecting...");
    });
    socket.on("connect_error", () => {
      setError("Could not connect to real-time chat. Retrying...");
    });
    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [team]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !team || sending) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your session is missing. Please sign in again.");
      return;
    }

    setSending(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/chat/${team._id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Could not send message");
      }
      setMessages((currentMessages) =>
        currentMessages.some(
          (currentMessage) => currentMessage._id === result.message._id
        )
          ? currentMessages
          : [...currentMessages, result.message]
      );
      setNewMessage("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Could not send message"
      );
    } finally {
      setSending(false);
    }
  };

  const summarizeChat = async () => {
    setShowSummaryModal(true);
    setIsGeneratingSummary(true);
    setSummaryText("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const idea = messages
        .map(
          (message) =>
            `${message.sender?.name || "Former member"}: ${message.content}`
        )
        .join("\n");
      const response = await fetch(`${API_URL}/gemini/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not summarize team chat");
      }
      setSummaryText(result.summary);
    } catch (summaryError) {
      console.error("Error summarizing chat:", summaryError);
      setSummaryText("Failed to generate summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <Layout>
      <h2 className="text-display-md font-display text-gradient-primary mb-2 text-glow">
        Team Chat
      </h2>
      <p className="text-body-sm font-body text-zinc-400 mb-6 max-w-3xl">
        Messages are saved to your team and are only available to its members.
      </p>

      <div className="card h-[70vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-zinc-700 pb-3 mb-4">
          <h3 className="text-heading-lg font-heading">
            {team ? `# ${team.name}` : "# team chat"}
          </h3>
          <button
            onClick={summarizeChat}
            className="btn-primary text-sm"
            disabled={loading || messages.length === 0}
          >
            Summarize Chat
          </button>
        </div>

        {error && (
          <div
            className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto space-y-4 pr-2"
          aria-live="polite"
        >
          {loading ? (
            <p className="text-zinc-400">Loading team messages...</p>
          ) : !team ? (
            <p className="text-zinc-400">
              Join or create a team to use team chat.
            </p>
          ) : messages.length === 0 ? (
            <p className="text-zinc-400">
              No messages yet. Send the first message to your team.
            </p>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.isCurrentUser;
              const senderName = message.sender?.name || "Former member";
              return (
                <div
                  key={message._id}
                  className={`flex items-start gap-3 chat-message ${
                    isCurrentUser ? "justify-end" : ""
                  }`}
                >
                  {!isCurrentUser && (
                    <div
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-semibold"
                      aria-hidden="true"
                    >
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={isCurrentUser ? "text-right" : ""}>
                    <p className="text-heading-sm font-heading">
                      {isCurrentUser ? "You" : senderName}
                      <time
                        className="text-caption text-zinc-500 ml-2"
                        dateTime={message.createdAt}
                      >
                        {new Date(message.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </p>
                    <div
                      className={`${
                        isCurrentUser
                          ? "glass bg-gradient-to-r from-purple-600/20 to-pink-600/20"
                          : "glass"
                      } p-3 rounded-xl mt-1 inline-block message-text whitespace-pre-wrap break-words text-left`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="mt-4 pt-4 border-t border-zinc-700 flex gap-3"
        >
          <input
            type="text"
            placeholder={team ? "Type your message..." : "Join a team to chat"}
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            className="input-enhanced w-full placeholder-enhanced"
            maxLength={2000}
            disabled={!team || loading || sending}
            aria-label="Message"
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!team || loading || sending || !newMessage.trim()}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>

      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="card w-full max-w-2xl">
            <h2 className="text-heading-xl font-heading mb-4">
              ✨ AI Chat Summary
            </h2>

            <div className="text-body-md font-body text-zinc-300 max-h-[60vh] overflow-y-auto pr-2">
              {isGeneratingSummary ? (
                <p>Generating summary...</p>
              ) : (
                <p className="whitespace-pre-line">{summaryText}</p>
              )}
            </div>

            <button
              onClick={() => setShowSummaryModal(false)}
              className="w-full mt-6 btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
