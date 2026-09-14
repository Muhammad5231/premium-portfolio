"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, ArrowUpRight, Compass } from "lucide-react";
import Link from "next/link";
import { IProfile } from "@/types";

interface HeroSectionProps {
  profile: IProfile | null;
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<string>("");

  // Smooth mouse tracking for subtle kinetic depth
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Live clock in UTC/editorial format
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZoneName: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 16);
    mouseY.set(y * 16);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const headline =
    profile?.headline || "Translating complex structural systems into quiet, indelible digital experiences.";
  const subheadline =
    profile?.subheadline ||
    "Multidisciplinary Design Engineer & Full-Stack Architect specializing in high-performance digital products, creative engineering, and bespoke identities.";

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[88vh] sm:min-h-[92vh] flex flex-col justify-between pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-12 border-b border-surface-border overflow-hidden bg-grain"
    >
      {/* Editorial top metadata header */}
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono tracking-widest text-muted uppercase pb-6 sm:pb-8 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>PORTFOLIO // VOL. {profile?.currentYear || new Date().getFullYear()}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <Compass size={13} className="text-muted-foreground" />
            <span>{profile?.location || "Global Remote"}</span>
          </div>
          {time && <span className="text-foreground/80">{time}</span>}
        </div>
      </div>

      {/* Main Narrative & Typography */}
      <div className="max-w-7xl w-full mx-auto my-auto py-8 sm:py-16">
        <motion.div
          style={{ x: smoothX, y: smoothY }}
          className="transition-transform duration-100 ease-out"
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 sm:mb-6 inline-block"
          >
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-accent border-b border-accent/40 pb-1">
              Creative Direction &amp; Systems Engineering
            </span>
          </motion.div>

          {/* Large Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-medium text-foreground tracking-tight sm:tracking-editorial leading-[1.1] sm:leading-tightest max-w-6xl"
          >
            {headline}
          </motion.h1>
        </motion.div>

        {/* Supporting description & Call-to-actions */}
        <div className="mt-8 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-7 xl:col-span-6"
          >
            <p className="text-sm sm:text-lg text-muted-stone leading-relaxed font-normal">
              {subheadline}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="lg:col-span-5 xl:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:justify-end"
          >
            <Link
              href="#work"
              className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-3.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors duration-300 w-full sm:w-auto"
            >
              <span>Selected Work</span>
              <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="#contact"
              className="group inline-flex items-center justify-center gap-3 bg-surface border border-surface-border text-foreground px-6 py-3.5 text-xs font-mono uppercase tracking-widest hover:border-accent/60 hover:text-accent transition-all duration-300 w-full sm:w-auto"
            >
              <span>Initiate Dialogue</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Hero Bottom Bar */}
      <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-surface-border text-[11px] sm:text-xs font-mono text-muted tracking-widest uppercase">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {profile?.socialLinks && profile.socialLinks.length > 0 ? (
            profile.socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span>{link.platform}</span>
                <ArrowUpRight size={10} className="opacity-60" />
              </a>
            ))
          ) : (
            <span>GitHub / LinkedIn / X</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-subtle" />
          <span className="text-[11px] text-muted-stone">
            {profile?.availability?.message || "Available for Select Commissions"}
          </span>
        </div>
      </div>
    </section>
  );
}

