"use client";

import { motion } from "framer-motion";
import { ITestimonial } from "@/types";

interface TestimonialsSectionProps {
  testimonials: ITestimonial[];
}

export default function TestimonialsSection({
  testimonials = [],
}: TestimonialsSectionProps) {
  // Gracefully auto-hide if none exist
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 border-b border-surface-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted mb-8 sm:mb-16">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>05 // TESTIMONIALS &amp; CITATIONS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-surface/40 border border-surface-border p-6 sm:p-10 flex flex-col justify-between"
            >
              <blockquote className="text-base sm:text-xl font-display font-light text-foreground/90 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="mt-8 pt-6 border-t border-surface-border flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-display font-medium text-foreground">
                    {t.person}
                  </h4>
                  <p className="text-xs font-mono text-muted">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

