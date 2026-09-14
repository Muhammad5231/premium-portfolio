"use client";

import { motion } from "framer-motion";
import { ICapability } from "@/types";

interface CapabilitiesSectionProps {
  capabilities: ICapability[];
}

export default function CapabilitiesSection({
  capabilities = [],
}: CapabilitiesSectionProps) {
  if (!capabilities || capabilities.length === 0) return null;

  return (
    <section id="capabilities" className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 border-b border-surface-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-8 sm:pb-16 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted mb-4">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span>03 // DISCIPLINE &amp; CAPABILITIES</span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-display font-medium text-foreground tracking-tight">
              Engineering through a design lens.
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-muted-stone font-sans">
            A comprehensive matrix of technical disciplines, mathematical rigor, and aesthetic discernment.
          </p>
        </div>

        {/* Matrix Grid */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
          {capabilities.map((category, idx) => (
            <motion.div
              key={category._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-surface/50 border border-surface-border p-6 sm:p-8 flex flex-col justify-between hover:border-surface-border-strong transition-colors"
            >
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-accent">
                  Category // 0{idx + 1}
                </span>
                <h3 className="mt-3 text-xl font-display font-medium text-foreground">
                  {category.category}
                </h3>
                {category.subtitle && (
                  <p className="mt-1 text-xs font-mono text-muted tracking-wide">
                    {category.subtitle}
                  </p>
                )}

                <div className="mt-8 space-y-6">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="border-t border-surface-border/60 pt-4 first:border-none first:pt-0"
                    >
                      <h4 className="text-sm font-display font-medium text-foreground/90">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="mt-1 text-xs text-muted-stone leading-relaxed font-sans">
                          {item.description}
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono text-muted/80 bg-background/60 px-2 py-0.5 border border-surface-border"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-surface-border/40 text-[10px] font-mono uppercase tracking-widest text-muted/60">
                Verified Competency // Production Standard
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

