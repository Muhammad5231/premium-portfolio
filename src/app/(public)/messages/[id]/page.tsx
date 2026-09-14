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
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user, loading: authLoading } = useAuth();
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
      const res = await fetch(`/api/messages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } else if (res.status === 404 || res.status === 401) {
        router.push("/messages");
      }
    } catch (err) {
      console.error("Error loading conversation thread:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?from=/messages/${id}`);
      return;
    }
    if (user) {
      fetchThread();
    }
  }, [user, authLoading, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch message.");
      }

      setReplyText("");
      fetchThread();
    } catch (err: any) {
      setError(err.message || "Failed to transmit message.");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={28} />
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-surface-border">
        <Link
          href="/messages"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Messages Archive</span>
        </Link>

        <span
          className={`px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold ${
            conversation.status === "OPEN"
              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
              : "bg-surface text-muted border border-surface-border"
          }`}
        >
          STATUS // {conversation.status}
        </span>
      </div>

      {/* Thread Subject Title */}
      <div className="mb-8 p-6 bg-surface/40 border border-surface-border space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-accent">
          CONVERSATION SUBJECT
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-medium text-foreground">
          {conversation.subject}
        </h1>
      </div>

      {/* Messages Thread Stage */}
      <div className="space-y-6 mb-8 min-h-[300px]">
        {messages.map((msg) => {
          const isAdmin = msg.senderRole === "admin";
          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isAdmin ? "items-start" : "items-end"}`}
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
                        <strong className="text-accent uppercase">Atelier Principal // Mohammad</strong>
                      </>
                    ) : (
                      <>
                        <User size={12} />
                        <strong className="text-foreground uppercase">{user?.name}</strong>
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

              <span className="text-[10px] font-mono text-muted-stone mt-1 px-1">
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

      {/* Reply Input Form */}
      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400 flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSendReply}
        className="p-4 bg-surface border border-surface-border space-y-3"
      >
        <label className="block text-xs font-mono uppercase tracking-widest text-muted">
          Transmit Reply Payload
        </label>

        <textarea
          rows={3}
          required
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type your response or supplementary requirements..."
          className="w-full bg-background border border-surface-border p-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent resize-none font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-muted">
            Directly encrypted and dispatched to atelier inbox.
          </span>

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
                <span>Dispatch Response</span>
                <Send size={12} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

