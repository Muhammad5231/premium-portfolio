"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Loader2, CheckCircle2 } from "lucide-react";
import { IExperience } from "@/types";

export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState<IExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<IExperience> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form text inputs
  const [respText, setRespText] = useState("");
  const [techText, setTechInput] = useState("");

  const fetchExperiences = async () => {
    try {
      const res = await fetch("/api/admin/experience");
      const data = await res.json();
      if (data.experiences) {
        setExperiences(data.experiences);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem({
      company: "",
      role: "",
      location: "San Francisco / Remote",
      startDate: "2024",
      endDate: "Present",
      current: true,
      description: "",
      responsibilities: [],
      technologies: ["TypeScript", "Next.js"],
      website: "",
      order: experiences.length + 1,
      visible: true,
    });
    setRespText("");
    setTechInput("TypeScript, Next.js");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IExperience) => {
    setEditingItem(item);
    setRespText((item.responsibilities || []).join("\n"));
    setTechInput((item.technologies || []).join(", "));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);

    const payload = {
      ...editingItem,
      responsibilities: respText.split("\n").map((s) => s.trim()).filter(Boolean),
      technologies: techText.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const isEdit = Boolean(editingItem._id);
      const url = isEdit
        ? `/api/admin/experience/${editingItem._id}`
        : "/api/admin/experience";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save experience");

      await fetchExperiences();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this career entry?")) return;
    try {
      await fetch(`/api/admin/experience/${id}`, { method: "DELETE" });
      await fetchExperiences();
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
            <span>Career</span>
            <span>//</span>
            <span>Tenure &amp; Appointments</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Experience Timeline Management
          </h1>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
        >
          <Plus size={14} />
          <span>Add Career Appointment</span>
        </button>
      </div>

      {/* Experience Table */}
      <div className="bg-surface/30 border border-surface-border overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-surface/80 border-b border-surface-border text-muted font-mono uppercase tracking-widest text-[10px]">
            <tr>
              <th className="py-3 px-4">Seq</th>
              <th className="py-3 px-4">Role &amp; Company</th>
              <th className="py-3 px-4">Tenure</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted font-mono">
                  Loading experience records...
                </td>
              </tr>
            ) : experiences.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted font-mono">
                  No experience records registered.
                </td>
              </tr>
            ) : (
              experiences.map((exp) => (
                <tr key={exp._id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-muted text-xs">#{exp.order}</td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-display font-medium text-foreground">
                      {exp.role}
                    </div>
                    <div className="text-xs font-mono text-muted">@{exp.company}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-muted-stone">
                    {exp.startDate} &mdash; {exp.current ? "Present" : exp.endDate}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-muted">{exp.location}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border ${
                        exp.visible
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                          : "bg-gray-900 text-gray-500 border-gray-700"
                      }`}
                    >
                      {exp.visible ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 font-mono text-xs">
                      <button
                        onClick={() => handleOpenEdit(exp)}
                        className="text-foreground hover:text-accent uppercase tracking-wider text-[11px] inline-flex items-center gap-1"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
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

      {/* Add / Edit Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-surface-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
              <h2 className="text-lg font-display font-medium text-foreground">
                {editingItem._id ? "Edit Career Appointment" : "Create Career Appointment"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.company || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Role / Position Title *
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
                    Start Date / Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.startDate || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, startDate: e.target.value })}
                    placeholder="2022"
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    End Date / Year
                  </label>
                  <input
                    type="text"
                    disabled={editingItem.current}
                    value={editingItem.endDate || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, endDate: e.target.value })}
                    placeholder="Present"
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.current}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        current: e.target.checked,
                        endDate: e.target.checked ? "Present" : "",
                      })
                    }
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-xs font-mono text-foreground uppercase tracking-wider">
                    Currently Active Appointment
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.visible}
                    onChange={(e) => setEditingItem({ ...editingItem, visible: e.target.checked })}
                    className="w-4 h-4 accent-accent"
                  />
                  <span className="text-xs font-mono text-foreground uppercase tracking-wider">
                    Publicly Visible
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Narrative Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Core Responsibilities &amp; Achievements (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={respText}
                  onChange={(e) => setRespText(e.target.value)}
                  className="w-full bg-background border border-surface-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                  Technologies Applied (Comma-separated)
                </label>
                <input
                  type="text"
                  value={techText}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full bg-background border border-surface-border px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={editingItem.website || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-background border border-surface-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

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
                  <span>Save Appointment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

