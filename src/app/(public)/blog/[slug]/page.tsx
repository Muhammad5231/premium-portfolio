import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Bookmark,
  ArrowUpRight,
  Sparkles,
  Layers,
  Twitter,
  Linkedin,
  Copy,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import ReadingProgressBar from "@/components/public/ReadingProgressBar";
import BlogComments from "@/components/public/BlogComments";
import ShareButtons from "./ShareButtons";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectToDatabase();
  const post = await BlogPost.findOne({ slug: params.slug, status: "published" }).lean();
  if (!post) {
    return { title: "Article Not Found // Systems Archive" };
  }

  return {
    title: `${post.seoTitle || post.title} // Systems Monograph`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.ogImage || post.coverImage ? [post.ogImage || post.coverImage] : [],
      type: "article",
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  await connectToDatabase();

  const post = await BlogPost.findOneAndUpdate(
    { slug: params.slug, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!post) {
    notFound();
  }

  // Related posts
  const relatedPosts = await BlogPost.find({
    _id: { $ne: post._id },
    status: "published",
    $or: [
      { category: post.category },
      { tags: { $in: post.tags || [] } },
    ],
  })
    .select("title slug excerpt coverImage readingTime publishedAt category")
    .limit(3)
    .lean();

  // Extract structured headings for Table of Contents
  const headingMatches = (post.content || "").match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [];
  const toc = headingMatches.map((h, idx) => {
    const text = h.replace(/<[^>]*>/g, "");
    const id = `section-${idx + 1}`;
    return { text, id };
  });

  return (
    <>
      <ReadingProgressBar />

      <article className="pt-24 sm:pt-32 pb-24 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8 sm:mb-12 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Monographs Index</span>
            </Link>

            <span className="text-[11px] font-mono text-accent uppercase tracking-widest bg-accent/10 border border-accent/20 px-2.5 py-0.5">
              {post.category}
            </span>
          </div>

          {/* Article Header */}
          <header className="space-y-6 pb-10 sm:pb-14 border-b border-surface-border">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Draft"}
                </span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-foreground">
                <Clock size={13} />
                <span>{post.readingTime} min read</span>
              </span>
              <span>&bull;</span>
              <span className="text-muted-stone">
                BY {post.author?.name || "Mohammad"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light text-foreground uppercase tracking-tight leading-[1.08]">
              {post.title}
            </h1>

            <p className="text-base sm:text-xl text-muted font-light leading-relaxed font-sans max-w-3xl">
              {post.excerpt}
            </p>

            {/* Tags list */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((t: string) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono text-muted bg-surface/80 border border-surface-border px-2 py-0.5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Hero Cover Image */}
          {post.coverImage && (
            <div className="my-10 sm:my-14 relative aspect-[21/10] bg-surface border border-surface-border overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 90vw"
                className="object-cover contrast-105"
              />
            </div>
          )}

          {/* Main Layout Grid: TOC + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-10">
            {/* Left/Sidebar: Table of Contents & Social Share (Sticky) */}
            <aside className="lg:col-span-4 order-2 lg:order-1">
              <div className="sticky top-28 space-y-8 p-5 bg-surface/40 border border-surface-border text-xs font-mono">
                {toc.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-accent block">
                      // Table of Contents
                    </span>
                    <ul className="space-y-2 border-l border-surface-border pl-3">
                      {toc.map((item, idx) => (
                        <li key={idx}>
                          <span className="text-muted hover:text-foreground transition-colors cursor-pointer block truncate">
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Author Card */}
                <div className="pt-4 border-t border-surface-border space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted block">
                    Author // Architect
                  </span>
                  <div className="font-display font-medium text-foreground text-sm">
                    {post.author?.name || "Mohammad"}
                  </div>
                  <p className="text-[11px] font-sans text-muted leading-relaxed">
                    Multidisciplinary Design Engineer &amp; Full-Stack Systems Architect.
                  </p>
                </div>

                {/* Interactive Share Controls */}
                <div className="pt-4 border-t border-surface-border">
                  <ShareButtons title={post.title} slug={post.slug} />
                </div>
              </div>
            </aside>

            {/* Right: Article Content Body */}
            <div className="lg:col-span-8 order-1 lg:order-2">
              <div
                className="prose prose-invert max-w-none prose-p:text-muted prose-p:font-light prose-p:leading-relaxed prose-headings:font-display prose-headings:font-light prose-headings:uppercase prose-headings:text-foreground prose-a:text-accent prose-code:text-accent prose-code:font-mono prose-code:bg-surface prose-pre:bg-surface prose-pre:border prose-pre:border-surface-border prose-blockquote:border-l-accent prose-blockquote:text-foreground/90 text-sm sm:text-base leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Related Monographs */}
          {relatedPosts.length > 0 && (
            <div className="mt-20 pt-12 border-t border-surface-border space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent">
                  <Layers size={13} />
                  <span>Related Systems Monographs</span>
                </div>
                <Link
                  href="/blog"
                  className="text-xs font-mono text-muted hover:text-foreground transition-colors uppercase tracking-widest"
                >
                  Explore All →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rel: any) => (
                  <Link
                    key={rel._id}
                    href={`/blog/${rel.slug}`}
                    className="group bg-surface border border-surface-border p-5 hover:border-surface-border-strong transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase">
                        <span className="text-accent">{rel.category}</span>
                        <span>{rel.readingTime} min</span>
                      </div>
                      <h4 className="text-base font-display font-light text-foreground uppercase tracking-tight group-hover:text-accent transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-muted font-light line-clamp-2">
                        {rel.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted pt-2 border-t border-surface-border/60">
                      <span>Read →</span>
                      <ArrowUpRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <BlogComments postSlug={post.slug} postTitle={post.title} />
        </div>
      </article>
    </>
  );
}

