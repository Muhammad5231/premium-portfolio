"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MessageSquare, Reply, CornerDownRight, Loader2, CheckCircle2, ShieldCheck, AlertCircle, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CommentItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    username?: string;
    avatarUrl?: string;
  };
  content: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  parentId?: string | null;
  isAdminReply?: boolean;
  adminAuthorName?: string;
  createdAt: string;
  replies?: CommentItem[];
}

interface BlogCommentsProps {
  postSlug: string;
  postTitle: string;
}

export default function BlogComments({ postSlug, postTitle }: BlogCommentsProps) {
  const { user, openAuthModal } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [rootContent, setRootContent] = useState("");
  const [submittingRoot, setSubmittingRoot] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Feedback notifications
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/${postSlug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("Sign in to join the conversation and publish a commentary.", () => {
        // Callback after login
      });
      return;
    }

    if (!rootContent.trim()) return;

    setSubmittingRoot(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/blog/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: rootContent.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit comment.");
      }

      setRootContent("");
      setFeedbackMessage(
        data.status === "pending"
          ? "Your commentary has been received and queued for editorial moderation."
          : "Commentary published successfully."
      );
      fetchComments();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit commentary.");
    } finally {
      setSubmittingRoot(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!user) {
      openAuthModal("Sign in to reply to this commentary.");
      return;
    }

    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      const res = await fetch(`/api/blog/${postSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to post reply.");
      }

      setReplyContent("");
      setActiveReplyId(null);
      setFeedbackMessage(
        data.status === "pending"
          ? "Your reply is awaiting editorial review."
          : "Reply submitted."
      );
      fetchComments();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to post reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  // Count total approved comments + replies
  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  return (
    <section id="comments" className="pt-12 sm:pt-16 border-t border-surface-border">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare size={16} className="text-accent" />
          <h3 className="text-lg sm:text-xl font-display font-medium text-foreground uppercase tracking-tight">
            Critical Discussion
          </h3>
          <span className="text-xs font-mono text-muted bg-surface/80 border border-surface-border px-2 py-0.5">
            {totalCommentsCount} Entries
          </span>
        </div>

        <span className="text-[11px] font-mono text-muted uppercase tracking-wider hidden sm:inline">
          Architectural Dialogue // Peer Review
        </span>
      </div>

      {/* Global Notifications */}
      {feedbackMessage && (
        <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-emerald-950/40 border border-emerald-800/50 text-xs font-mono text-emerald-400">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Root Comment Form */}
      {user ? (
        <form onSubmit={handleRootSubmit} className="mb-12 bg-surface/60 border border-surface-border p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 text-xs font-mono text-muted">
            <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[10px] text-accent font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span>
              Posting as <strong className="text-foreground">{user.name}</strong>
            </span>
          </div>

          <textarea
            rows={3}
            required
            value={rootContent}
            onChange={(e) => setRootContent(e.target.value)}
            placeholder="Share technical rationale, critical perspectives, or implementation questions..."
            className="w-full bg-background border border-surface-border p-3.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent resize-none transition-colors"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted">
              Peer-moderated. Respect architectural rigor and community guidelines.
            </span>

            <button
              type="submit"
              disabled={submittingRoot || !rootContent.trim()}
              className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
            >
              {submittingRoot ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Publish Observation</span>
                  <Send size={12} />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Guest Callout to Sign In */
        <div className="mb-12 p-6 sm:p-8 bg-surface/40 border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base font-display font-medium text-foreground">
              Participate in the Critical Dialogue
            </h4>
            <p className="text-xs font-mono text-muted leading-relaxed">
              Create an account or authenticate to contribute peer commentary, critique system design decisions, and engage directly with the author.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAuthModal("Sign in to join the conversation.")}
              className="px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal("Create an account to join the conversation.")}
              className="px-5 py-2.5 border border-surface-border text-foreground font-mono text-xs uppercase tracking-widest hover:border-foreground/60 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Comments Tree */}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="animate-spin text-muted" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-surface-border p-8">
          <p className="text-xs font-mono text-muted">
            Be the first to start the conversation on this monograph.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-surface/30 border border-surface-border p-5 sm:p-6 space-y-4"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full bg-surface border border-surface-border overflow-hidden flex items-center justify-center text-xs font-display font-medium text-foreground">
                    {comment.userId?.avatarUrl ? (
                      <Image
                        src={comment.userId.avatarUrl}
                        alt={comment.userId.name || "User"}
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
                        {comment.userId?.name || "Anonymous Member"}
                      </span>
                      {comment.isAdminReply && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.2 uppercase tracking-wider font-semibold">
                          <ShieldCheck size={11} />
                          <span>Author</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-muted-stone">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      openAuthModal("Sign in to reply to this comment.");
                      return;
                    }
                    setActiveReplyId(activeReplyId === comment._id ? null : comment._id);
                    setReplyContent("");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-muted hover:text-accent transition-colors"
                >
                  <Reply size={12} />
                  <span>Reply</span>
                </button>
              </div>

              {/* Comment Body */}
              <p className="text-xs sm:text-sm text-foreground/90 font-light leading-relaxed pl-11 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Inline Reply Form */}
              {activeReplyId === comment._id && (
                <div className="ml-11 mt-4 p-4 bg-background border border-surface-border space-y-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-accent">
                    <CornerDownRight size={12} />
                    <span>Replying to {comment.userId?.name}</span>
                  </div>

                  <textarea
                    rows={2}
                    required
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a focused reply..."
                    className="w-full bg-surface border border-surface-border p-2.5 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent resize-none"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submittingReply || !replyContent.trim()}
                      onClick={() => handleReplySubmit(comment._id)}
                      className="px-4 py-1.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {submittingReply ? "Posting..." : "Dispatch Reply"}
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 sm:ml-11 mt-4 pt-4 border-t border-surface-border space-y-4">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply._id}
                      className="bg-surface/40 border-l-2 border-accent/40 pl-4 py-2 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-medium text-foreground">
                            {reply.userId?.name || reply.adminAuthorName || "Member"}
                          </span>
                          {reply.isAdminReply && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-accent bg-accent/10 border border-accent/20 px-1 py-0.2 uppercase font-semibold">
                              <ShieldCheck size={10} />
                              <span>Author</span>
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-muted/60">&bull;</span>
                          <span className="text-[10px] font-mono text-muted/60">
                            {new Date(reply.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-foreground/80 font-light leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

