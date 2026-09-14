"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, MessageSquare, ArrowUpRight, Search, Filter, Layers, BookOpen } from "lucide-react";

interface BlogIndexClientProps {
  initialPosts: any[];
  categories: any[];
  featuredPost: any | null;
}

export default function BlogIndexClient({
  initialPosts = [],
  categories = [],
  featuredPost,
}: BlogIndexClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    initialPosts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t: string) => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [initialPosts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      if (selectedCategory !== "All" && post.category !== selectedCategory) {
        return false;
      }
      if (selectedTag && !post.tags?.includes(selectedTag)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title?.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt?.toLowerCase().includes(q);
        const matchesCategory = post.category?.toLowerCase().includes(q);
        const matchesTag = post.tags?.some((t: string) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesExcerpt && !matchesCategory && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [initialPosts, selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="space-y-16">
      {/* Featured Article Section (only displayed when no active search/tag filter is active) */}
      {featuredPost && selectedCategory === "All" && !selectedTag && !searchQuery && (
        <section className="relative bg-surface border border-surface-border p-6 sm:p-10 lg:p-12 group hover:border-surface-border-strong transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Article Meta & Title */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="bg-accent text-background px-2.5 py-0.5 font-bold uppercase tracking-widest text-[10px]">
                  FEATURED DISPATCH
                </span>
                <span className="text-muted/60">&bull;</span>
                <span className="text-accent uppercase tracking-wider font-semibold">
                  {featuredPost.category}
                </span>
                <span className="text-muted/60">&bull;</span>
                <span className="text-muted flex items-center gap-1">
                  <Clock size={12} />
                  <span>{featuredPost.readingTime} min read</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-light text-foreground uppercase tracking-tight leading-[1.12]">
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="hover:text-accent transition-colors"
                >
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-sm sm:text-base text-muted font-light leading-relaxed max-w-xl">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-surface-border text-xs font-mono text-muted">
                <div className="flex items-center gap-4">
                  <span className="text-muted-stone">
                    BY {featuredPost.author?.name || "Mohammad"}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    <span>{featuredPost.commentCount} Comments</span>
                  </span>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 text-foreground hover:text-accent font-semibold uppercase tracking-widest group-hover:translate-x-1 transition-all"
                >
                  <span>Read Monograph</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: Featured Cover Image */}
            {featuredPost.coverImage && (
              <div className="lg:col-span-5 relative aspect-[16/10] bg-background/50 border border-surface-border overflow-hidden">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Filter, Search & Categories Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-surface-border">
        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider overflow-x-auto no-scrollbar max-w-full pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-muted mr-1 flex items-center gap-1.5 shrink-0">
            <Filter size={12} />
            <span>Category:</span>
          </span>
          {["All", ...categories.map((c) => c.name)].map((catName) => (
            <button
              key={catName}
              onClick={() => {
                setSelectedCategory(catName);
                setSelectedTag("");
              }}
              className={`px-3 py-1.5 border transition-all shrink-0 whitespace-nowrap ${
                selectedCategory === catName
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-surface/60 border-surface-border text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {catName}
            </button>
          ))}
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search size={14} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search monographs, tags..."
            className="w-full bg-surface/60 border border-surface-border pl-10 pr-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-[10px] font-mono text-muted hover:text-foreground"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-muted text-[11px] uppercase tracking-wider">Indexed Tags:</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              className={`px-2.5 py-1 border text-[11px] transition-colors ${
                selectedTag === tag
                  ? "bg-accent text-background border-accent font-semibold"
                  : "bg-surface/40 border-surface-border text-muted hover:text-foreground"
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag("")}
              className="text-[11px] text-accent hover:underline ml-2"
            >
              Reset Tag
            </button>
          )}
        </div>
      )}

      {/* Editorial Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, idx) => (
            <motion.article
              key={post._id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              className="group bg-surface border border-surface-border flex flex-col justify-between hover:border-surface-border-strong transition-all duration-300"
            >
              {/* Cover Image (if present) */}
              {post.coverImage && (
                <Link
                  href={`/blog/${post.slug}`}
                  className="relative aspect-[16/10] bg-background/50 overflow-hidden border-b border-surface-border block"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover grayscale contrast-105 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                </Link>
              )}

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-muted">
                    <span className="text-accent font-semibold">{post.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{post.readingTime} min</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-light text-foreground uppercase tracking-tight group-hover:text-accent transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-xs text-muted font-light leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Tags & Meta */}
                <div className="space-y-4 pt-4 border-t border-surface-border">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((t: string) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-muted/70 bg-surface-subtle border border-surface-border px-1.5 py-0.5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono text-muted">
                    <span className="text-[11px] text-muted-stone">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Draft"}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MessageSquare size={12} />
                        <span>{post.commentCount}</span>
                      </span>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-muted hover:text-accent transition-colors"
                        title="Read monograph"
                      >
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-surface-border p-10">
            <BookOpen size={30} className="mx-auto text-muted/40 mb-3" />
            <h4 className="text-base font-display font-medium text-foreground">
              No Monographs Matching Filter
            </h4>
            <p className="text-xs font-mono text-muted mt-1 max-w-sm mx-auto">
              Clear your search query or select another category to view published records.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedTag("");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 border border-surface-border text-xs font-mono uppercase tracking-widest hover:border-foreground transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

