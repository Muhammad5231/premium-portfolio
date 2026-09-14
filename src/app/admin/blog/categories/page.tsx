"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Layers, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminBlogCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for create / edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [visible, setVisible] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/blog/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setName("");
    setSlug("");
    setDescription("");
    setOrder(categories.length + 1);
    setVisible(true);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setOrder(cat.order || 0);
    setVisible(cat.visible ?? true);
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");

    const payload = {
      name: name.trim(),
      slug: slug || name.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-"),
      description,
      order: Number(order),
      visible,
    };

    try {
      const endpoint = editingCat
        ? `/api/admin/blog/categories/${editingCat._id}`
        : "/api/admin/blog/categories";
      const method = editingCat ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category.");
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/blog/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="p-2 border border-surface-border text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-accent mb-1">
              <Layers size={13} />
              <span>Taxonomy Management</span>
            </div>
            <h1 className="text-2xl font-display font-light uppercase text-foreground">
              Blog Disciplines &amp; Categories
            </h1>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={14} />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-surface/40 border border-surface-border overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-surface-border bg-surface/80 uppercase text-muted tracking-wider">
            <tr>
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Discipline Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Visibility</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-surface-subtle transition-colors">
                <td className="p-4 text-center text-muted">{cat.order}</td>
                <td className="p-4">
                  <div className="font-display font-medium text-foreground text-sm">
                    {cat.name}
                  </div>
                  {cat.description && (
                    <span className="text-[11px] text-muted block truncate max-w-sm">
                      {cat.description}
                    </span>
                  )}
                </td>
                <td className="p-4 text-muted">/{cat.slug}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                      cat.visible
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                        : "bg-surface text-muted border border-surface-border"
                    }`}
                  >
                    {cat.visible ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-muted hover:text-accent transition-colors"
                      title="Edit Category"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-muted hover:text-red-400 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {categories.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted">
                  No categories configured. Click &quot;New Category&quot; to initialize taxonomy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-surface border border-surface-border p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
                {editingCat ? "Edit Category" : "New Category"}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted hover:text-foreground text-sm"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/50 text-xs font-mono text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCat && !slug) {
                    setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-"));
                  }
                }}
                className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-background border border-surface-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-background border border-surface-border p-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-background border border-surface-border px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs font-mono text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="accent-accent w-4 h-4"
                  />
                  <span>Visible</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-surface-border text-xs font-mono uppercase text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:bg-accent transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

