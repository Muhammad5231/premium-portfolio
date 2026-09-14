"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Search, UploadCloud, Check, Loader2, FileText } from "lucide-react";
import { IMedia } from "@/types";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Asset from Media Vault",
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<IMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
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
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search]);

  const handleUpload = async (file: File) => {
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
      if (data.media?.url) {
        onSelect(data.media.url);
        onClose();
      }
    } catch (err: any) {
      alert(err.message || "Failed to upload asset");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-surface-border max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent" />
            <h3 className="text-sm font-display font-medium text-foreground uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search + Quick Upload */}
        <div className="p-4 border-b border-surface-border bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-background border border-surface-border pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-foreground text-background px-3.5 py-1.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <UploadCloud size={13} />
              )}
              <span>{uploading ? "Ingesting..." : "Upload New"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUpload(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full py-16 text-center text-xs font-mono text-muted uppercase">
              Loading media vault...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs font-mono text-muted uppercase">
              No media found. Upload an image above.
            </div>
          ) : (
            mediaList.map((media) => {
              const isImage = media.mimeType.startsWith("image/");
              return (
                <div
                  key={media._id}
                  onClick={() => {
                    onSelect(media.url);
                    onClose();
                  }}
                  className="bg-background border border-surface-border hover:border-accent group cursor-pointer overflow-hidden flex flex-col transition-colors"
                >
                  <div className="relative aspect-square w-full bg-surface-subtle flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <Image
                        src={media.url}
                        alt={media.originalName}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <FileText size={24} className="text-muted" />
                    )}
                    <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="bg-background text-foreground text-[10px] font-mono px-2 py-0.5 border border-surface-border uppercase tracking-widest">
                        Choose
                      </span>
                    </div>
                  </div>

                  <div className="p-2 text-[11px] font-mono text-muted truncate border-t border-surface-border">
                    <span className="text-foreground font-sans truncate block">
                      {media.originalName}
                    </span>
                    <span className="text-[9px] text-muted/60 truncate block">
                      {media.mimeType.split("/")[1]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

