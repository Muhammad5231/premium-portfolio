"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Copy,
  Trash2,
  Check,
  Search,
  Loader2,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { IMedia } from "@/types";

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<IMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [previewMedia, setPreviewMedia] = useState<IMedia | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const url = new URL("/api/admin/media", window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.media) setMediaList(data.media);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search]);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      await fetchMedia();
    } catch (err: any) {
      alert(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Permanently delete this media artifact?")) return;
    try {
      await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      if (previewMedia && previewMedia._id === id) setPreviewMedia(null);
      await fetchMedia();
    } catch (err) {
      console.error(err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Assets</span>
            <span>//</span>
            <span>Media Archive</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Media Library &amp; Asset Vault
          </h1>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          <span>{uploading ? "Ingesting Media..." : "Upload Asset"}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-surface-border hover:border-accent/60 bg-surface/30 hover:bg-surface/50 p-8 sm:p-12 text-center cursor-pointer transition-all duration-200"
      >
        <UploadCloud size={32} className="mx-auto text-muted mb-3" />
        <h3 className="text-sm font-display font-medium text-foreground">
          Drop files to ingest into media library
        </h3>
        <p className="text-xs font-mono text-muted mt-1">
          Supports PNG, JPEG, WebP, SVG, GIF, PDF (Max 15MB)
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-surface/50 border border-surface-border p-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by filename, type..."
            className="w-full bg-background border border-surface-border pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent font-sans"
          />
        </div>

        <span className="text-xs font-mono text-muted uppercase tracking-widest">
          {mediaList.length} Media Objects
        </span>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs font-mono text-muted uppercase">
            Loading media catalog...
          </div>
        ) : mediaList.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-muted uppercase">
            No assets ingested yet. Drag files above to upload.
          </div>
        ) : (
          mediaList.map((media) => {
            const isImage = media.mimeType.startsWith("image/");
            return (
              <div
                key={media._id}
                className="bg-surface border border-surface-border group overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Preview */}
                <div
                  onClick={() => setPreviewMedia(media)}
                  className="relative aspect-square w-full bg-background/50 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {isImage ? (
                    <Image
                      src={media.url}
                      alt={media.originalName}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FileText size={32} className="text-muted" />
                  )}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye size={18} className="text-foreground" />
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-3 bg-surface border-t border-surface-border space-y-1">
                  <div className="text-xs font-display font-medium text-foreground truncate" title={media.originalName}>
                    {media.originalName}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                    <span>{formatBytes(media.size)}</span>
                    <span className="truncate max-w-[80px]">{media.mimeType.split("/")[1]}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-surface-border/50">
                    <button
                      onClick={() => handleCopyUrl(media.url, media._id!)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-muted hover:text-accent uppercase transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === media._id ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(media._id)}
                      className="text-muted hover:text-red-400 p-1 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-surface-border max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <span className="text-xs font-mono uppercase text-accent truncate max-w-md">
                {previewMedia.originalName}
              </span>
              <button
                onClick={() => setPreviewMedia(null)}
                className="text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full bg-background flex items-center justify-center overflow-hidden border border-surface-border">
              {previewMedia.mimeType.startsWith("image/") ? (
                <Image
                  src={previewMedia.url}
                  alt={previewMedia.originalName}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="text-center font-mono text-xs text-muted">
                  <FileText size={48} className="mx-auto mb-2" />
                  <span>Document Preview: {previewMedia.mimeType}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs font-mono text-muted">
              <div>
                URL: <code className="text-foreground">{previewMedia.url}</code>
              </div>
              <button
                onClick={() => handleCopyUrl(previewMedia.url, previewMedia._id!)}
                className="bg-foreground text-background hover:bg-accent px-4 py-1.5 uppercase tracking-wider text-xs font-mono transition-colors"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

