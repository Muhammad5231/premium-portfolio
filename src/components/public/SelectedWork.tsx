"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { IProject } from "@/types";

interface SelectedWorkProps {
  projects: IProject[];
}

export default function SelectedWork({ projects = [] }: SelectedWorkProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="work" className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 border-b border-surface-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 sm:pb-16 border-b border-surface-border">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted mb-4">
              <span className="w-1.5 h-1.5 bg-accent" />
              <span>02 // SELECTED ARCHIVAL WORKS</span>
            </div>
            <h2 className="text-2xl sm:text-5xl font-display font-medium text-foreground tracking-tight">
              Crafted with intention.
            </h2>
          </div>

          {/* Category Filter */}
          {categories.length > 2 && (
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider overflow-x-auto no-scrollbar max-w-full pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 whitespace-nowrap transition-all duration-200 shrink-0 ${
                    activeCategory === category
                      ? "bg-foreground text-background font-semibold"
                      : "bg-surface border border-surface-border text-muted hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Editorial Project Showcase with Alternating Rhythm */}
        <div className="mt-12 sm:mt-24 space-y-16 sm:space-y-36">
          <AnimatePresence mode="wait">
            {filteredProjects.map((project, index) => {
              const isEven = index % 2 === 0;
              const isFeaturedFull = index === 0 && activeCategory === "All";

              // Layout 1: Primary Featured Full Bleed Banner
              if (isFeaturedFull) {
                return (
                  <motion.div
                    key={project._id || project.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    <Link href={`/projects/${project.slug}`} className="block">
                      {/* Image container */}
                      <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full overflow-hidden bg-surface border border-surface-border">
                        <Image
                          src={project.thumbnail}
                          alt={project.title}
                          fill
                          sizes="(max-width: 1280px) 100vw, 1280px"
                          priority
                          className="object-cover object-center filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                        <div className="absolute top-4 left-4 sm:top-8 sm:left-8 bg-background/80 backdrop-blur-md border border-surface-border px-2.5 py-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-accent">
                          Featured Archive
                        </div>
                      </div>

                      {/* Project Meta & Narrative */}
                      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                        <div className="lg:col-span-6">
                          <span className="text-xs font-mono uppercase tracking-widest text-muted">
                            {project.category} // {project.year}
                          </span>
                          <h3 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-display font-medium text-foreground group-hover:text-accent transition-colors flex items-center gap-3">
                            <span>{project.title}</span>
                            <ArrowUpRight size={22} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
                          </h3>
                        </div>

                        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                          <p className="text-sm sm:text-lg text-muted-stone leading-relaxed font-normal">
                            {project.shortDescription}
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-border">
                            <div className="flex flex-wrap gap-2">
                              {project.tags.slice(0, 4).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[11px] sm:text-xs font-mono text-muted bg-surface px-2.5 py-1 border border-surface-border"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-mono uppercase tracking-widest text-foreground group-hover:text-accent flex items-center gap-2 pt-1 sm:pt-0">
                              Read Full Case Study <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              }

              // Layout 2 & 3: Alternating Asymmetric Split Layout
              return (
                <motion.div
                  key={project._id || project.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
                      {/* Image side */}
                      <div
                        className={`lg:col-span-7 ${
                          isEven ? "lg:order-1" : "lg:order-2"
                        }`}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface border border-surface-border">
                          <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 55vw"
                            className="object-cover object-center filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                          />
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-background/80 backdrop-blur-md border border-surface-border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] font-mono uppercase tracking-widest text-muted">
                            {project.year}
                          </div>
                        </div>
                      </div>

                      {/* Content side */}
                      <div
                        className={`lg:col-span-5 flex flex-col justify-center ${
                          isEven ? "lg:order-2 lg:pl-4" : "lg:order-1 lg:pr-4"
                        }`}
                      >
                        <div className="text-xs font-mono uppercase tracking-widest text-muted mb-2 sm:mb-3 flex items-center gap-2">
                          <span className="text-accent">{`0${index + 1}`}</span>
                          <span>//</span>
                          <span>{project.category}</span>
                        </div>

                        <h3 className="text-xl sm:text-3xl lg:text-4xl font-display font-medium text-foreground group-hover:text-accent transition-colors flex items-center justify-between">
                          <span>{project.title}</span>
                          <ArrowUpRight
                            size={18}
                            className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0"
                          />
                        </h3>

                        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-stone leading-relaxed font-normal">
                          {project.shortDescription}
                        </p>

                        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-surface-border flex flex-col gap-4">
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] sm:text-[11px] font-mono text-muted bg-surface px-2.5 py-0.5 border border-surface-border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="text-xs font-mono uppercase tracking-widest text-foreground/80 group-hover:text-accent flex items-center gap-2">
                            <span>Case Study &amp; Architecture</span>
                            <ArrowRight size={13} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="py-24 text-center border border-dashed border-surface-border p-12 max-w-lg mx-auto">
              <span className="w-2 h-2 bg-accent inline-block mb-3" />
              <h3 className="text-base font-display font-medium text-foreground">
                No Archival Works Currently Displayed
              </h3>
              <p className="text-xs font-mono text-muted mt-2">
                Selected portfolio case studies will render here dynamically once configured in the CMS.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

