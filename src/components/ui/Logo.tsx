"use client";

import Link from "next/link";

interface LogoProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
}

export default function Logo({
  text = "MOHAMMAD",
  size = "md",
  showSubtitle = true,
  subtitle = "DESIGN & ARCHITECTURE",
  href = "/",
  className = "",
}: LogoProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const markSize = isSm ? 22 : isLg ? 36 : 28;

  const content = (
    <div className={`group inline-flex items-center gap-3 select-none ${className}`}>
      {/* Precision Geometric Monogram Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={markSize}
          height={markSize}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90"
        >
          {/* Outer hairline border */}
          <rect
            x="1.5"
            y="1.5"
            width="37"
            height="37"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/30 group-hover:text-accent transition-colors duration-300"
          />

          {/* Diagonal intersecting geometry */}
          <line
            x1="2"
            y1="2"
            x2="38"
            y2="38"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/20 group-hover:text-foreground/40 transition-colors"
          />

          {/* Inner rotated diamond */}
          <rect
            x="20"
            y="7"
            width="18.38"
            height="18.38"
            transform="rotate(45 20 7)"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/70 group-hover:text-accent transition-colors duration-300"
          />

          {/* Center focal amber beacon */}
          <rect
            x="17"
            y="17"
            width="6"
            height="6"
            className="fill-accent transition-transform duration-300 group-hover:scale-125"
          />

          {/* Corner optical accents */}
          <circle cx="2" cy="2" r="1.5" className="fill-accent" />
          <circle cx="38" cy="38" r="1.5" className="fill-accent" />
        </svg>
      </div>

      {/* Typographic Wordmark & Editorial Subtitle */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-display font-medium tracking-editorial uppercase text-foreground group-hover:text-accent transition-colors duration-300 truncate ${
              isSm ? "text-xs" : isLg ? "text-base sm:text-2xl" : "text-sm sm:text-base"
            }`}
          >
            {text}
          </span>
          <span className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />
        </div>

        {showSubtitle && (
          <span
            className={`font-mono uppercase tracking-widest text-muted/70 block transition-colors group-hover:text-muted truncate ${
              isSm ? "text-[8px]" : isLg ? "text-[9px] sm:text-[11px]" : "text-[8px] sm:text-[9px]"
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus-visible:ring-1 focus-visible:ring-accent">
        {content}
      </Link>
    );
  }

  return content;
}

