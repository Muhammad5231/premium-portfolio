"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative group flex items-center gap-2 p-1.5 border border-surface-border bg-surface/60 hover:bg-surface hover:border-surface-border-strong text-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${className}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {mounted ? (
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ y: 8, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -8, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center justify-center text-accent"
              >
                <Sun size={14} strokeWidth={2} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ y: 8, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -8, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center justify-center text-accent"
              >
                <Moon size={14} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <Sun size={14} strokeWidth={2} className="text-accent" />
        )}
      </div>

      {showLabel && (
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
          {isDark ? "LIGHT" : "DARK"}
        </span>
      )}
    </button>
  );
}

