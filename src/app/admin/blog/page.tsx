"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  BookOpen,
  Filter,
  Eye,
  Edit,
  Trash2,
  Star,
  Layers,
  Clock,
  ExternalLink,
  MessageSquare,
  Calendar,
} from "lucide-react";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch(
        `/api/admin/blog?search=${encodeURIComponent(search)}&status=${statusFilter}&category=${categoryFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        setPosts(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/blog/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const toggleFeatured = async (post: any) => {
    try {
      const res = await fetch(`/api/admin/blog/${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !post.featured }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, featured: !p.featured } : p))
        );
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeleting(false);
    }
  };

  // Telemetry counts
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const featuredCount = posts.filter((p) => p.featured).length;

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-accent mb-1">
            <BookOpen size={13} />
            <span>Editorial Console // Dispatches</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-light uppercase text-foreground">
            Blog &amp; Monographs
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/categories"
            className="px-4 py-2.5 bg-surface border border-surface-border text-muted hover:text-foreground font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <Layers size={13} />
            <span>Categories</span>
          </Link>

          <Link
            href="/admin/blog/new"
            className="px-4 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={14} />
            <span>Compose Monograph</span>
          </Link>
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-surface/60 border border-surface-border space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase">Total Articles</span>
          <div className="text-2xl font-display font-light text-foreground">{posts.length}</div>
        </div>
        <div className="p-4 bg-surface/60 border border-surface-border space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase">Published</span>
          <div className="text-2xl font-display font-light text-emerald-400">{publishedCount}</div>
        </div>
        <div className="p-4 bg-surface/60 border border-surface-border space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase">Drafts</span>
          <div className="text-2xl font-display font-light text-amber-400">{draftCount}</div>
        </div>
        <div className="p-4 bg-surface/60 border border-surface-border space-y-1">
          <span className="text-[10px] font-mono text-muted uppercase">Featured</span>
          <div className="text-2xl font-display font-light text-accent">{featuredCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface/40 border border-surface-border">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {["all", "published", "draft", "scheduled", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-surface-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
          >
            <option value="all">All Disciplines</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <form onSubmit={handleSearchSubmit} className="relative w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-background border border-surface-border pl-8 pr-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
            />
          </form>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-surface/40 border border-surface-border overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-surface-border bg-surface/80 uppercase text-muted tracking-wider">
            <tr>
              <th className="p-4 w-12 text-center">Star</th>
              <th className="p-4">Monograph Title</th>
              <th className="p-4">Discipline</th>
              <th className="p-4">Reading</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {posts.map((post) => (
              <tr key={post._id} className="hover:bg-surface-subtle transition-colors group">
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleFeatured(post)}
                    className="text-muted hover:text-accent transition-colors"
                    title="Toggle featured status"
                  >
                    <Star
                      size={14}
                      className={post.featured ? "text-accent fill-accent" : "opacity-40"}
                    />
                  </button>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {post.coverImage && (
                      <div className="relative w-12 h-8 bg-surface shrink-0 overflow-hidden border border-surface-border">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <Link
                        href={`/admin/blog/${post._id}`}
                        className="font-display font-medium text-foreground hover:text-accent transition-colors block truncate max-w-md text-sm"
                      >
                        {post.title}
                      </Link>
                      <span className="text-[10px] text-muted truncate block mt-0.5">
                        /{post.slug}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-muted">
                  <span className="bg-surface border border-surface-border px-2 py-0.5 text-[10px] text-foreground">
                    {post.category}
                  </span>
                </td>

                <td className="p-4 text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>{post.readingTime}m</span>
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                      post.status === "published"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : post.status === "draft"
                        ? "bg-amber-950/40 text-amber-400 border border-amber-800/40"
                        : "bg-surface text-muted border border-surface-border"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>

                <td className="p-4 text-muted text-[11px]">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Unscheduled"}
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {post.status === "published" && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-muted hover:text-foreground"
                        title="Inspect Live Monograph"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    )}

                    <Link
                      href={`/admin/blog/${post._id}`}
                      className="p-1.5 text-muted hover:text-accent"
                      title="Edit Monograph"
                    >
                      <Edit size={13} />
                    </Link>

                    <button
                      onClick={() => setDeleteTarget(post)}
                      className="p-1.5 text-muted hover:text-red-400"
                      title="Delete Monograph"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {posts.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted">
                  No monographs found. Click &quot;Compose Monograph&quot; to publish your first article.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase tracking-widest">
              <Trash2 size={14} />
              <span>Confirm Deletion</span>
            </div>

            <h3 className="text-base font-display font-medium text-foreground">
              Delete &quot;{deleteTarget.title}&quot;?
            </h3>

            <p className="text-xs font-mono text-muted leading-relaxed">
              This action will permanently purge this monograph and all associated peer comments from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-surface-border text-xs font-mono uppercase text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white font-mono text-xs uppercase tracking-wider hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

