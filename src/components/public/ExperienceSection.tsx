"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { IExperience } from "@/types";

interface ExperienceSectionProps {
  experiences: IExperience[];
}

export default function ExperienceSection({
  experiences = [],
}: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="experience" className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 border-b border-surface-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-8 sm:pb-16 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted mb-4">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span>04 // CAREER &amp; TENURE</span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-display font-medium text-foreground tracking-tight">
              Selected trajectory.
            </h2>
          </div>
          <span className="text-xs font-mono text-muted uppercase tracking-widest">
            {experiences.length} Appointments Documented
          </span>
        </div>

        {/* Timeline Narrative List */}
        <div className="mt-10 sm:mt-16 divide-y divide-surface-border">
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp._id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="py-8 sm:py-16 first:pt-0 group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
                {/* Dates & Location */}
                <div className="lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-1.5 sm:mb-2">
                      <span>{exp.startDate}</span>
                      <span>—</span>
                      <span>{exp.current ? "Present" : exp.endDate}</span>
                      {exp.current && (
                        <span className="ml-2 px-2 py-0.5 text-[9px] bg-accent/20 border border-accent/40 text-accent uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block">
                      {exp.location}
                    </span>
                  </div>

                  {exp.website && (
                    <a
                      href={exp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 sm:mt-6 inline-flex items-center gap-1 text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
                    >
                      <span>Organization</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>

                {/* Role & Company & Detailed Impact */}
                <div className="lg:col-span-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <h3 className="text-xl sm:text-3xl font-display font-medium text-foreground group-hover:text-accent transition-colors">
                      {exp.role}
                    </h3>
                    <span className="text-base sm:text-lg font-display text-muted-stone">
                      @{exp.company}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-stone leading-relaxed font-sans">
                      {exp.description}
                    </p>
                  )}

                  {exp.responsibilities && exp.responsibilities.length > 0 && (
                    <ul className="mt-6 space-y-2 text-sm text-muted-stone font-sans list-disc list-inside">
                      {exp.responsibilities.map((resp, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">
                          {resp}
                        </li>
                      ))}
                    </ul>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-surface-border/50">
                      {exp.technologies.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-xs font-mono text-muted bg-surface px-2.5 py-1 border border-surface-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

