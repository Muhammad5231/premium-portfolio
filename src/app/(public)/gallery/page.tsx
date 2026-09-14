import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Layers, Image as ImageIcon } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import GalleryItem from "@/models/GalleryItem";
import GalleryShowcase, { GalleryItem as ShowcaseItem } from "@/components/public/GalleryShowcase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visual Archive // Project Plates & Gallery",
  description:
    "Curated visual records, tactile interface plates, and design artifacts from commissioned client projects.",
  openGraph: {
    title: "Visual Archive // Project Plates & Gallery",
    description:
      "Curated visual records, tactile interface plates, and design artifacts from commissioned client projects.",
  },
};

export default async function GalleryPage() {
  let plates: ShowcaseItem[] = [];
  let totalProjectsCount = 0;

  try {
    await connectToDatabase();

    // Query published GalleryItems sorted by order
    const galleryDocs = await GalleryItem.find({ published: true })
      .sort({ order: 1 })
      .lean();

    const projects = await Project.find({ status: "published" })
      .sort({ order: 1 })
      .lean();

    totalProjectsCount = projects.length;

    if (galleryDocs && galleryDocs.length > 0) {
      // Map MongoDB GalleryItem collection into showcase plates
      const projectMap = new Map<string, string>();
      projects.forEach((p: any) => {
        projectMap.set(p.slug.toLowerCase(), p.slug);
      });

      plates = galleryDocs.map((doc: any, idx: number) => {
        // Resolve closest project case study slug
        let matchedSlug = "";
        if (doc.slug && projectMap.has(doc.slug.toLowerCase())) {
          matchedSlug = doc.slug;
        } else {
          for (const p of projects) {
            if (
              doc.tags?.some((t: string) => t.toLowerCase() === p.slug.toLowerCase()) ||
              doc.title.toLowerCase().includes(p.title.toLowerCase()) ||
              p.title.toLowerCase().includes(doc.title.toLowerCase())
            ) {
              matchedSlug = p.slug;
              break;
            }
          }
        }

        const titleParts = (doc.title || "").split("//").map((s: string) => s.trim());
        const displayTitle = titleParts.length > 1 ? titleParts[0] : doc.title;
        const subtitle = titleParts.length > 1 ? titleParts[1] : "";

        return {
          id: doc._id.toString(),
          url: doc.image,
          projectTitle: displayTitle,
          projectSlug: matchedSlug || projects[0]?.slug || "vortex-archive",
          category: doc.category || "Design & Engineering",
          year: doc.createdAt ? new Date(doc.createdAt).getFullYear() : new Date().getFullYear(),
          plateType: doc.description || subtitle || (doc.tags && doc.tags[0]) || "Archival Specimen",
          plateIndex: idx + 1,
        };
      });
    } else {
      // Fallback: Collate all photos from projects if gallery collection is unseeded
      projects.forEach((proj: any) => {
        const seenUrls = new Set<string>();
        const projectMedia: { url: string; type: string }[] = [];

        // 1. Thumbnail
        if (proj.thumbnail && !seenUrls.has(proj.thumbnail)) {
          seenUrls.add(proj.thumbnail);
          projectMedia.push({ url: proj.thumbnail, type: "Thumbnail / Overview" });
        }

        // 2. Hero media
        if (proj.heroMedia && !seenUrls.has(proj.heroMedia)) {
          seenUrls.add(proj.heroMedia);
          projectMedia.push({ url: proj.heroMedia, type: "Hero / Key Visual" });
        }

        // 3. Project Gallery
        if (Array.isArray(proj.gallery)) {
          proj.gallery.forEach((url: string, gIdx: number) => {
            if (url && !seenUrls.has(url)) {
              seenUrls.add(url);
              projectMedia.push({
                url,
                type: `Exhibition Plate 0${gIdx + 1}`,
              });
            }
          });
        }

        // Map to GalleryItem format
        projectMedia.forEach((media, idx) => {
          plates.push({
            id: `${proj._id.toString()}-${idx}`,
            url: media.url,
            projectTitle: proj.title,
            projectSlug: proj.slug,
            category: proj.category || "Design & Engineering",
            year: proj.year || new Date().getFullYear(),
            plateType: media.type,
            plateIndex: idx + 1,
          });
        });
      });
    }
  } catch (error) {
    console.error("Failed to fetch gallery plates from MongoDB:", error);
  }

  // High-aesthetic fallback plates if database has no project images
  if (plates.length === 0) {
    plates = [
      {
        id: "fallback-1",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85",
        projectTitle: "Aether OS",
        projectSlug: "aether-os",
        category: "Spatial Computing",
        year: 2024,
        plateType: "Hero / Spatial Canvas",
        plateIndex: 1,
      },
      {
        id: "fallback-2",
        url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1800&q=85",
        projectTitle: "Aether OS",
        projectSlug: "aether-os",
        category: "Spatial Computing",
        year: 2024,
        plateType: "Telemetry Plate",
        plateIndex: 2,
      },
      {
        id: "fallback-3",
        url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1800&q=85",
        projectTitle: "Kroma Protocol",
        projectSlug: "kroma-protocol",
        category: "Fintech & Web3",
        year: 2024,
        plateType: "Core Interface",
        plateIndex: 1,
      },
      {
        id: "fallback-4",
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1800&q=85",
        projectTitle: "Synthetix Design System",
        projectSlug: "synthetix-design-system",
        category: "Design Systems",
        year: 2023,
        plateType: "Token Matrix",
        plateIndex: 1,
      },
      {
        id: "fallback-5",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
        projectTitle: "Monolith Architecture",
        projectSlug: "monolith-architecture",
        category: "Editorial & Commerce",
        year: 2023,
        plateType: "Exhibition Monolith",
        plateIndex: 1,
      },
    ];
  }

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-28 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 sm:mb-10">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Works Directory</span>
          </Link>
        </div>

        {/* Editorial Section Heading */}
        <div className="relative mb-10 sm:mb-14 pb-8 sm:pb-10 border-b border-surface-border">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
            <div className="max-w-3xl space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-accent">
                <Layers size={13} />
                <span>ARCHIVE INDEX // VOL. 04</span>
                <span className="text-muted">/</span>
                <span className="text-muted-stone">PLATES & CAPTURES</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-light tracking-tight text-foreground uppercase leading-[1.1] sm:leading-[1.08]">
                Visual <span className="font-normal italic font-serif">Plates</span> &amp; Artifacts
              </h1>

              <p className="text-muted text-sm sm:text-lg max-w-2xl font-light leading-relaxed">
                A high-resolution optical archive of interface systems, tactile identity elements,
                spatial renders, and design documentation created across published works.
              </p>
            </div>

            {/* Quick Metrics Badge Panel */}
            <div className="flex flex-wrap lg:flex-col items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-surface/40 border border-surface-border font-mono text-xs w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <span className="text-muted uppercase tracking-wider">Indexed Plates:</span>
                <span className="text-foreground font-semibold text-sm">
                  {plates.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted uppercase tracking-wider">Source Projects:</span>
                <span className="text-foreground font-semibold text-sm">
                  {(totalProjectsCount || 4).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-accent">
                <Sparkles size={11} />
                <span>Interactive High-Res Lightbox Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Showcase Client Component */}
        <GalleryShowcase items={plates} />

        {/* Bottom CTA Banner */}
        <div className="mt-16 sm:mt-24 pt-10 sm:pt-16 border-t border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 bg-surface/20 p-6 sm:p-12 border">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs font-mono text-accent uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={13} />
              <span>Full Production Artifacts</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-display font-light uppercase tracking-tight text-foreground">
              Interested in the full systems behind these plates?
            </h3>
            <p className="text-sm text-muted font-light leading-relaxed">
              Every visual plate is backed by comprehensive architectural rationale, live deployed code,
              and measurable business outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <Link
              href="/#work"
              className="px-6 py-3.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 transition-colors font-medium text-center"
            >
              Read Case Studies
            </Link>
            <Link
              href="/#contact"
              className="px-6 py-3.5 border border-surface-border text-foreground font-mono text-xs uppercase tracking-widest hover:border-foreground/40 hover:bg-surface transition-colors text-center"
            >
              Initiate Dialogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

