"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Search,
  Trash2,
  ArrowRight,
  User,
  Clock,
} from "lucide-react";

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/messages", window.location.origin);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchConversations();
  };

  const handleStatusChange = async (id: string, newStatus: "OPEN" | "CLOSED" | "ARCHIVED") => {
    try {
      await fetch(`/api/admin/messages/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently purge this conversation dialogue and all messages?")) return;
    try {
      await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Communication</span>
            <span>//</span>
            <span>Client Dialogue Threads</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Inbound Messages &amp; Inquiries
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-muted uppercase tracking-widest bg-surface border border-surface-border px-3 py-1.5 flex items-center gap-2">
            {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
            <span>{unreadCount} Unread Threads</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface/40 border border-surface-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {["all", "open", "closed", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads, clients..."
            className="w-full bg-background border border-surface-border pl-10 pr-4 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          />
        </form>
      </div>

      {/* Conversations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-muted uppercase tracking-widest bg-surface/20 border border-surface-border">
            Loading dialogue streams...
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-surface-border p-8">
            <Mail size={32} className="mx-auto text-muted/40 mb-3" />
            <h4 className="text-base font-display font-medium text-foreground">
              No Dialogue Threads Found
            </h4>
            <p className="text-xs font-mono text-muted mt-1">
              Select another status filter or wait for inbound commission dispatches.
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              className={`p-6 bg-surface/50 border transition-all duration-300 hover:border-surface-border-strong ${
                conv.unreadByAdmin
                  ? "border-accent/60 bg-accent/5"
                  : "border-surface-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-surface-border">
                <div className="flex items-center gap-3">
                  {conv.unreadByAdmin && (
                    <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                  )}
                  <div>
                    <Link
                      href={`/admin/messages/${conv._id}`}
                      className="text-lg font-display font-medium text-foreground hover:text-accent transition-colors block"
                    >
                      {conv.subject}
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-mono text-muted mt-0.5">
                      <User size={11} />
                      <span>{conv.user?.name || "Member"}</span>
                      <span>&bull;</span>
                      <span>{conv.user?.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${
                      conv.status === "OPEN"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                        : "bg-surface text-muted border-surface-border"
                    }`}
                  >
                    {conv.status}
                  </span>

                  <span className="text-muted text-[11px] flex items-center gap-1">
                    <Clock size={11} />
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </span>
                </div>
              </div>

              {/* Snippet */}
              <p className="text-xs text-muted font-mono line-clamp-2 my-3 pl-2 border-l border-surface-border leading-relaxed">
                {conv.lastSnippet || "No dispatches recorded."}
              </p>

              {/* Actions Bar */}
              <div className="flex items-center justify-between pt-2 text-xs font-mono text-muted">
                <div className="flex items-center gap-3">
                  {conv.status !== "OPEN" && (
                    <button
                      onClick={() => handleStatusChange(conv._id, "OPEN")}
                      className="hover:text-emerald-400 transition-colors uppercase text-[10px]"
                    >
                      Mark Open
                    </button>
                  )}
                  {conv.status !== "CLOSED" && (
                    <button
                      onClick={() => handleStatusChange(conv._id, "CLOSED")}
                      className="hover:text-amber-400 transition-colors uppercase text-[10px]"
                    >
                      Mark Closed
                    </button>
                  )}
                  {conv.status !== "ARCHIVED" && (
                    <button
                      onClick={() => handleStatusChange(conv._id, "ARCHIVED")}
                      className="hover:text-foreground transition-colors uppercase text-[10px]"
                    >
                      Archive
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/messages/${conv._id}`}
                    className="px-3.5 py-1.5 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <span>Open Thread</span>
                    <ArrowRight size={12} />
                  </Link>

                  <button
                    onClick={() => handleDelete(conv._id)}
                    className="p-1.5 text-muted hover:text-red-400 transition-colors"
                    title="Purge Dialogue"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
