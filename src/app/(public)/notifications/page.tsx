"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Mail,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const url = new URL("/api/notifications", window.location.origin);
      if (activeFilter !== "ALL") url.searchParams.set("type", activeFilter);
      if (unreadOnly) url.searchParams.set("unread", "true");

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/notifications");
      return;
    }
    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading, activeFilter, unreadOnly]);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      refreshUser();
      if (link) {
        router.push(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "COMMENT_REPLY":
      case "COMMENT_APPROVED":
        return <MessageSquare size={16} className="text-accent" />;
      case "COMMENT_REJECTED":
        return <ShieldAlert size={16} className="text-amber-400" />;
      case "ADMIN_MESSAGE":
      case "MESSAGE_RECEIVED":
        return <Mail size={16} className="text-emerald-400" />;
      default:
        return <Sparkles size={16} className="text-accent" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={28} />
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-4 sm:px-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-surface-border">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Portfolio</span>
        </Link>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent hover:underline"
          >
            <CheckCheck size={14} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="mb-10 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-accent">
          <Bell size={13} />
          <span>NOTIFICATION CENTER // REAL-TIME LOG</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-light uppercase tracking-tight text-foreground">
          System &amp; Editorial Alerts
        </h1>
        <p className="text-xs sm:text-sm font-sans font-light text-muted max-w-2xl leading-relaxed">
          Chronological record of peer review replies, editorial decisions, and direct administrative communiqués.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-surface/50 border border-surface-border mb-8 text-xs font-mono">
        <div className="flex items-center gap-1 overflow-x-auto">
          {["ALL", "COMMENTS", "MESSAGES", "SYSTEM"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 uppercase tracking-wider transition-colors ${
                activeFilter === tab
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-mono text-muted cursor-pointer pr-2">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="w-3.5 h-3.5 accent-accent"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            onClick={() => markAsRead(notif._id, notif.link)}
            className={`p-5 bg-surface border transition-all duration-200 cursor-pointer hover:border-surface-border-strong flex items-start justify-between gap-4 group ${
              !notif.read ? "border-accent/40 bg-accent/5" : "border-surface-border"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-surface-subtle border border-surface-border shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-display font-medium text-foreground group-hover:text-accent transition-colors">
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-accent inline-block shrink-0" />
                  )}
                </div>

                <p className="text-xs text-muted font-sans font-light leading-relaxed">
                  {notif.message}
                </p>

                <span className="text-[10px] font-mono text-muted-stone block pt-1">
                  {new Date(notif.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {notif.link && (
              <div className="shrink-0 p-2 text-muted group-hover:text-foreground transition-colors self-center">
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-20 text-center border border-dashed border-surface-border p-10 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-muted/40" />
            <h3 className="text-base font-display font-medium text-foreground">
              You&apos;re All Caught Up
            </h3>
            <p className="text-xs font-mono text-muted">
              No notifications matching the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

