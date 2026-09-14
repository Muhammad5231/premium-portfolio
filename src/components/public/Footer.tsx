"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Copy, Check, Compass, Clock, Radio } from "lucide-react";
import { INavigationItem } from "@/types";
import Logo from "@/components/ui/Logo";

interface FooterProps {
  siteName?: string;
  statement?: string;
  copyright?: string;
  navItems?: INavigationItem[];
  email?: string;
  location?: string;
}

export default function Footer({
  siteName = "MOHAMMAD",
  statement = "Crafting enduring digital identities, scalable architectures, and memorable interactive software at the intersection of aesthetic discipline and distributed engineering.",
  copyright = "Designed & Engineered with uncompromising craft.",
  navItems = [],
  email = "hello@mohammad.studio",
  location = "San Francisco & Global Remote",
}: FooterProps) {
  const [copied, setCopied] = useState(false);
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const defaultNav = [
    { label: "Work Archive", url: "/#work" },
    { label: "Identity & Ethos", url: "/#about" },
    { label: "Capabilities Matrix", url: "/#capabilities" },
    { label: "Career & Tenure", url: "/#experience" },
    { label: "Visual Gallery", url: "/gallery" },
    { label: "Initiate Dialogue", url: "/#contact" },
  ];

  const displayNav = navItems.length > 0 ? navItems : defaultNav;

  const featuredWorks = [
    { title: "Vortex Archive", slug: "vortex-archive", tag: "Design Engineering" },
    { title: "Kairos Chronometry", slug: "kairos-chronometry", tag: "Interface Telemetry" },
    { title: "Aura Compute Engine", slug: "aura-compute-engine", tag: "Distributed Systems" },
    { title: "Monolith OS", slug: "monolith-os", tag: "Experimental Spatial UI" },
  ];

  const socialChannels = [
    { name: "GitHub", url: "https://github.com", handle: "github.com" },
    { name: "ReadCV", url: "https://read.cv", handle: "read.cv" },
    { name: "X / Twitter", url: "https://twitter.com", handle: "x.com" },
    { name: "LinkedIn", url: "https://linkedin.com", handle: "linkedin.com" },
  ];

  return (
    <footer className="relative bg-background border-t border-surface-border overflow-hidden bg-grain pt-16 sm:pt-28 pb-10 px-4 sm:px-8 lg:px-12">
      {/* Ghosted Architectural Watermark Background */}
      <div className="absolute -bottom-4 sm:-bottom-10 left-0 right-0 pointer-events-none select-none opacity-[0.025] flex justify-center overflow-hidden">
        <span className="text-[14vw] font-display font-black tracking-tighter uppercase whitespace-nowrap text-foreground leading-none">
          {siteName}
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Tier: Brand Statement & Primary Dispatch Action */}
        <div className="pb-12 sm:pb-20 border-b border-surface-border grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start lg:items-end">
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <Logo text={siteName} size="lg" showSubtitle={true} subtitle="INDEPENDENT ATELIER // ARCHITECTURAL SYSTEMS" />
            <p className="text-sm sm:text-lg text-muted-stone max-w-xl font-sans leading-relaxed">
              {statement}
            </p>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start sm:items-end justify-between space-y-3 sm:space-y-4 w-full">
            <div className="text-xs font-mono uppercase tracking-widest text-muted">
              Direct Communication Channel
            </div>
            <div className="flex items-center gap-3 max-w-full">
              <a
                href={`mailto:${email}`}
                className="text-base sm:text-2xl font-display font-medium text-foreground hover:text-accent transition-colors underline underline-offset-4 decoration-surface-border hover:decoration-accent break-all"
              >
                {email}
              </a>
              <button
                onClick={handleCopyEmail}
                className="p-2 border border-surface-border bg-surface/80 hover:bg-surface text-muted hover:text-foreground transition-colors shrink-0"
                title="Copy email to clipboard"
                aria-label="Copy email address"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            {copied && (
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider animate-fade-in">
                Address copied to clipboard
              </span>
            )}
          </div>
        </div>

        {/* Middle Tier: 4-Column Editorial Directory */}
        <div className="py-12 sm:py-20 border-b border-surface-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Col 1: Studio Coordinates & Live Operational Telemetry (3 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent block">
              // 01 Studio Coordinates
            </span>
            <div className="space-y-3 text-xs font-mono text-muted">
              <div className="flex items-center gap-2">
                <Compass size={13} className="text-muted-foreground" />
                <span className="text-foreground/80">{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-muted-foreground" />
                <span>{utcTime || "UTC CHRONOMETER"}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Radio size={13} className="text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 uppercase tracking-wide text-[11px]">
                  Online // Accepting Select Commissions
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Index Sitemap (2.5 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent block">
              // 02 Navigation Index
            </span>
            <ul className="space-y-2.5 text-xs font-mono uppercase tracking-wider text-muted">
              {displayNav.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.url}
                    className="hover:text-foreground hover:translate-x-1 inline-block transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Curated Artifacts & Featured Case Studies (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent block">
              // 03 Featured Works
            </span>
            <ul className="space-y-3 text-xs font-sans text-muted">
              {featuredWorks.map((work, idx) => (
                <li key={idx}>
                  <Link
                    href={`/projects/${work.slug}`}
                    className="group block text-muted hover:text-foreground transition-colors"
                  >
                    <div className="font-display font-medium text-foreground/90 group-hover:text-accent flex items-center justify-between">
                      <span>{work.title}</span>
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] font-mono text-muted/60">{work.tag}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Digital Frequencies & Social Networks (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-accent block">
              // 04 Channels
            </span>
            <ul className="space-y-2.5 text-xs font-mono text-muted">
              {socialChannels.map((ch, idx) => (
                <li key={idx}>
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors group"
                  >
                    <span className="text-[10px] text-muted/50">0{idx + 1}</span>
                    <span>{ch.name}</span>
                    <ArrowUpRight size={10} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-8 sm:pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs font-mono text-muted/60">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-left">
            <span>&copy; {new Date().getFullYear()} {siteName}.</span>
            <span className="hidden md:inline">&bull;</span>
            <span>{copyright}</span>
            <span className="hidden md:inline">&bull;</span>
            <span className="text-muted/40">Next.js 14 &bull; TypeScript &bull; MongoDB</span>
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-6 pt-2 md:pt-0 border-t border-surface-border/40 md:border-none">
            <Link
              href="/admin"
              className="text-[11px] text-muted/50 hover:text-accent transition-colors uppercase tracking-widest"
            >
              Control Terminal
            </Link>

            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-foreground hover:text-accent transition-colors"
            >
              <span>Return to Zenith</span>
              <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
