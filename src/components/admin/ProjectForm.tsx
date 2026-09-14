"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { IProject } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface ProjectFormProps {
  initialData?: IProject | null;
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<IProject>>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    shortDescription: initialData?.shortDescription || "",
    description: initialData?.description || "",
    category: initialData?.category || "Digital Identity & Design Engineering",
    tags: initialData?.tags || ["Next.js", "TypeScript", "Tailwind CSS"],
    year: initialData?.year || new Date().getFullYear(),
    client: initialData?.client || "",
    role: initialData?.role || "Lead Design Technologist & Architect",
    featured: initialData?.featured || false,
    status: initialData?.status || "published",
    thumbnail: initialData?.thumbnail || "",
    heroMedia: initialData?.heroMedia || "",
    gallery: initialData?.gallery || [],
    videoUrl: initialData?.videoUrl || "",
    liveUrl: initialData?.liveUrl || "",
    githubUrl: initialData?.githubUrl || "",
    challenge: initialData?.challenge || "",
    approach: initialData?.approach || "",
    solution: initialData?.solution || "",
    results: initialData?.results || "",
    technologies: initialData?.technologies || ["TypeScript", "Next.js", "MongoDB"],
    order: initialData?.order || 0,
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
  });

  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "Next.js, TypeScript, Tailwind CSS");
  const [techInput, setTechInput] = useState(initialData?.technologies?.join(", ") || "TypeScript, Next.js, MongoDB");
  const [galleryInput, setGalleryInput] = useState(initialData?.gallery?.join("\n") || "");

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<"thumbnail" | "heroMedia" | "gallery" | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, title: val };
      if (!isEdit && (!prev.slug || prev.slug === "")) {
        updated.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const payload = {
      ...formData,
      tags: tagsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      technologies: techInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      gallery: galleryInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const url = isEdit
        ? `/api/admin/projects/${initialData?._id}`
        : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save project");
      }

      setStatusMsg({
        type: "success",
        text: isEdit ? "Project archive updated successfully" : "New project archived successfully",
      });

      if (!isEdit) {
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?._id) return;
    if (!confirm("Are you certain you wish to permanently delete this project archive?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/projects/${initialData._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-5xl mx-auto pb-24">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border sticky top-0 bg-background/90 backdrop-blur-md z-20 pt-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="p-2 border border-surface-border text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-display font-medium text-foreground">
              {isEdit ? `Edit: ${initialData?.title}` : "Create New Project Archive"}
            </h1>
            <span className="text-[11px] font-mono text-muted uppercase tracking-widest">
              {isEdit ? "Modifying existing document" : "Drafting new showcase record"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 border border-red-900/50 text-red-400 hover:bg-red-950/40 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-accent px-6 py-2 text-xs font-mono uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{isEdit ? "Commit Changes" : "Publish Archive"}</span>
          </button>
        </div>
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

      {/* Section 1: Identification & Metadata */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          01 // Project Core Metadata
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. VORTEX ARCHIVE"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. vortex-archive"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-foreground focus:outline-none focus:border-accent font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Systems & Interface Architecture"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Role *
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Lead Architect & Design Technologist"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Client / Organization
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="e.g. Chronos Atelier"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Year
            </label>
            <input
              type="text"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2024"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Short Description (Editorial summary on index cards) *
          </label>
          <textarea
            required
            rows={2}
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="A concise, high-impact description of the project..."
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Index Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Next.js, WebGL, TypeScript"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Technologies (Comma-separated)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="Next.js, MongoDB, Tailwind CSS, Framer Motion"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Case Study Narrative */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          02 // Case Study Narrative &amp; Architectural Pillars
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
            Deep Overview / Scope Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed background and scope of the project..."
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              01 // The Challenge / Problem
            </label>
            <textarea
              rows={4}
              value={formData.challenge}
              onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
              placeholder="What core architectural impasse or design friction existed?"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              02 // The Approach
            </label>
            <textarea
              rows={4}
              value={formData.approach}
              onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
              placeholder="What technical methodology and design rationale was applied?"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              03 // The Solution
            </label>
            <textarea
              rows={4}
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              placeholder="How was the final architecture executed and deployed?"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              04 // Validated Results &amp; Impact
            </label>
            <textarea
              rows={4}
              value={formData.results}
              onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              placeholder="Measurable metrics, latency reductions, citations, or user metrics..."
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Media & Artifacts */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          03 // Visual Assets &amp; Media Links
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted">
                Thumbnail Image URL *
              </label>
              <button
                type="button"
                onClick={() => setPickerTarget("thumbnail")}
                className="text-[10px] font-mono uppercase text-accent hover:underline flex items-center gap-1"
              >
                <ImageIcon size={11} />
                <span>Browse Vault</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="/uploads/... or https://..."
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted">
                Hero Media / Banner URL
              </label>
              <button
                type="button"
                onClick={() => setPickerTarget("heroMedia")}
                className="text-[10px] font-mono uppercase text-accent hover:underline flex items-center gap-1"
              >
                <ImageIcon size={11} />
                <span>Browse Vault</span>
              </button>
            </div>
            <input
              type="text"
              value={formData.heroMedia}
              onChange={(e) => setFormData({ ...formData, heroMedia: e.target.value })}
              placeholder="/uploads/... or https://..."
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Live Website URL
            </label>
            <input
              type="url"
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              GitHub / Source URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Motion Capture / Video Reel URL (Optional)
            </label>
            <input
              type="url"
              value={formData.videoUrl || ""}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://... (MP4 video, YouTube, or Vimeo stream)"
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-muted">
              Gallery Plates (One URL per line)
            </label>
            <button
              type="button"
              onClick={() => setPickerTarget("gallery")}
              className="text-[10px] font-mono uppercase text-accent hover:underline flex items-center gap-1"
            >
              <ImageIcon size={11} />
              <span>Append from Vault</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={galleryInput}
            onChange={(e) => setGalleryInput(e.target.value)}
            placeholder="https://...&#10;https://..."
            className="w-full bg-background border border-surface-border px-4 py-2.5 text-foreground focus:outline-none focus:border-accent font-mono text-xs"
          />
        </div>
      </div>

      {/* Section 4: Publishing & Status */}
      <div className="bg-surface/50 border border-surface-border p-6 sm:p-8 space-y-6">
        <div className="text-xs font-mono uppercase tracking-widest text-accent border-b border-surface-border pb-3">
          04 // Publishing State &amp; Ordering
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Publication Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              <option value="published">Published (Visible Publicly)</option>
              <option value="draft">Draft (Restricted to Admin)</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Display Sequence / Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full bg-background border border-surface-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 accent-accent bg-background"
              />
              <span className="text-xs font-mono uppercase tracking-widest text-foreground">
                Highlight as Featured
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Media Vault Picker Modal */}
      <MediaPickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        title={
          pickerTarget === "thumbnail"
            ? "Choose Thumbnail Plate from Vault"
            : pickerTarget === "heroMedia"
            ? "Choose Hero Banner Media from Vault"
            : "Append Asset to Project Gallery"
        }
        onSelect={(url) => {
          if (pickerTarget === "thumbnail") {
            setFormData((prev) => ({ ...prev, thumbnail: url }));
          } else if (pickerTarget === "heroMedia") {
            setFormData((prev) => ({ ...prev, heroMedia: url }));
          } else if (pickerTarget === "gallery") {
            setGalleryInput((prev) => (prev ? `${prev}\n${url}` : url));
          }
          setPickerTarget(null);
        }}
      />
    </form>
  );
}

