"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, MessageSquare, Mail, Sparkles, ShieldAlert, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotificationDropdown() {
  const router = useRouter();
  const { user, unreadNotifications, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchRecent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecent();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      refreshUser();
      if (link) {
        setIsOpen(false);
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
      refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted hover:text-foreground transition-colors focus:outline-none"
        aria-label="Toggle notifications center"
      >
        <Bell size={16} />
        {unreadNotifications > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-background font-mono text-[9px] font-bold flex items-center justify-center animate-pulse-subtle">
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-surface-border shadow-2xl z-50 overflow-hidden text-xs font-mono">
          {/* Top Bar */}
          <div className="p-3.5 bg-surface/90 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span className="font-semibold uppercase tracking-wider text-foreground">
                Alerts Center
              </span>
            </div>

            <div className="flex items-center gap-3">
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] text-accent hover:underline uppercase"
                  title="Mark all as read"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => markAsRead(notif._id, notif.link)}
                className={`p-3.5 hover:bg-surface-subtle transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                  !notif.read ? "bg-accent/5" : ""
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-semibold truncate block">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted font-sans font-light line-clamp-2 leading-snug">
                    {notif.message}
                  </p>
                  <span className="text-[9px] text-muted-stone block">
                    {new Date(notif.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <ArrowRight size={12} className="text-muted shrink-0 self-center" />
              </div>
            ))}

            {notifications.length === 0 && !loading && (
              <div className="py-8 text-center text-muted">
                <span className="text-[11px] block">You&apos;re all caught up.</span>
                <span className="text-[10px] text-muted-stone">No unread alerts.</span>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="p-3 bg-surface/80 border-t border-surface-border text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-accent hover:underline uppercase tracking-wider block"
            >
              View All Notifications ({unreadNotifications} Unread) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

