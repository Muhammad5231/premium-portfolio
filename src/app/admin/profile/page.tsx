"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import { IProfile, ISocialLink } from "@/types";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Partial<IProfile>>({
    name: "",
    headline: "",
    subheadline: "",
    bio: "",
    personalStatement: "",
    whatIDo: [],
    howIWork: [],
    whatIValue: [],
    location: "",
    availability: {
      status: "available",
      message: "",
    },
    email: "",
    socialLinks: [],
  });

  const [whatIDoText, setWhatIDoText] = useState("");
  const [howIWorkText, setHowIWorkText] = useState("");
  const [whatIValueText, setWhatIValueText] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setWhatIDoText((data.profile.whatIDo || []).join("\n"));
          setHowIWorkText((data.profile.howIWork || []).join("\n"));
          setWhatIValueText((data.profile.whatIValue || []).join("\n"));
        }
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddSocial = () => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: "New Network", url: "https://" }],
    }));
  };

  const handleUpdateSocial = (index: number, field: keyof ISocialLink, value: string) => {
    setProfile((prev) => {
      const updated = [...(prev.socialLinks || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialLinks: updated };
    });
  };

  const handleRemoveSocial = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const payload = {
      ...profile,
      whatIDo: whatIDoText.split("\n").map((s) => s.trim()).filter(Boolean),
      howIWork: howIWorkText.split("\n").map((s) => s.trim()).filter(Boolean),
      whatIValue: whatIValueText.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setStatusMsg({ type: "success", text: "Profile identity updated across public systems." });
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-muted uppercase tracking-widest flex items-center justify-center gap-2">
        <Loader2 size={14} className="animate-spin" />
        <span>Synchronizing profile schema...</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Identity</span>
            <span>//</span>
            <span>Profile &amp; Hero CMS</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Profile &amp; Narrative Management
          </h1>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>Save Profile</span>
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

      {/* Section 1: Hero & Identity */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          01 // Hero Statement &amp; Introduction
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Full Name / Persona *
            </label>
            <input
              type="text"
              required
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Direct Contact Email *
            </label>
            <input
              type="email"
              required
              value={profile.email || ""}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Primary Hero Headline (Large Display Statement) *
          </label>
          <textarea
            required
            rows={2}
            value={profile.headline || ""}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Supporting Subheadline / Description *
          </label>
          <textarea
            rows={3}
            value={profile.subheadline || ""}
            onChange={(e) => setProfile({ ...profile, subheadline: e.target.value })}
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Physical Location / Timezone
            </label>
            <input
              type="text"
              value={profile.location || ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="San Francisco / Remote Worldwide"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Availability Status
            </label>
            <select
              value={profile.availability?.status || "available"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  availability: {
                    status: e.target.value as any,
                    message: profile.availability?.message || "",
                  },
                })
              }
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              <option value="available">Available (Accepting commissions)</option>
              <option value="limited">Limited Capacity</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Availability Status Message (Shown in Navbar &amp; Hero Badge)
          </label>
          <input
            type="text"
            value={profile.availability?.message || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                availability: {
                  status: profile.availability?.status || "available",
                  message: e.target.value,
                },
              })
            }
            placeholder="e.g. Available for select architectural commissions & advisory"
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Section 2: Personal Statement & Narrative Bio */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          02 // Philosophy &amp; Editorial Bio
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Large Editorial Quote Statement
          </label>
          <textarea
            rows={3}
            value={profile.personalStatement || ""}
            onChange={(e) => setProfile({ ...profile, personalStatement: e.target.value })}
            placeholder="A defining personal manifesto statement..."
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Extended Biography
          </label>
          <textarea
            rows={4}
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Detailed background narrative..."
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              What I Do (1 per line)
            </label>
            <textarea
              rows={4}
              value={whatIDoText}
              onChange={(e) => setWhatIDoText(e.target.value)}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              How I Work (1 per line)
            </label>
            <textarea
              rows={4}
              value={howIWorkText}
              onChange={(e) => setHowIWorkText(e.target.value)}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              What I Value (1 per line)
            </label>
            <textarea
              rows={4}
              value={whatIValueText}
              onChange={(e) => setWhatIValueText(e.target.value)}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Social Links */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="text-xs font-mono uppercase tracking-widest text-accent">
            03 // Digital Channels &amp; Networks
          </div>
          <button
            type="button"
            onClick={handleAddSocial}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-accent hover:underline"
          >
            <Plus size={13} />
            <span>Add Channel</span>
          </button>
        </div>

        <div className="space-y-4">
          {(profile.socialLinks || []).map((link, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-background p-3 border border-surface-border">
              <input
                type="text"
                value={link.platform}
                onChange={(e) => handleUpdateSocial(idx, "platform", e.target.value)}
                placeholder="Platform (e.g. GitHub)"
                className="w-1/3 bg-surface border border-surface-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent font-mono"
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleUpdateSocial(idx, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-surface border border-surface-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent font-mono"
              />
              <button
                type="button"
                onClick={() => handleRemoveSocial(idx)}
                className="p-1.5 text-muted hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

