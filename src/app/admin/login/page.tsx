"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden bg-grain">
      {/* Background architectural glow */}
      <div className="w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none absolute -top-20 -left-20" />

      <div className="w-full max-w-md">
        {/* Terminal Header */}
        <div className="border border-surface-border bg-surface/80 p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center justify-between pb-6 border-b border-surface-border mb-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
                Control Console // CMS
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase text-muted tracking-widest">
              v1.0.0
            </span>
          </div>

          <h1 className="text-2xl font-display font-medium text-foreground tracking-tight">
            Administrator Access
          </h1>
          <p className="mt-2 text-xs font-mono text-muted">
            Enter authorized security credentials to access the editorial CMS.
          </p>

          {error && (
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/40 border border-red-800/60 p-3">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Identity / Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3.5 text-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@portfolio.local"
                  className="w-full bg-background border border-surface-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent font-sans transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Security Key / Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-3.5 text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-background border border-surface-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent font-sans transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 bg-foreground text-background py-3 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-border text-center">
            <span className="text-[11px] font-mono text-muted/60">
              Default Seed: <code className="text-muted">admin@portfolio.local / admin123</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

