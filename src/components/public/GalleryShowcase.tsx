"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";

export interface GalleryItem {
  id: string;
  url: string;
  projectTitle: string;
  projectSlug: string;
  category: string;
  year: number | string;
  plateType: string;
  plateIndex: number;
}

interface GalleryShowcaseProps {
  items: GalleryItem[];
}

export default function GalleryShowcase({ items = [] }: GalleryShowcaseProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  // Extract unique project titles for quick filtering
  const projectTitles = ["All", ...Array.from(new Set(items.map((i) => i.projectTitle)))];

  const filteredItems =
    selectedFilter === "All"
      ? items
      : items.filter((i) => i.projectTitle === selectedFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeItemIndex === null) return;
      if (e.key === "Escape") {
        setActiveItemIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveItemIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : 0
        );
      } else if (e.key === "ArrowLeft") {
        setActiveItemIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItemIndex, filteredItems.length]);

  const activePlate = activeItemIndex !== null ? filteredItems[activeItemIndex] : null;

  return (
    <div className="w-full">
      {/* Editorial Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-surface-border">
        {/* Project Selector Tabs */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider overflow-x-auto no-scrollbar max-w-full pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-muted mr-1 sm:mr-2 flex items-center gap-1.5 shrink-0">
            <Filter size={12} />
            <span>Filter:</span>
          </span>
          {projectTitles.map((title) => (
            <button
              key={title}
              onClick={() => {
                setSelectedFilter(title);
                setActiveItemIndex(null);
              }}
              className={`px-3 py-1.5 border transition-all duration-200 shrink-0 whitespace-nowrap ${
                selectedFilter === title
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-surface/60 border-surface-border text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Count Telemetry */}
        <div className="text-xs font-mono text-muted uppercase tracking-widest flex items-center gap-3 shrink-0">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-subtle" />
          <span>
            {filteredItems.length} of {items.length} Plates Documented
          </span>
        </div>
      </div>

      {/* Asymmetric / Editorial Gallery Grid */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            // Creative visual rhythm: make every 4th plate span 2 columns on wide viewports
            const isWide = index % 5 === 0;

            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
                className={`group relative bg-surface border border-surface-border overflow-hidden flex flex-col justify-between hover:border-surface-border-strong transition-all duration-300 ${
                  isWide ? "sm:col-span-2 lg:col-span-2" : "col-span-1"
                }`}
              >
                {/* Plate Frame Header */}
                <div className="p-3.5 bg-surface/90 border-b border-surface-border flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-semibold">PLATE // 0{index + 1}</span>
                    <span>&bull;</span>
                    <span className="text-muted/60">{item.plateType}</span>
                  </div>
                  <span className="text-[10px] text-muted-stone">{item.year}</span>
                </div>

                {/* Media Image with Cursor Trigger */}
                <div
                  onClick={() => setActiveItemIndex(index)}
                  className={`relative w-full bg-background/50 overflow-hidden cursor-zoom-in ${
                    isWide ? "aspect-[21/10]" : "aspect-[16/11]"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={`${item.projectTitle} - Plate 0${index + 1}`}
                    fill
                    sizes={isWide ? "(max-width: 1280px) 100vw, 80vw" : "(max-width: 768px) 100vw, 33vw"}
                    className="object-cover object-center filter grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                  />

                  {/* Subtle Grain Overlay */}
                  <div className="absolute inset-0 bg-background/10 group-hover:opacity-0 transition-opacity pointer-events-none" />

                  {/* Floating Action Badge */}
                  <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md border border-surface-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-foreground flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={11} className="text-accent" />
                    <span>Inspect</span>
                  </div>
                </div>

                {/* Plate Footer Metadata & Link to Case Study */}
                <div className="p-4 bg-surface border-t border-surface-border flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${item.projectSlug}`}
                      className="text-sm font-display font-medium text-foreground hover:text-accent transition-colors truncate block"
                    >
                      {item.projectTitle}
                    </Link>
                    <span className="text-[10px] font-mono text-muted/70 truncate block mt-0.5">
                      {item.category}
                    </span>
                  </div>

                  <Link
                    href={`/projects/${item.projectSlug}`}
                    className="text-muted hover:text-accent p-1.5 transition-colors shrink-0"
                    title={`Read full case study: ${item.projectTitle}`}
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="col-span-full py-24 text-center border border-dashed border-surface-border p-12">
            <Layers size={28} className="mx-auto text-muted/50 mb-3" />
            <h3 className="text-base font-display font-medium text-foreground">
              No Visual Plates Found
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              Select another project filter or view all works.
            </p>
          </div>
        )}
      </div>

      {/* Full-Screen High-Resolution Lightbox Modal */}
      <AnimatePresence>
        {activePlate && activeItemIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-8 max-h-[100dvh] overflow-y-auto"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-surface-border">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                <span className="w-2 h-2 bg-accent shrink-0" />
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-foreground font-semibold truncate">
                  Inspection // 0{activeItemIndex + 1} of 0{filteredItems.length}
                </span>
                <span className="hidden sm:inline text-xs font-mono text-muted truncate">
                  &bull; {activePlate.projectTitle} ({activePlate.year})
                </span>
              </div>

              <button
                onClick={() => setActiveItemIndex(null)}
                className="p-2 text-muted hover:text-foreground hover:bg-surface border border-surface-border transition-colors shrink-0"
                title="Close lightbox (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Stage & Fullscreen Image */}
            <div className="relative flex-1 flex items-center justify-center my-3 sm:my-4 overflow-hidden min-h-[45vh]">
              <motion.div
                key={activePlate.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative w-full h-full max-w-6xl max-h-[70vh] flex items-center justify-center"
              >
                <Image
                  src={activePlate.url}
                  alt={`${activePlate.projectTitle} Full Resolution Plate`}
                  fill
                  sizes="100vw"
                  priority
                  className="object-contain"
                />
              </motion.div>

              {/* Navigation Arrows */}
              <button
                onClick={() =>
                  setActiveItemIndex((prev) =>
                    prev !== null
                      ? (prev - 1 + filteredItems.length) % filteredItems.length
                      : 0
                  )
                }
                className="absolute left-1 sm:left-6 p-2 sm:p-3 bg-surface/80 hover:bg-surface text-foreground border border-surface-border backdrop-blur-md transition-colors active:scale-95"
                title="Previous plate (Left Arrow)"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() =>
                  setActiveItemIndex((prev) =>
                    prev !== null ? (prev + 1) % filteredItems.length : 0
                  )
                }
                className="absolute right-1 sm:right-6 p-2 sm:p-3 bg-surface/80 hover:bg-surface text-foreground border border-surface-border backdrop-blur-md transition-colors active:scale-95"
                title="Next plate (Right Arrow)"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Modal Bottom Bar */}
            <div className="pt-3 sm:pt-4 border-t border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
                <span>PROJECT: <strong className="text-foreground">{activePlate.projectTitle}</strong></span>
                <span>CATEGORY: <span className="text-foreground">{activePlate.category}</span></span>
                <span>SPECIMEN: <span className="text-accent">{activePlate.plateType}</span></span>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                <span className="text-[11px] text-muted/60 hidden md:inline">
                  Navigate: [←] [→] &bull; Close: [Esc]
                </span>
                <Link
                  href={`/projects/${activePlate.projectSlug}`}
                  className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-4 py-2.5 uppercase tracking-widest text-[11px] hover:bg-accent transition-colors w-full sm:w-auto"
                >
                  <span>Explore Case Study</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

