"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Database, Clock, Bell } from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface AdminHeaderProps {
  admin: SessionUser;
}

export default function AdminHeader({ admin }: AdminHeaderProps) {
  const [utcTime, setUtcTime] = useState<string>("");
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const checkNotifs = () => {
      fetch("/api/admin/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.unreadCount !== undefined) setUnreadNotifs(data.unreadCount);
        })
        .catch(() => {});
    };
    checkNotifs();
    const notifTimer = setInterval(checkNotifs, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(notifTimer);
    };
  }, []);

  return (
    <header className="h-14 border-b border-surface-border bg-surface/40 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between shrink-0">
      {/* Left: Telemetry & DB Status */}
      <div className="flex items-center gap-4 text-xs font-mono text-muted">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-muted-stone">DATABASE // CONNECTED</span>
        </div>
        <span className="hidden sm:inline text-muted/40">&bull;</span>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted/70">
          <Clock size={12} />
          <span>{utcTime || "UTC TIME"}</span>
        </div>
      </div>

      {/* Right: Quick Launch, Admin Notification Bell & Role Badge */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/notifications"
          className="relative p-1.5 text-muted hover:text-foreground transition-colors"
          title="Admin Notification Center"
        >
          <Bell size={15} />
          {unreadNotifs > 0 && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-accent text-background font-mono text-[8px] font-bold flex items-center justify-center animate-pulse">
              {unreadNotifs > 9 ? "9+" : unreadNotifs}
            </span>
          )}
        </Link>

        <div className="w-[1px] h-3.5 bg-surface-border" />

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted hover:text-accent transition-colors"
        >
          <span>Live Site</span>
          <ExternalLink size={12} />
        </Link>

        <div className="w-[1px] h-3.5 bg-surface-border hidden sm:block" />

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="text-muted text-[11px]">ROLE:</span>
          <span className="text-accent uppercase tracking-wider text-[11px] font-semibold bg-accent/10 border border-accent/30 px-2 py-0.5">
            {admin.role}
          </span>
        </div>
      </div>
    </header>
  );
}

