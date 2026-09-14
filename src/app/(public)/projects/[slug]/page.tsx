import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, ArrowRight, CheckCircle2 } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import { IProject } from "@/types";

interface ProjectPageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    await connectToDatabase();
    const project = await Project.findOne({ slug: params.slug, status: "published" }).lean();
    if (!project) return { title: "Project Not Found" };

    return {
      title: project.seoTitle || `${project.title} — Case Study`,
      description: project.seoDescription || project.shortDescription,
      openGraph: {
        title: project.seoTitle || project.title,
        description: project.seoDescription || project.shortDescription,
        images: [project.thumbnail],
      },
    };
  } catch {
    return { title: "Project Case Study" };
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  await connectToDatabase();

  const projectDoc = await Project.findOne({
    slug: params.slug,
    status: "published",
  }).lean();

  if (!projectDoc) {
    notFound();
  }

  const project: IProject = JSON.parse(JSON.stringify(projectDoc));

  // Find next published project for seamless transition
  const nextProjectDoc = await Project.findOne({
    status: "published",
    order: { $gt: project.order },
  })
    .sort({ order: 1 })
    .lean();

  const fallbackNextDoc =
    !nextProjectDoc
      ? await Project.findOne({ status: "published", slug: { $ne: project.slug } })
          .sort({ order: 1 })
          .lean()
      : null;

  const nextProject: IProject | null = (nextProjectDoc || fallbackNextDoc)
    ? JSON.parse(JSON.stringify(nextProjectDoc || fallbackNextDoc))
    : null;

  return (
    <article className="min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-accent transition-colors mb-8 sm:mb-12"
        >
          <ArrowLeft size={14} />
          <span>Index // Return to Selected Works</span>
        </Link>

        {/* Project Header */}
        <header className="pb-10 sm:pb-16 border-b border-surface-border">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-accent mb-4">
            <span>Case Study</span>
            <span>//</span>
            <span>{project.category}</span>
          </div>

          <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-display font-medium text-foreground tracking-tight leading-tight sm:leading-tightest max-w-5xl">
            {project.title}
          </h1>

          <p className="mt-6 sm:mt-8 text-base sm:text-xl text-muted-stone max-w-3xl leading-relaxed font-sans">
            {project.shortDescription}
          </p>

          {/* Project Metadata Matrix */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-surface-border grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8">
            <div>
              <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted">
                Role &amp; Discipline
              </span>
              <span className="mt-1 block text-xs sm:text-sm font-display text-foreground">
                {project.role}
              </span>
            </div>

            <div>
              <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted">
                Client / Studio
              </span>
              <span className="mt-1 block text-xs sm:text-sm font-display text-foreground">
                {project.client || "Self-Initiated Commission"}
              </span>
            </div>

            <div>
              <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted">
                Archival Year
              </span>
              <span className="mt-1 block text-xs sm:text-sm font-display text-foreground">
                {project.year}
              </span>
            </div>

            <div>
              <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-muted">
                Artifact Links
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono uppercase tracking-wider text-accent hover:underline flex items-center gap-1"
                  >
                    <span>Live Site</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono uppercase tracking-wider text-muted hover:text-foreground flex items-center gap-1"
                  >
                    <span>Source</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Media Banner */}
        <div className="my-10 sm:my-20">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-surface border border-surface-border">
            <Image
              src={project.heroMedia || project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
              className="object-cover object-center"
            />
          </div>
        </div>

        {/* Narrative & Case Study Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-20">
          {/* Left Column: Tech Stack & Overview */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accent block mb-3">
                // Technological Architecture
              </span>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono text-muted bg-surface px-3 py-1 border border-surface-border"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.description && (
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-3">
                  // Scope Overview
                </span>
                <p className="text-sm text-muted-stone leading-relaxed font-sans">
                  {project.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: The Challenge, The Approach, The Solution, The Results */}
          <div className="lg:col-span-8 space-y-16">
            {project.challenge && (
              <section className="border-b border-surface-border pb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">
                  01 // The Impasse
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-display font-medium text-foreground">
                  The Challenge
                </h2>
                <p className="mt-4 text-base sm:text-lg text-muted-stone leading-relaxed font-sans">
                  {project.challenge}
                </p>
              </section>
            )}

            {project.approach && (
              <section className="border-b border-surface-border pb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">
                  02 // Methodology
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-display font-medium text-foreground">
                  The Strategic Approach
                </h2>
                <p className="mt-4 text-base sm:text-lg text-muted-stone leading-relaxed font-sans">
                  {project.approach}
                </p>
              </section>
            )}

            {project.solution && (
              <section className="border-b border-surface-border pb-12">
                <span className="text-xs font-mono uppercase tracking-widest text-accent">
                  03 // Execution
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-display font-medium text-foreground">
                  The Architectural Solution
                </h2>
                <p className="mt-4 text-base sm:text-lg text-muted-stone leading-relaxed font-sans">
                  {project.solution}
                </p>
              </section>
            )}

            {project.results && (
              <section className="bg-surface/50 border border-surface-border p-8 sm:p-10">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-3">
                  <CheckCircle2 size={14} />
                  <span>04 // Measurable Impact</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-medium text-foreground">
                  Validated Results
                </h2>
                <p className="mt-4 text-base text-muted-stone leading-relaxed font-sans">
                  {project.results}
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Video Reel / Motion Capture if available */}
        {project.videoUrl && (
          <div className="mt-20 pt-16 border-t border-surface-border">
            <span className="text-xs font-mono uppercase tracking-widest text-accent block mb-6">
              // Motion Capture &amp; Reel
            </span>
            <div className="relative aspect-video w-full overflow-hidden bg-surface border border-surface-border">
              {project.videoUrl.includes("youtube.com") || project.videoUrl.includes("youtu.be") || project.videoUrl.includes("vimeo.com") ? (
                <iframe
                  src={project.videoUrl}
                  title={`${project.title} motion capture`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={project.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mt-20 pt-16 border-t border-surface-border">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-8">
              // Artifact Plates &amp; Visual Evidence
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.gallery.map((imgUrl, gIdx) => (
                <div
                  key={gIdx}
                  className="relative aspect-[16/10] w-full overflow-hidden bg-surface border border-surface-border"
                >
                  <Image
                    src={imgUrl}
                    alt={`${project.title} gallery plate ${gIdx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Project Transition Banner */}
        {nextProject && (
          <div className="mt-20 sm:mt-32 pt-10 sm:pt-16 border-t border-surface-border">
            <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-4">
              // Next Archive Study
            </span>
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group block bg-surface/40 hover:bg-surface border border-surface-border p-6 sm:p-12 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-accent">
                    {nextProject.category}
                  </span>
                  <h3 className="mt-2 text-2xl sm:text-5xl font-display font-medium text-foreground group-hover:text-accent transition-colors">
                    {nextProject.title}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-foreground group-hover:text-accent">
                  <span>Explore Case Study</span>
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

