"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Mail,
  UserPlus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <Bell size={13} />
            <span>Administrative Telemetry // Alerts</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Admin Notification Log
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent hover:underline"
          >
            <CheckCheck size={14} />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`p-5 bg-surface border transition-all duration-200 flex items-start justify-between gap-4 ${
              !n.read ? "border-accent/40 bg-accent/5" : "border-surface-border"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-surface-subtle border border-surface-border shrink-0 mt-0.5">
                {n.type === "COMMENT_REPLY" ? (
                  <MessageSquare size={15} className="text-accent" />
                ) : n.type === "MESSAGE_RECEIVED" ? (
                  <Mail size={15} className="text-emerald-400" />
                ) : (
                  <Sparkles size={15} className="text-foreground" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-display font-medium text-foreground">
                    {n.title}
                  </span>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-accent inline-block" />}
                </div>

                <p className="text-xs font-sans text-muted leading-relaxed font-light">
                  {n.message}
                </p>

                <span className="text-[10px] font-mono text-muted-stone block pt-1">
                  {new Date(n.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {n.link && (
              <Link
                href={n.link}
                className="px-3 py-1.5 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider hover:bg-accent transition-colors flex items-center gap-1 shrink-0 self-center"
              >
                <span>Inspect</span>
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}

        {notifications.length === 0 && !loading && (
          <div className="py-20 text-center border border-dashed border-surface-border p-8 space-y-2">
            <CheckCircle2 size={30} className="mx-auto text-muted/40" />
            <h4 className="text-base font-display font-medium text-foreground">
              No Administrative Alerts
            </h4>
            <p className="text-xs font-mono text-muted">
              System is quiet. All community dispatches are reconciled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

