"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  Globe,
  Sparkles,
  Layers,
  Tag,
  Eye,
  FileCode,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  List,
  Code,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface BlogEditorFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BlogEditorForm({ initialData, isEditing = false }: BlogEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [category, setCategory] = useState(initialData?.category || "Architecture");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");
  const [ogImage, setOgImage] = useState(initialData?.ogImage || "");

  const [categories, setCategories] = useState<any[]>([]);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "editor" | null>(null);
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.items || []))
      .catch(() => {});
  }, []);

  // Calculate live reading time
  const wordCount = (content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const liveReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const insertFormatting = (tagStart: string, tagEnd: string = "") => {
    const textarea = document.getElementById("blog-content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = `${tagStart}${selectedText}${tagEnd}`;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, end + tagStart.length);
    }, 10);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget === "cover") {
      setCoverImage(url);
    } else if (mediaPickerTarget === "editor") {
      const imgTag = `<img src="${url}" alt="Article specimen" class="w-full my-6 border border-surface-border" />\n`;
      setContent((prev: string) => prev + "\n" + imgTag);
    }
    setMediaPickerTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
      featured,
      readingTime: liveReadingTime,
      seoTitle,
      seoDescription,
      ogImage,
    };

    try {
      const endpoint = isEditing ? `/api/admin/blog/${initialData._id}` : "/api/admin/blog";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save monograph.");
      }

      setSuccess("Monograph persisted successfully.");
      setTimeout(() => {
        router.push("/admin/blog");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto p-6 sm:p-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="p-2 border border-surface-border text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent block">
              {isEditing ? `EDITORIAL // REVISE MONOGRAPH` : `EDITORIAL // NEW MONOGRAPH`}
            </span>
            <h1 className="text-2xl font-display font-light text-foreground uppercase">
              {title || "Untitled Monograph"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="px-4 py-2 border border-surface-border text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{isEditing ? "Update Monograph" : "Publish / Save"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/50 text-xs font-mono text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Left Editor + Right Metadata Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Title, Excerpt, Content Editor */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-4 bg-surface/40 border border-surface-border p-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Monograph Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Radical Typographic Discipline in Modernist Web Architectures"
                className="w-full bg-background border border-surface-border px-4 py-3 text-base text-foreground font-display font-medium focus:outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Slug (URL Path)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="radical-typographic-discipline"
                  className="w-full bg-background border border-surface-border px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Category / Discipline *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-surface-border px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="Architecture">Architecture</option>
                      <option value="Spatial Systems">Spatial Systems</option>
                      <option value="Typography">Typography</option>
                      <option value="Distributed Engineering">Distributed Engineering</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Lead Abstract / Excerpt *
              </label>
              <textarea
                rows={3}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A high-density 1-2 sentence synopsis explaining the thesis..."
                className="w-full bg-background border border-surface-border p-3 text-sm text-foreground focus:outline-none focus:border-accent resize-none font-light leading-relaxed"
              />
            </div>
          </div>

          {/* Writing Editor & Formatting Bar */}
          <div className="bg-surface/40 border border-surface-border overflow-hidden">
            {/* Toolbar Header */}
            <div className="p-3 bg-surface/80 border-b border-surface-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting("<h2>", "</h2>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<h3>", "</h3>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Heading 3"
                >
                  <Heading3 size={15} />
                </button>
                <div className="w-[1px] h-4 bg-surface-border mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting("<strong>", "</strong>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<em>", "</em>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<blockquote><p>", "</p></blockquote>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Blockquote"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("<pre><code>\n", "\n</code></pre>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Code Block"
                >
                  <Code size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<a href="https://..." target="_blank">', "</a>")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-foreground"
                  title="Link"
                >
                  <Link2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget("editor")}
                  className="p-1.5 hover:bg-surface border border-transparent hover:border-surface-border text-muted hover:text-accent flex items-center gap-1"
                  title="Insert Media"
                >
                  <ImageIcon size={15} />
                  <span className="text-[10px]">Insert Image</span>
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 bg-surface p-0.5 border border-surface-border">
                <button
                  type="button"
                  onClick={() => setPreviewTab("write")}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase ${
                    previewTab === "write"
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("preview")}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase ${
                    previewTab === "preview"
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Content Textarea or Preview */}
            {previewTab === "write" ? (
              <textarea
                id="blog-content-textarea"
                rows={22}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compose your structured technical monograph using HTML or markdown paragraphs..."
                className="w-full bg-background p-6 text-sm text-foreground font-mono focus:outline-none leading-relaxed resize-y border-none"
              />
            ) : (
              <div
                className="p-8 bg-background/80 min-h-[450px] prose prose-invert max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content || "<p class='text-muted'>Nothing to preview yet.</p>" }}
              />
            )}

            {/* Editor Footer Telemetry */}
            <div className="p-3 bg-surface/60 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-muted">
              <span>{wordCount} Words</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>Estimated reading time: ~{liveReadingTime} minutes</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Publishing Controls, Cover Image & SEO */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Status Card */}
          <div className="p-6 bg-surface/40 border border-surface-border space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block border-b border-surface-border pb-2">
              Publication Settings
            </span>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                Release Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-background border border-surface-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 bg-background border border-surface-border cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <div className="text-xs font-mono">
                <span className="text-foreground block font-semibold">Featured Monograph</span>
                <span className="text-muted text-[10px]">Showcase hero banner on /blog</span>
              </div>
            </label>
          </div>

          {/* Cover Media Card */}
          <div className="p-6 bg-surface/40 border border-surface-border space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-muted">
                Cover Visual Plate
              </span>
              <button
                type="button"
                onClick={() => setMediaPickerTarget("cover")}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1"
              >
                <ImageIcon size={11} />
                <span>Select Media</span>
              </button>
            </div>

            {coverImage ? (
              <div className="relative aspect-[16/9] bg-surface border border-surface-border overflow-hidden">
                <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 bg-background/80 text-muted hover:text-red-400 p-1 text-[10px] font-mono uppercase"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                onClick={() => setMediaPickerTarget("cover")}
                className="border border-dashed border-surface-border p-6 text-center cursor-pointer hover:border-accent transition-colors"
              >
                <ImageIcon size={20} className="mx-auto text-muted mb-2" />
                <span className="text-xs font-mono text-muted block">Attach Cover Asset</span>
              </div>
            )}

            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or enter direct image URL..."
              className="w-full bg-background border border-surface-border px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {/* Tags Manager Card */}
          <div className="p-6 bg-surface/40 border border-surface-border space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block border-b border-surface-border pb-2">
              Topic Tags
            </span>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 bg-background border border-surface-border px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-1.5 bg-foreground text-background font-mono text-xs uppercase hover:bg-accent transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface border border-surface-border text-xs font-mono text-foreground"
                >
                  <span>#{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="text-muted hover:text-red-400 text-xs"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* SEO Metadata Card */}
          <div className="p-6 bg-surface/40 border border-surface-border space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block border-b border-surface-border pb-2">
              Search &amp; Social Meta (SEO)
            </span>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Overrides default title"
                className="w-full bg-background border border-surface-border px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1">
                SEO Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Search engine summary"
                className="w-full bg-background border border-surface-border p-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-muted mb-1">
                OG Social Image URL
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-background border border-surface-border px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {mediaPickerTarget && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={handleMediaSelect}
        />
      )}
    </form>
  );
}
