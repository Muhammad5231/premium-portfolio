"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Mail,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserMessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/messages");
      return;
    }

    if (user) {
      fetch("/api/messages")
        .then((res) => res.json())
        .then((data) => setConversations(data.items || []))
        .catch((err) => console.error("Error loading messages:", err))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={28} />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-4 sm:px-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Portfolio</span>
        </Link>

        <Link
          href="/#contact"
          className="text-xs font-mono text-accent hover:underline uppercase tracking-wider"
        >
          + Initiate New Dialogue
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-accent">
          <MessageSquare size={13} />
          <span>CONFIDENTIAL COMMUNICATIONS // CHANNEL 04</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-light uppercase tracking-tight text-foreground">
          Dialogue Archive
        </h1>
        <p className="text-xs sm:text-sm font-sans font-light text-muted max-w-2xl leading-relaxed">
          Private, encrypted communications between yourself and the atelier regarding active commissions, technical advisory, and architectural deliverables.
        </p>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {conversations.map((conv) => (
          <Link
            key={conv._id}
            href={`/messages/${conv._id}`}
            className={`block p-6 bg-surface border transition-all duration-300 hover:border-surface-border-strong group ${
              conv.unreadByUser
                ? "border-accent/60 bg-accent/5"
                : "border-surface-border"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {conv.unreadByUser && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
                <h3 className="text-lg font-display font-medium text-foreground group-hover:text-accent transition-colors">
                  {conv.subject}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-muted">
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                    conv.status === "OPEN"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                      : "bg-surface text-muted border border-surface-border"
                  }`}
                >
                  {conv.status}
                </span>

                <span>
                  {new Date(conv.lastMessageAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted font-mono line-clamp-2 leading-relaxed">
              {conv.lastSenderRole === "admin" && (
                <strong className="text-accent uppercase mr-1.5">[Atelier Response]:</strong>
              )}
              {conv.lastSnippet || "No dispatches recorded."}
            </p>

            <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-muted">
              <span>Inspect dialogue thread</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}

        {conversations.length === 0 && (
          <div className="py-20 text-center border border-dashed border-surface-border p-10 space-y-3">
            <Mail size={32} className="mx-auto text-muted/40" />
            <h3 className="text-base font-display font-medium text-foreground">
              No Conversations Recorded
            </h3>
            <p className="text-xs font-mono text-muted max-w-sm mx-auto leading-relaxed">
              You haven&apos;t initiated any private commission dialogues yet. Use the contact console on the homepage to start a conversation.
            </p>
            <Link
              href="/#contact"
              className="inline-block mt-4 px-6 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Initiate Dialogue
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

