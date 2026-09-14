"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MessageSquare, Bell, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserAccountMenu() {
  const { user, logout, unreadMessages, unreadNotifications, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => openAuthModal("Sign in to access your portfolio member privileges.")}
          className="text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => openAuthModal("Create an account to join the studio community.")}
          className="px-3.5 py-1.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors font-medium"
        >
          Register
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 border border-surface-border bg-surface/60 hover:bg-surface hover:border-surface-border-strong transition-colors focus:outline-none"
      >
        <div className="relative w-6 h-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[11px] font-mono text-accent font-bold overflow-hidden">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
          ) : (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-xs font-mono text-foreground font-medium hidden sm:inline max-w-[100px] truncate">
          {user.name}
        </span>
        <ChevronDown size={12} className="text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-surface-border shadow-2xl z-50 overflow-hidden text-xs font-mono divide-y divide-surface-border">
          {/* User identity card */}
          <div className="p-3 bg-surface/90">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted block">
              Member Identity
            </span>
            <div className="font-display font-medium text-foreground text-sm truncate mt-0.5">
              {user.name}
            </div>
            <span className="text-[10px] text-muted truncate block">
              {user.email}
            </span>
          </div>

          {/* Navigation links */}
          <div className="p-1 space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-muted hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              <User size={13} />
              <span>Profile Preferences</span>
            </Link>

            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-muted hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare size={13} />
                <span>Conversations</span>
              </div>
              {unreadMessages > 0 && (
                <span className="bg-accent text-background px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-muted hover:text-foreground hover:bg-surface-subtle transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell size={13} />
                <span>Notifications</span>
              </div>
              {unreadNotifications > 0 && (
                <span className="bg-accent text-background px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-muted hover:text-red-400 hover:bg-red-950/20 transition-colors text-left"
            >
              <LogOut size={13} />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

