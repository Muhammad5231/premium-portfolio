"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  Reply,
  ExternalLink,
  ShieldCheck,
  Clock,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  // Admin reply drawer state
  const [replyTarget, setReplyTarget] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/admin/comments?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.items || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Permanently delete this comment?")) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTarget || !replyContent.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/admin/comments/${replyTarget._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });
      if (res.ok) {
        setReplyTarget(null);
        setReplyContent("");
        fetchComments();
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-accent mb-1">
            <MessageSquare size={13} />
            <span>Community Dialogue // Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-light uppercase text-foreground">
            Comment Moderation Cockpit
          </h1>
        </div>

        {/* Quick status tabs */}
        <div className="flex items-center gap-1 bg-surface p-1 border border-surface-border">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${
              statusFilter === "pending"
                ? "bg-foreground text-background font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>Pending</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors ${
              statusFilter === "approved"
                ? "bg-foreground text-background font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>Approved</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {counts.approved}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
              statusFilter === "rejected"
                ? "bg-foreground text-background font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>Rejected</span>
          </button>

          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
              statusFilter === "all"
                ? "bg-foreground text-background font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment._id}
            className="p-6 bg-surface/50 border border-surface-border hover:border-surface-border-strong transition-all space-y-4"
          >
            {/* Top row: User & Target Post */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full bg-surface border border-surface-border overflow-hidden flex items-center justify-center text-xs font-medium">
                  {comment.userId?.avatarUrl ? (
                    <Image
                      src={comment.userId.avatarUrl}
                      alt={comment.userId.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{(comment.userId?.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-display font-medium text-foreground">
                      {comment.userId?.name || "Anonymous"}
                    </span>
                    <span className="text-xs font-mono text-muted">
                      ({comment.userId?.email || "No email"})
                    </span>
                    {comment.isAdminReply && (
                      <span className="text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-1 py-0.2">
                        Admin Reply
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-muted-stone">
                    {new Date(comment.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Target Post Link */}
              {comment.postId && (
                <div className="flex items-center gap-2 text-xs font-mono text-muted">
                  <span>Monograph:</span>
                  <Link
                    href={`/blog/${comment.postId.slug}`}
                    target="_blank"
                    className="text-foreground hover:text-accent transition-colors flex items-center gap-1 font-medium truncate max-w-xs"
                  >
                    <span>{comment.postId.title}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}
            </div>

            {/* Comment Body */}
            <p className="text-sm text-foreground/90 font-light leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-surface-border">
              {comment.content}
            </p>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-muted text-[11px]">STATUS:</span>
                <span
                  className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                    comment.status === "approved"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                      : comment.status === "pending"
                      ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                      : "bg-red-950/40 text-red-400 border border-red-800/40"
                  }`}
                >
                  {comment.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {comment.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(comment._id, "approved")}
                    className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 uppercase tracking-wider flex items-center gap-1 font-semibold transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    <span>Approve</span>
                  </button>
                )}

                {comment.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(comment._id, "rejected")}
                    className="px-3 py-1.5 border border-surface-border text-muted hover:text-amber-400 hover:border-amber-400/50 uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <XCircle size={12} />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setReplyTarget(comment);
                    setReplyContent("");
                  }}
                  className="px-3 py-1.5 bg-foreground text-background hover:bg-accent uppercase tracking-wider flex items-center gap-1 font-medium transition-colors"
                >
                  <Reply size={12} />
                  <span>Reply</span>
                </button>

                <button
                  onClick={() => deleteComment(comment._id)}
                  className="p-1.5 text-muted hover:text-red-400 transition-colors"
                  title="Purge commentary"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && !loading && (
          <div className="py-20 text-center border border-dashed border-surface-border p-8">
            <MessageSquare size={28} className="mx-auto text-muted/40 mb-3" />
            <h4 className="text-base font-display font-medium text-foreground">
              No Comments in this Filter
            </h4>
            <p className="text-xs font-mono text-muted mt-1">
              Select another status tab or view approved records.
            </p>
          </div>
        )}
      </div>

      {/* Admin Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSendReply}
            className="bg-surface border border-surface-border p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-accent uppercase tracking-widest font-semibold">
                <Reply size={13} />
                <span>Admin Reply to {replyTarget.userId?.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="text-muted hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-surface/80 border border-surface-border text-xs font-mono text-muted space-y-1">
              <span className="text-[10px] text-muted uppercase tracking-wider block">
                Original Commentary:
              </span>
              <p className="italic line-clamp-3 text-foreground/80">&quot;{replyTarget.content}&quot;</p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                Your Authoritative Response *
              </label>
              <textarea
                rows={4}
                required
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Provide official architectural or technical clarification..."
                className="w-full bg-background border border-surface-border p-3 text-xs font-mono text-foreground focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <p className="text-[10px] font-mono text-muted">
              Note: Publishing this reply will automatically mark it approved, attach an author badge, and generate an immediate notification for {replyTarget.userId?.name}.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="px-4 py-2 border border-surface-border text-xs font-mono uppercase text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingReply || !replyContent.trim()}
                className="px-5 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-2 font-semibold disabled:opacity-50"
              >
                {sendingReply ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Dispatch Reply &amp; Notify</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

