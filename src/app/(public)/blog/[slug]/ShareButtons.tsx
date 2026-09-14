"use client";

import { useState } from "react";
import { Share2, Copy, Check, Twitter, Linkedin } from "lucide-react";

export default function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : `https://mohammad.studio/blog/${slug}`;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  const shareLinkedIn = () => {
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(liUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-widest text-muted block">
        Disseminate // Share
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={shareTwitter}
          className="p-2 bg-surface hover:bg-surface-border text-muted hover:text-foreground border border-surface-border transition-colors"
          title="Share on X (Twitter)"
        >
          <Twitter size={13} />
        </button>

        <button
          onClick={shareLinkedIn}
          className="p-2 bg-surface hover:bg-surface-border text-muted hover:text-foreground border border-surface-border transition-colors"
          title="Share on LinkedIn"
        >
          <Linkedin size={13} />
        </button>

        <button
          onClick={copyToClipboard}
          className="p-2 bg-surface hover:bg-surface-border text-muted hover:text-foreground border border-surface-border transition-colors flex items-center gap-1.5"
          title="Copy Link"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span className="text-[10px] font-mono">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}

