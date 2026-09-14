import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, MessageSquare, ArrowUpRight, Search, BookOpen, Layers } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import BlogCategory from "@/models/BlogCategory";
import Comment from "@/models/Comment";
import BlogIndexClient from "./BlogIndexClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dispatches & Monographs // Design Engineering & Systems Archive",
  description:
    "Critical writing, architectural system monographs, and research dispatches on interface craftsmanship, distributed backends, and spatial computing.",
  openGraph: {
    title: "Dispatches & Monographs // Design Engineering & Systems Archive",
    description:
      "Critical writing, architectural system monographs, and research dispatches on interface craftsmanship, distributed backends, and spatial computing.",
  },
};

export default async function BlogPage() {
  let posts: any[] = [];
  let categories: any[] = [];
  let featuredPost: any = null;

  try {
    await connectToDatabase();

    const [postDocs, catDocs] = await Promise.all([
      BlogPost.find({ status: "published" })
        .sort({ featured: -1, publishedAt: -1, order: 1 })
        .lean(),
      BlogCategory.find({ visible: true }).sort({ order: 1 }).lean(),
    ]);

    // Attach comment counts
    const postIds = postDocs.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds }, status: "approved" } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    commentCounts.forEach((c) => countMap.set(c._id.toString(), c.count));

    posts = postDocs.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      commentCount: countMap.get(p._id.toString()) || 0,
    }));

    categories = catDocs.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
    }));

    featuredPost = posts.find((p) => p.featured) || posts[0] || null;
  } catch (error) {
    console.error("Error fetching blog data:", error);
  }

  return (
    <div className="pt-24 sm:pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Portfolio</span>
          </Link>
        </div>

        {/* Editorial Section Header */}
        <div className="relative mb-12 sm:mb-16 pb-8 sm:pb-12 border-b border-surface-border">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-accent">
                <BookOpen size={13} />
                <span>DISPATCHES & MONOGRAPHS // VOL. 01</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light tracking-tight text-foreground uppercase leading-[1.08]">
                Architectural <span className="italic font-serif font-normal">Writings</span> &amp; Systems
              </h1>

              <p className="text-muted text-sm sm:text-lg max-w-2xl font-light leading-relaxed">
                Essays, technical monographs, and post-mortems exploring the intersection of radical aesthetic discipline, high-throughput systems, and tactile digital products.
              </p>
            </div>

            {/* Quick telemetry */}
            <div className="flex flex-wrap lg:flex-col items-start gap-3 p-4 sm:p-5 bg-surface/40 border border-surface-border font-mono text-xs w-full lg:w-auto shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-muted uppercase tracking-wider">Monographs:</span>
                <span className="text-foreground font-semibold text-sm">
                  {posts.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted uppercase tracking-wider">Disciplines:</span>
                <span className="text-foreground font-semibold text-sm">
                  {(categories.length || 4).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Interactive Filter & Grid */}
        <BlogIndexClient
          initialPosts={posts}
          categories={categories}
          featuredPost={featuredPost}
        />
      </div>
    </div>
  );
}

