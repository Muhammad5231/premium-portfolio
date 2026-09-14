"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Bell,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowLeft,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateProfile, logout, unreadNotifications, unreadMessages } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [commentReplies, setCommentReplies] = useState(true);
  const [adminMessages, setAdminMessages] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
      if (user.notificationPreferences) {
        setEmailNotifications(user.notificationPreferences.emailNotifications ?? true);
        setCommentReplies(user.notificationPreferences.commentReplies ?? true);
        setAdminMessages(user.notificationPreferences.adminMessages ?? true);
      }
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={28} />
      </div>
    );
  }

  if (!user) {
    router.push("/login?from=/profile");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMessage("New passwords do not match.");
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters.");
        setSaving(false);
        return;
      }
      if (!currentPassword) {
        setErrorMessage("Current password is required to change password.");
        setSaving(false);
        return;
      }
    }

    const res = await updateProfile({
      name,
      username,
      bio,
      avatarUrl,
      notificationPreferences: {
        emailNotifications,
        commentReplies,
        adminMessages,
      },
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });

    setSaving(false);

    if (res.success) {
      setSuccessMessage("Profile preferences updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setErrorMessage(res.error || "Failed to update profile.");
    }
  };

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

        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="flex items-center gap-2 text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            <MessageSquare size={13} />
            <span>Messages {unreadMessages > 0 && `(${unreadMessages})`}</span>
          </Link>

          <Link
            href="/notifications"
            className="flex items-center gap-2 text-xs font-mono text-muted hover:text-foreground transition-colors"
          >
            <Bell size={13} />
            <span>Alerts {unreadNotifications > 0 && `(${unreadNotifications})`}</span>
          </Link>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-red-400 transition-colors uppercase tracking-wider pl-2 border-l border-surface-border"
          >
            <LogOut size={13} />
            <span>Exit Session</span>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 bg-surface/60 border border-surface-border">
        <div className="relative w-20 h-20 bg-surface-subtle border border-surface-border flex items-center justify-center shrink-0 overflow-hidden">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={user.name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-2xl font-display font-light text-foreground">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-accent">
            <span className="w-1.5 h-1.5 bg-accent" />
            <span>AUTHENTICATED MEMBER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-light text-foreground truncate">
            {user.name}
          </h1>
          <p className="text-xs font-mono text-muted truncate">
            {user.email} {user.username ? `• @${user.username}` : ""}
          </p>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-emerald-950/40 border border-emerald-800/50 text-xs font-mono text-emerald-400">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Settings Form */}
      <form onSubmit={handleSave} className="space-y-10">
        {/* Section 1: Public Identity */}
        <div className="p-6 sm:p-8 bg-surface/40 border border-surface-border space-y-6">
          <div className="border-b border-surface-border pb-3">
            <h3 className="text-base font-display font-medium text-foreground flex items-center gap-2">
              <User size={16} className="text-accent" />
              <span>Public Identity</span>
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              Controls how your identity is presented on blog comments and discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Unique Handle / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. arch_critic"
                className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Short Bio / Editorial Focus
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief background, research interests, or architectural focus..."
              className="w-full bg-background border border-surface-border p-3 text-sm text-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        {/* Section 2: Notification Preferences */}
        <div className="p-6 sm:p-8 bg-surface/40 border border-surface-border space-y-6">
          <div className="border-b border-surface-border pb-3">
            <h3 className="text-base font-display font-medium text-foreground flex items-center gap-2">
              <Bell size={16} className="text-accent" />
              <span>Notification Preferences</span>
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              Configure which events trigger alerts in your in-app notification center.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 bg-background border border-surface-border cursor-pointer hover:border-surface-border-strong transition-colors">
              <div>
                <span className="text-sm font-mono text-foreground block">Comment Replies</span>
                <span className="text-xs font-mono text-muted">Receive alerts when admins or users reply to your comments.</span>
              </div>
              <input
                type="checkbox"
                checked={commentReplies}
                onChange={(e) => setCommentReplies(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-background border border-surface-border cursor-pointer hover:border-surface-border-strong transition-colors">
              <div>
                <span className="text-sm font-mono text-foreground block">Admin Direct Messages</span>
                <span className="text-xs font-mono text-muted">Receive alerts when an administrator responds to your commission briefs.</span>
              </div>
              <input
                type="checkbox"
                checked={adminMessages}
                onChange={(e) => setAdminMessages(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-background border border-surface-border cursor-pointer hover:border-surface-border-strong transition-colors">
              <div>
                <span className="text-sm font-mono text-foreground block">System & Editorial Bulletins</span>
                <span className="text-xs font-mono text-muted">Important announcements and platform release notes.</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
            </label>
          </div>
        </div>

        {/* Section 3: Password & Security */}
        <div className="p-6 sm:p-8 bg-surface/40 border border-surface-border space-y-6">
          <div className="border-b border-surface-border pb-3">
            <h3 className="text-base font-display font-medium text-foreground flex items-center gap-2">
              <Lock size={16} className="text-accent" />
              <span>Security & Password</span>
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              Leave blank if you do not wish to change your password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Repeat New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Profile Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

