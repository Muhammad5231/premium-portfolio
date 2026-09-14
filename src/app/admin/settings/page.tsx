"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ISiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Partial<ISiteSettings>>({
    siteName: "",
    logoText: "",
    contactEmail: "",
    seoTitle: "",
    seoDescription: "",
    keywords: [],
    footerStatement: "",
    copyrightText: "",
    maintenanceMode: false,
    analyticsId: "",
  });

  const [keywordsText, setKeywordsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings(data.settings);
          setKeywordsText((data.settings.keywords || []).join(", "));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const payload = {
      ...settings,
      keywords: keywordsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");

      setStatusMsg({ type: "success", text: "Global site & SEO settings committed." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-muted uppercase tracking-widest flex items-center justify-center gap-2">
        <Loader2 size={14} className="animate-spin" />
        <span>Loading system parameters...</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Configuration</span>
            <span>//</span>
            <span>Global Brand &amp; SEO Engine</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Site &amp; SEO Settings
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save Settings</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 text-xs font-mono p-4 border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
              : "bg-red-950/40 text-red-400 border-red-800/50"
          }`}
        >
          {statusMsg.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Brand Identity Configuration */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          01 // Brand Identity &amp; System Metadata
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Site Title / Brand Name *
            </label>
            <input
              type="text"
              required
              value={settings.siteName || ""}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Logo Display Text (Header)
            </label>
            <input
              type="text"
              value={settings.logoText || ""}
              onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent font-mono uppercase tracking-widest"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Inquiry Forwarding Email *
            </label>
            <input
              type="email"
              required
              value={settings.contactEmail || ""}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Analytics ID (Optional)
            </label>
            <input
              type="text"
              value={settings.analyticsId || ""}
              onChange={(e) => setSettings({ ...settings, analyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-foreground focus:outline-none focus:border-accent font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Footer Statement (Shown in public site footer)
          </label>
          <textarea
            rows={2}
            value={settings.footerStatement || ""}
            onChange={(e) => setSettings({ ...settings, footerStatement: e.target.value })}
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Copyright Notice
          </label>
          <input
            type="text"
            value={settings.copyrightText || ""}
            onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Global SEO Engine */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          02 // Search Engine Optimization (SEO &amp; Open Graph)
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Global Meta Title *
          </label>
          <input
            type="text"
            required
            value={settings.seoTitle || ""}
            onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
            placeholder="Mohammad — Design Engineer & Full-Stack Architect"
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Global Meta Description *
          </label>
          <textarea
            required
            rows={3}
            value={settings.seoDescription || ""}
            onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
            placeholder="Bespoke digital experiences, creative engineering, and high-craft software systems."
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Keywords (Comma-separated)
          </label>
          <input
            type="text"
            value={keywordsText}
            onChange={(e) => setKeywordsText(e.target.value)}
            placeholder="Design Engineer, Architecture, Next.js, Creative Technologist"
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>
    </div>
  );
}

