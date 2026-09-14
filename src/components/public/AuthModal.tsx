"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { authModalOpen, authModalMessage, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Authentication failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      setError("Passwords do not match");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      confirmPassword: regConfirm,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.error || "Registration failed");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-background/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-surface border border-surface-border shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
                Access Verification
              </span>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1.5 text-muted hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Context Banner */}
          {authModalMessage && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
              {authModalMessage}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-surface-subtle p-1 border border-surface-border my-6">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                tab === "login"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError("");
              }}
              className={`py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                tab === "register"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-muted" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-background border border-surface-border pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-3.5 text-muted" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-surface-border pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1.5">
                  Full Name / Display Identity
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3.5 text-muted" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full bg-background border border-surface-border pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3.5 text-muted" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="maya@domain.com"
                    className="w-full bg-background border border-surface-border pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-surface-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1.5">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-surface-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <p className="text-[10px] font-mono text-muted/60 text-center mt-6">
            Protected by end-to-end cryptographic hashing. Your email is never shared.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

