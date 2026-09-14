"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2, ArrowUpDown } from "lucide-react";
import { INavigationItem } from "@/types";

export default function AdminNavigationPage() {
  const [navItems, setNavItems] = useState<INavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<INavigationItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchNavigation = async () => {
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      if (data.items) setNavItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigation();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem({
      label: "",
      url: "#",
      order: navItems.length + 1,
      visible: true,
      isExternal: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: INavigationItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    try {
      if (editingItem._id) {
        // Update single via PUT items array
        const updatedItems = navItems.map((n) =>
          n._id === editingItem._id ? (editingItem as INavigationItem) : n
        );
        const res = await fetch("/api/admin/navigation", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: updatedItems }),
        });
        if (!res.ok) throw new Error("Update failed");
      } else {
        // Create new item
        const res = await fetch("/api/admin/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingItem),
        });
        if (!res.ok) throw new Error("Create failed");
      }

      await fetchNavigation();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.message || "Failed to save navigation");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this navigation link?")) return;
    try {
      await fetch(`/api/admin/navigation?id=${id}`, { method: "DELETE" });
      await fetchNavigation();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Appearance</span>
            <span>//</span>
            <span>Public Header &amp; Footer Links</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Navigation Management
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
        >
          <Plus size={14} />
          <span>Add Nav Link</span>
        </button>
      </div>

      {/* Nav Items Table */}
      <div className="bg-surface/30 border border-surface-border overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-surface/80 border-b border-surface-border text-muted font-mono uppercase tracking-widest text-[10px]">
            <tr>
              <th className="py-3 px-4">Seq</th>
              <th className="py-3 px-4">Label</th>
              <th className="py-3 px-4">Target URL</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted font-mono">
                  Loading navigation...
                </td>
              </tr>
            ) : navItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted font-mono">
                  No custom navigation items configured.
                </td>
              </tr>
            ) : (
              navItems.map((item) => (
                <tr key={item._id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-muted text-xs">#{item.order}</td>
                  <td className="py-4 px-4 font-display font-medium text-foreground text-sm">
                    {item.label}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-muted-stone">{item.url}</td>
                  <td className="py-4 px-4 font-mono text-xs text-muted">
                    {item.isExternal ? "External" : "Internal Anchor"}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border ${
                        item.visible
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                          : "bg-gray-900 text-gray-500 border-gray-700"
                      }`}
                    >
                      {item.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 font-mono text-xs">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-foreground hover:text-accent p-1"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-muted hover:text-red-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-surface-border max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h2 className="text-base font-display font-medium text-foreground">
                {editingItem._id ? "Edit Navigation Link" : "Add Navigation Link"}
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
                  Link Text Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.label || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  placeholder="e.g. Selected Works"
                  className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Destination URL or Anchor *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.url || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="#work or /projects"
                  className="w-full bg-background border border-surface-border px-3 py-2 text-foreground focus:outline-none focus:border-accent font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Sequence Order
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

                <div className="pt-6 space-y-2">
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
                      Visible
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.isExternal}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, isExternal: e.target.checked })
                      }
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-xs font-mono uppercase text-foreground">
                      External Link
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
                  className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

