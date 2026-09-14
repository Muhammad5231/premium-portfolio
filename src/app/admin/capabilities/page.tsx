"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2, Layers } from "lucide-react";
import { ICapability, ICapabilityItem } from "@/types";

export default function AdminCapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<ICapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<ICapability> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCapabilities = async () => {
    try {
      const res = await fetch("/api/admin/capabilities");
      const data = await res.json();
      if (data.capabilities) setCapabilities(data.capabilities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem({
      category: "04 / New Engineering Discipline",
      subtitle: "Focus and core specializations",
      items: [
        {
          title: "Specialized Discipline",
          description: "Description of capability and technical mastery.",
          tags: ["TypeScript", "Architecture"],
        },
      ],
      order: capabilities.length + 1,
      visible: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ICapability) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddItemToCategory = () => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      items: [
        ...(editingItem.items || []),
        { title: "New Skill / Capability", description: "", tags: [] },
      ],
    });
  };

  const handleUpdateItem = (
    index: number,
    field: keyof ICapabilityItem,
    value: any
  ) => {
    if (!editingItem) return;
    const updated = [...(editingItem.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditingItem({ ...editingItem, items: updated });
  };

  const handleRemoveItem = (index: number) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      items: (editingItem.items || []).filter((_, i) => i !== index),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    try {
      const isEdit = Boolean(editingItem._id);
      const url = isEdit
        ? `/api/admin/capabilities/${editingItem._id}`
        : "/api/admin/capabilities";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) throw new Error("Failed to save capability");

      await fetchCapabilities();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.message || "Failed to save capability");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this capability category?")) return;
    try {
      await fetch(`/api/admin/capabilities/${id}`, { method: "DELETE" });
      await fetchCapabilities();
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
            <span>Matrix</span>
            <span>//</span>
            <span>Discipline Modules</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Capabilities &amp; Disciplines CMS
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
        >
          <Plus size={14} />
          <span>Add Capability Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-xs font-mono text-muted uppercase">
            Loading capabilities...
          </div>
        ) : capabilities.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-xs font-mono text-muted uppercase">
            No capabilities cataloged.
          </div>
        ) : (
          capabilities.map((cat) => (
            <div
              key={cat._id}
              className="bg-surface/50 border border-surface-border p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-accent">
                    Sequence #{cat.order}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${
                      cat.visible
                        ? "text-emerald-400 border-emerald-800/50 bg-emerald-950/40"
                        : "text-gray-500 border-gray-700 bg-gray-900"
                    }`}
                  >
                    {cat.visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-display font-medium text-foreground">
                  {cat.category}
                </h3>
                {cat.subtitle && (
                  <p className="text-xs font-mono text-muted mt-1">{cat.subtitle}</p>
                )}

                <div className="mt-6 space-y-3">
                  {cat.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="border-t border-surface-border pt-3 first:border-none first:pt-0"
                    >
                      <h4 className="text-xs font-display font-medium text-foreground">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] text-muted-stone line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-xs font-mono">
                <span className="text-muted">{cat.items.length} skills listed</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="text-foreground hover:text-accent p-1"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-muted hover:text-red-400 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-surface-border max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <h2 className="text-lg font-display font-medium text-foreground">
                {editingItem._id ? "Edit Capability Category" : "Add Capability Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Category Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.category || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, category: e.target.value })
                    }
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Order Sequence
                  </label>
                  <input
                    type="number"
                    value={editingItem.order || 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Category Subtitle
                </label>
                <input
                  type="text"
                  value={editingItem.subtitle || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, subtitle: e.target.value })
                  }
                  className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={editingItem.visible}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, visible: e.target.checked })
                  }
                  className="w-4 h-4 accent-accent"
                />
                <label
                  htmlFor="visible"
                  className="text-xs font-mono text-foreground uppercase tracking-wider cursor-pointer"
                >
                  Visible on Public Matrix
                </label>
              </div>

              {/* Items in category */}
              <div className="border-t border-surface-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-accent">
                    Skills / Items Matrix
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemToCategory}
                    className="text-xs font-mono uppercase text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(editingItem.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-background border border-surface-border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-muted">
                          Item // 0{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-muted hover:text-red-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        value={item.title}
                        onChange={(e) => handleUpdateItem(idx, "title", e.target.value)}
                        placeholder="Item Title (e.g. Kinetic Motion & Micro-interactions)"
                        className="w-full bg-surface border border-surface-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                      />

                      <textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) =>
                          handleUpdateItem(idx, "description", e.target.value)
                        }
                        placeholder="Item Description..."
                        className="w-full bg-surface border border-surface-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                      />

                      <input
                        type="text"
                        value={(item.tags || []).join(", ")}
                        onChange={(e) =>
                          handleUpdateItem(
                            idx,
                            "tags",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        placeholder="Tags (Comma-separated, e.g. Framer Motion, SVG)"
                        className="w-full bg-surface border border-surface-border px-3 py-1.5 text-xs font-mono text-muted focus:outline-none focus:border-accent"
                      />
                    </div>
                  ))}
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
                  <span>Save Capability</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

