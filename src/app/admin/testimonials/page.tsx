"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2, Quote } from "lucide-react";
import { ITestimonial } from "@/types";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<ITestimonial>>({
    person: "",
    role: "",
    company: "",
    quote: "",
    order: 1,
    visible: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      if (data.testimonials) setTestimonials(data.testimonials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem({
      person: "",
      role: "",
      company: "",
      quote: "",
      order: testimonials.length + 1,
      visible: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: ITestimonial) => {
    setEditingItem(t);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isEdit = Boolean(editingItem._id);
      const url = isEdit
        ? `/api/admin/testimonials/${editingItem._id}`
        : "/api/admin/testimonials";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) throw new Error("Failed to save citation");

      await fetchTestimonials();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this citation?")) return;
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      await fetchTestimonials();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Social Proof</span>
            <span>//</span>
            <span>Testimonials &amp; Endorsements</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Testimonials &amp; Citations CMS
          </h1>
          <p className="text-xs font-mono text-muted mt-1">
            Note: If no testimonials are present, the section is automatically hidden on the public site.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
        >
          <Plus size={14} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-xs font-mono text-muted uppercase">
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="col-span-2 py-16 text-center border border-dashed border-surface-border p-12">
            <Quote size={28} className="mx-auto text-muted/50 mb-3" />
            <h3 className="text-base font-display text-foreground font-medium">
              No Testimonials Added Yet
            </h3>
            <p className="text-xs font-mono text-muted mt-1 max-w-sm mx-auto">
              Per design standards, the public site currently hides the testimonials section completely to avoid placeholder content.
            </p>
          </div>
        ) : (
          testimonials.map((t) => (
            <div
              key={t._id}
              className="bg-surface/50 border border-surface-border p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-accent uppercase tracking-widest">#{t.order}</span>
                  <span
                    className={`text-[9px] uppercase px-2 py-0.5 border ${
                      t.visible
                        ? "text-emerald-400 border-emerald-800/50 bg-emerald-950/40"
                        : "text-gray-500 border-gray-700 bg-gray-900"
                    }`}
                  >
                    {t.visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <blockquote className="mt-4 text-sm font-display text-foreground/90 font-light leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-display font-medium text-foreground">{t.person}</h4>
                  <p className="text-[11px] font-mono text-muted">
                    {t.role}, {t.company}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1 text-muted hover:text-foreground"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="p-1 text-muted hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-surface-border max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <h2 className="text-lg font-display font-medium text-foreground">
                {editingItem._id ? "Edit Citation" : "Add Citation"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Client / Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.person || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, person: e.target.value })}
                  className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.role || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.company || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Endorsement Quote *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingItem.quote || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Sequence Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.order || 0}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.visible}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, visible: e.target.checked })
                      }
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-xs font-mono uppercase text-foreground">
                      Publicly Visible
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save Citation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

