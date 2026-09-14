"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  ShieldCheck,
  User,
  Clock,
  AlertCircle,
  Archive,
  CheckCircle2,
} from "lucide-react";

export default function AdminConversationThreadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [conversation, setConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } else if (res.status === 404) {
        router.push("/admin/messages");
      }
    } catch (err) {
      console.error("Error loading thread:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch reply.");
      }

      setReplyText("");
      fetchThread();
    } catch (err: any) {
      setError(err.message || "Failed to transmit reply.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: "OPEN" | "CLOSED" | "ARCHIVED") => {
    try {
      await fetch(`/api/admin/messages/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchThread();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={28} />
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Communications</span>
        </Link>

        {/* Status controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted uppercase text-[11px]">Thread Status:</span>
          <select
            value={conversation.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="bg-background border border-surface-border px-3 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-accent uppercase"
          >
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Thread Overview Card */}
      <div className="p-6 bg-surface/50 border border-surface-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-widest text-accent">
            COMMISSION INQUIRY // THREAD
          </div>
          <span className="text-[10px] font-mono text-muted">
            Opened: {new Date(conversation.createdAt).toLocaleDateString("en-US")}
          </span>
        </div>

        <h1 className="text-2xl font-display font-medium text-foreground">
          {conversation.subject}
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-muted pt-2 border-t border-surface-border">
          <span>Client: <strong className="text-foreground">{conversation.user?.name}</strong></span>
          <span>&bull;</span>
          <span>Email: <strong className="text-foreground">{conversation.user?.email}</strong></span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="space-y-6 min-h-[300px] my-6">
        {messages.map((msg) => {
          const isAdmin = msg.senderRole === "admin";
          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl p-5 border text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isAdmin
                    ? "bg-surface border-accent/40 text-foreground"
                    : "bg-surface/50 border-surface-border text-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-surface-border/60 pb-2 text-[10px] font-mono text-muted">
                  <div className="flex items-center gap-1.5">
                    {isAdmin ? (
                      <>
                        <ShieldCheck size={12} className="text-accent" />
                        <strong className="text-accent uppercase">Administration (You)</strong>
                      </>
                    ) : (
                      <>
                        <User size={12} />
                        <strong className="text-foreground uppercase">
                          {conversation.user?.name || "Client"}
                        </strong>
                      </>
                    )}
                  </div>
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap font-sans font-light">{msg.content}</p>
              </div>

              <span className="text-[10px] font-mono text-muted mt-1 px-1">
                {new Date(msg.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Dispatch Form */}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400 flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSendReply}
        className="p-5 bg-surface border border-surface-border space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono uppercase tracking-widest text-muted">
            Official Response Dispatch
          </label>
          <span className="text-[10px] font-mono text-accent">
            Will notify {conversation.user?.name} via email &amp; in-app notification center
          </span>
        </div>

        <textarea
          rows={4}
          required
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Compose architectural feedback, fee estimate, or technical clarification..."
          className="w-full bg-background border border-surface-border p-3 text-sm text-foreground focus:outline-none focus:border-accent resize-none font-sans"
        />

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="px-6 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Transmitting...</span>
              </>
            ) : (
              <>
                <span>Send Response &amp; Alert Client</span>
                <Send size={12} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

