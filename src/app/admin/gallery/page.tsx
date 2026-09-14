"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Check,
  AlertCircle,
  GripVertical,
  Star,
  Layers,
  Sparkles,
  ExternalLink,
  UploadCloud,
  CheckCircle2,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { IGalleryItem } from "@/types";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<IGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IGalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<IGalleryItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<IGalleryItem>>({
    title: "",
    slug: "",
    description: "",
    image: "",
    category: "Design & Engineering",
    tags: [],
    featured: false,
    published: true,
    order: 0,
  });
  const [tagInput, setTagInput] = useState("");

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to load gallery items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Compute unique categories
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category).filter(Boolean)))];

  // Filtered list
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(search.toLowerCase())) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? item.published === true
        : item.published === false;

    const matchesFeatured = !featuredOnly || item.featured === true;

    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      image: "",
      category: "Design & Engineering",
      tags: ["Interface", "Modernist"],
      featured: false,
      published: true,
      order: items.length + 1,
    });
    setTagInput("");
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: IGalleryItem) => {
    setFormData({
      _id: item._id,
      title: item.title,
      slug: item.slug,
      description: item.description || "",
      image: item.image,
      category: item.category,
      tags: item.tags || [],
      featured: item.featured,
      published: item.published,
      order: item.order,
    });
    setTagInput("");
    setIsEditModalOpen(true);
  };

  // Open Preview Modal
  const handleOpenPreview = (item: IGalleryItem) => {
    setPreviewItem(item);
    setIsPreviewModalOpen(true);
  };

  // Quick toggle Publish state
  const handleTogglePublish = async (item: IGalleryItem) => {
    try {
      const newStatus = !item.published;
      const res = await fetch(`/api/admin/gallery/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, published: newStatus } : i))
      );
      showToast(newStatus ? "Plate published to public gallery" : "Plate reverted to draft");
    } catch (err: any) {
      showToast(err.message || "Failed to update publish state", "error");
    }
  };

  // Quick toggle Featured state
  const handleToggleFeatured = async (item: IGalleryItem) => {
    try {
      const newFeatured = !item.featured;
      const res = await fetch(`/api/admin/gallery/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured flag");

      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, featured: newFeatured } : i))
      );
      showToast(newFeatured ? "Marked plate as Featured" : "Removed from Featured");
    } catch (err: any) {
      showToast(err.message || "Failed to update featured state", "error");
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      showToast("Title and Image are required", "error");
      return;
    }

    setSaving(true);
    try {
      const isEdit = Boolean(formData._id);
      const url = isEdit ? `/api/admin/gallery/${formData._id}` : "/api/admin/gallery";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save gallery item");

      showToast(isEdit ? "Plate updated successfully" : "New plate created successfully");
      setIsEditModalOpen(false);
      await fetchGalleryItems();
    } catch (err: any) {
      showToast(err.message || "Failed to save plate", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Item Confirmation
  const confirmDelete = (item: IGalleryItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete || !itemToDelete._id) return;
    try {
      const res = await fetch(`/api/admin/gallery/${itemToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete plate");

      showToast("Plate removed from archive");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await fetchGalleryItems();
    } catch (err: any) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  // Tags handling
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...currentTags, tagInput.trim()] });
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: currentTags.filter((t) => t !== tagToRemove) });
  };

  // HTML5 Drag & Drop Reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...filteredItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    // Update orders sequentially
    const updated = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));

    setItems(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    setIsReordering(true);
    try {
      const payload = items.map((item, index) => ({
        id: item._id,
        order: index + 1,
      }));

      const res = await fetch("/api/admin/gallery/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });

      if (!res.ok) throw new Error("Failed to save plate ordering");
      showToast("Gallery plate order updated");
    } catch (err: any) {
      showToast(err.message || "Failed to reorder", "error");
      await fetchGalleryItems();
    } finally {
      setIsReordering(false);
    }
  };

  const publishedCount = items.filter((i) => i.published).length;
  const draftCount = items.filter((i) => !i.published).length;
  const featuredCount = items.filter((i) => i.featured).length;

  return (
    <div className="p-4 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Toast Alert Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 text-xs font-mono tracking-wider uppercase border shadow-2xl transition-all duration-300 ${
            toast.type === "error"
              ? "bg-red-950/90 text-red-300 border-red-800/80 backdrop-blur-md"
              : "bg-surface/95 text-emerald-400 border-emerald-500/40 backdrop-blur-md"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <Layers size={13} />
            <span>CONTENT // CURATED ARTIFACTS</span>
            <span className="text-muted">/</span>
            <span className="text-muted-stone">GALLERY MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-medium text-foreground tracking-tight">
            Visual Gallery Plates
          </h1>
          <p className="mt-1 text-sm text-muted font-sans">
            Manage high-resolution design plates, exhibition captures, and interface records displayed on the public gallery.
          </p>
        </div>

        {/* Actions & Metrics Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 bg-surface border border-surface-border text-xs font-mono text-muted">
            <span className="px-2 py-0.5 bg-background text-foreground font-semibold">
              {items.length} Total
            </span>
            <span className="px-2 py-0.5 text-emerald-400">
              {publishedCount} Published
            </span>
            <span className="px-2 py-0.5 text-muted-stone">
              {draftCount} Drafts
            </span>
            {featuredCount > 0 && (
              <span className="px-2 py-0.5 text-accent flex items-center gap-1">
                <Star size={10} className="fill-accent" />
                <span>{featuredCount}</span>
              </span>
            )}
          </div>

          <button
            onClick={fetchGalleryItems}
            disabled={loading}
            className="p-2.5 bg-surface border border-surface-border text-muted hover:text-foreground transition-colors"
            title="Refresh database records"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors font-medium"
          >
            <Plus size={14} />
            <span>Add New Plate</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-surface/60 border border-surface-border">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search plates by title, category, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-surface-border pl-9 pr-4 py-2 text-xs font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-background border border-surface-border px-2.5 py-1.5">
            <Filter size={12} className="text-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none cursor-pointer text-xs uppercase"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-surface text-foreground">
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-background border border-surface-border p-0.5">
            {(["all", "published", "draft"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 uppercase text-[11px] transition-colors ${
                  statusFilter === s
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Featured Toggle Filter */}
          <button
            onClick={() => setFeaturedOnly(!featuredOnly)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-colors ${
              featuredOnly
                ? "bg-accent/20 border-accent text-accent font-semibold"
                : "bg-background border-surface-border text-muted hover:text-foreground"
            }`}
          >
            <Star size={12} className={featuredOnly ? "fill-accent" : ""} />
            <span>Featured</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-background border border-surface-border p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 transition-colors ${
                viewMode === "table" ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
              }`}
              title="Table view"
            >
              <ListIcon size={14} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 transition-colors ${
                viewMode === "grid" ? "bg-surface text-foreground" : "text-muted hover:text-foreground"
              }`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-muted">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="text-xs font-mono uppercase tracking-widest">
            Loading Gallery Inventory...
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-surface-border p-12 bg-surface/20">
          <Layers size={32} className="mx-auto text-muted/40 mb-3" />
          <h3 className="text-base font-display font-medium text-foreground">
            No Visual Plates Found
          </h3>
          <p className="text-xs font-mono text-muted mt-1 max-w-sm mx-auto">
            {search || categoryFilter !== "All" || statusFilter !== "all" || featuredOnly
              ? "No items match your active filters. Clear search or filters to see all plates."
              : "No gallery plates have been added yet. Click 'Add New Plate' to begin."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-surface border border-surface-border text-foreground hover:border-accent text-xs font-mono uppercase tracking-widest transition-colors"
          >
            <Plus size={13} />
            <span>Create First Plate</span>
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* Table / Drag-and-Drop View */
        <div className="bg-surface/40 border border-surface-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-[11px] font-mono uppercase tracking-widest text-muted">
                  <th className="py-3.5 pl-4 pr-2 w-12 text-center">Order</th>
                  <th className="py-3.5 px-4 w-24">Plate</th>
                  <th className="py-3.5 px-4">Title &amp; Slug</th>
                  <th className="py-3.5 px-4">Category &amp; Tags</th>
                  <th className="py-3.5 px-4 w-28 text-center">Featured</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 pr-4 pl-2 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60 text-xs font-mono">
                {filteredItems.map((item, index) => (
                  <tr
                    key={item._id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group hover:bg-surface/80 transition-colors ${
                      draggedIndex === index ? "opacity-30 bg-surface" : ""
                    }`}
                  >
                    {/* Drag Handle & Order */}
                    <td className="py-3 pl-4 pr-2 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted cursor-grab active:cursor-grabbing">
                        <GripVertical size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] text-muted-stone">0{item.order || index + 1}</span>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => handleOpenPreview(item)}
                        className="relative w-16 h-12 bg-background border border-surface-border overflow-hidden cursor-zoom-in group/img shrink-0"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover object-center filter contrast-105 group-hover/img:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-background/20 group-hover/img:opacity-0 transition-opacity" />
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 max-w-sm">
                        <div className="font-display font-medium text-sm text-foreground group-hover:text-accent transition-colors flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.slug && (
                            <span className="text-[10px] font-mono text-muted/60 font-normal">
                              /{item.slug}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-muted-stone font-sans truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Category & Tags */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5">
                        <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-accent bg-accent/10 border border-accent/30 px-2 py-0.5">
                          {item.category}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[9px] font-mono text-muted/70 bg-background px-1.5 py-0.2 border border-surface-border"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Featured Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`p-1.5 rounded transition-colors ${
                          item.featured
                            ? "text-accent hover:text-accent/80"
                            : "text-muted/40 hover:text-muted"
                        }`}
                        title={item.featured ? "Featured plate" : "Mark as featured"}
                      >
                        <Star size={16} className={item.featured ? "fill-accent" : ""} />
                      </button>
                    </td>

                    {/* Published / Draft Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider border transition-colors ${
                          item.published
                            ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40"
                            : "bg-surface border-surface-border text-muted hover:text-foreground"
                        }`}
                      >
                        {item.published ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenPreview(item)}
                          className="p-1.5 text-muted hover:text-foreground hover:bg-surface transition-colors"
                          title="Preview plate"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-muted hover:text-accent hover:bg-surface transition-colors"
                          title="Edit plate"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item)}
                          className="p-1.5 text-muted hover:text-red-400 hover:bg-surface transition-colors"
                          title="Delete plate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map((item, index) => (
            <div
              key={item._id}
              className="group bg-surface border border-surface-border flex flex-col justify-between hover:border-surface-border-strong transition-all"
            >
              {/* Card Image */}
              <div
                onClick={() => handleOpenPreview(item)}
                className="relative aspect-[16/11] w-full bg-background overflow-hidden cursor-zoom-in"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover object-center filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-background/80 backdrop-blur-md border border-surface-border px-2 py-0.5 text-[9px] font-mono text-muted uppercase">
                  #{item.order || index + 1}
                </div>
                {item.featured && (
                  <div className="absolute top-2.5 right-2.5 bg-accent/90 text-background px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase flex items-center gap-1">
                    <Star size={9} className="fill-background" />
                    <span>Featured</span>
                  </div>
                )}
              </div>

              {/* Card Meta */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent">
                    {item.category}
                  </span>
                  <h4 className="font-display font-medium text-sm text-foreground group-hover:text-accent transition-colors truncate">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-muted-stone font-sans line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`px-2 py-0.5 text-[10px] uppercase border transition-colors ${
                      item.published
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400"
                        : "bg-background border-surface-border text-muted"
                    }`}
                  >
                    {item.published ? "Live" : "Draft"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenPreview(item)}
                      className="p-1 text-muted hover:text-foreground"
                      title="Inspect"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-muted hover:text-accent"
                      title="Edit"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="p-1 text-muted hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Plate */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surface-border max-w-2xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface/90">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent" />
                <h3 className="text-sm font-mono uppercase tracking-widest text-foreground font-semibold">
                  {formData._id ? "Edit Gallery Plate" : "Create New Gallery Plate"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveItem} id="gallery-form" className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-130px)]">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                    Plate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Aether OS Spatial Canvas"
                    className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                    Slug (Auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="aether-os-spatial-canvas"
                    className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Spatial Computing, Editorial, Typography"
                    className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              {/* Image Selection with MediaPicker integration */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                  Plate Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... or /uploads/..."
                    className="flex-1 bg-background border border-surface-border px-3.5 py-2.5 text-xs font-mono text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="px-4 py-2.5 bg-surface border border-surface-border text-foreground hover:bg-surface/80 hover:border-accent text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <UploadCloud size={13} />
                    <span>Media Vault</span>
                  </button>
                </div>

                {/* Inline Preview if image is present */}
                {formData.image && (
                  <div className="mt-3 relative aspect-[16/9] w-full max-w-sm bg-background border border-surface-border overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Plate preview"
                      fill
                      sizes="384px"
                      className="object-cover object-center"
                    />
                  </div>
                )}
              </div>

              {/* Description / Caption */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                  Description / Archival Caption
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide context regarding the optical plate, system design, or interface details..."
                  className="w-full bg-background border border-surface-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-1.5">
                  Plate Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag and press Add or Enter..."
                    className="flex-1 bg-background border border-surface-border px-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-surface border border-surface-border text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground"
                  >
                    Add Tag
                  </button>
                </div>
                {formData.tags && formData.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-muted bg-background px-2.5 py-1 border border-surface-border"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted hover:text-red-400"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-border/60">
                <label className="flex items-center gap-3 p-3 bg-background border border-surface-border cursor-pointer hover:border-surface-border-strong transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.published ?? true}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="h-4 w-4 accent-accent rounded-none"
                  />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-foreground block font-medium">
                      Published to Gallery
                    </span>
                    <span className="text-[11px] font-sans text-muted">
                      Visible in public visual archive
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-background border border-surface-border cursor-pointer hover:border-surface-border-strong transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="h-4 w-4 accent-accent rounded-none"
                  />
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-foreground block font-medium">
                      Featured Plate
                    </span>
                    <span className="text-[11px] font-sans text-muted">
                      Highlight with accent badges
                    </span>
                  </div>
                </label>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-surface-border bg-surface/90 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-surface-border text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="gallery-form"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors font-medium disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Plate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: High-Res Inspection Preview */}
      {isPreviewModalOpen && previewItem && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
                Plate Inspection // {previewItem.title}
              </span>
              <span className="text-xs font-mono text-muted">
                &bull; {previewItem.category}
              </span>
            </div>

            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="p-2 text-muted hover:text-foreground border border-surface-border"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <div className="relative w-full h-full max-w-5xl max-h-[72vh]">
              <Image
                src={previewItem.image}
                alt={previewItem.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
            <div className="space-y-1">
              <div className="text-foreground font-medium">{previewItem.title}</div>
              {previewItem.description && (
                <p className="text-muted text-xs font-sans max-w-xl">
                  {previewItem.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 text-[10px] uppercase border ${
                  previewItem.published
                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/20"
                    : "text-muted border-surface-border bg-surface"
                }`}
              >
                {previewItem.published ? "Published" : "Draft"}
              </span>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleOpenEdit(previewItem);
                }}
                className="px-4 py-1.5 bg-foreground text-background uppercase tracking-widest text-xs font-mono hover:bg-accent transition-colors"
              >
                Edit Plate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-red-900/40 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-widest">
              <AlertCircle size={15} />
              <span>Confirm Permanent Deletion</span>
            </div>

            <h3 className="text-lg font-display text-foreground font-medium">
              Delete &ldquo;{itemToDelete.title}&rdquo;?
            </h3>

            <p className="text-xs text-muted-stone font-sans leading-relaxed">
              This will permanently delete this visual plate from the MongoDB database and remove it from the public visual archive. This action cannot be undone.
            </p>

            <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-surface-border text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono uppercase tracking-widest font-semibold transition-colors"
              >
                Delete Plate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, image: url }));
          setIsMediaPickerOpen(false);
        }}
        title="Select Plate Image from Vault"
      />
    </div>
  );
}

