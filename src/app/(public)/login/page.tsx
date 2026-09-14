"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    router.push(from);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      router.push(from);
    } else {
      setError(res.error || "Authentication failed.");
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-[85vh] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md bg-surface border border-surface-border p-6 sm:p-10 relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Portfolio</span>
        </Link>

        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-accent">
            <span className="w-1.5 h-1.5 bg-accent" />
            <span>Community Portal // Gate 01</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-light uppercase tracking-tight text-foreground">
            Sign In
          </h1>
          <p className="text-xs font-mono text-muted leading-relaxed">
            Authenticate to contribute to discussions, manage private commission briefs, and access notifications.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 p-3.5 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-3.5 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-background border border-surface-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-3.5 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-surface-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 mt-8"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Terminal</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-border text-center">
          <p className="text-xs font-mono text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup?from=${encodeURIComponent(from)}`}
              className="text-foreground hover:text-accent font-semibold transition-colors underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

