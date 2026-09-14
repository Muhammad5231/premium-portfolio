import Link from "next/link";
import {
  FolderGit2,
  Mail,
  Briefcase,
  Layers,
  ArrowUpRight,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import Message from "@/models/Message";
import Experience from "@/models/Experience";
import Capability from "@/models/Capability";
import Testimonial from "@/models/Testimonial";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await connectToDatabase();

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalMessages,
    unreadMessages,
    totalExperience,
    totalCapabilities,
    recentProjects,
    recentMessages,
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: "published" }),
    Project.countDocuments({ status: "draft" }),
    Message.countDocuments(),
    Message.countDocuments({ status: "unread" }),
    Experience.countDocuments(),
    Capability.countDocuments(),
    Project.find().sort({ updatedAt: -1 }).limit(5).lean(),
    Message.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Terminal</span>
            <span>//</span>
            <span>System Telemetry</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Control Console Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
          >
            <Plus size={14} />
            <span>Draft New Archive</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-surface border border-surface-border text-foreground px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:border-accent transition-colors"
          >
            <Eye size={14} />
            <span>Inspect Live Site</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Projects */}
        <div className="bg-surface/60 border border-surface-border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-mono uppercase tracking-widest">
              Projects Archive
            </span>
            <FolderGit2 size={16} />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-medium text-foreground">
              {totalProjects}
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs font-mono text-muted">
              <span className="text-emerald-400">{publishedProjects} Published</span>
              <span>&bull;</span>
              <span className="text-amber-400">{draftProjects} Drafts</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Messages */}
        <div className="bg-surface/60 border border-surface-border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-mono uppercase tracking-widest">
              Inbound Messages
            </span>
            <Mail size={16} />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-medium text-foreground">
              {totalMessages}
            </div>
            <div className="mt-2 text-xs font-mono text-muted">
              {unreadMessages > 0 ? (
                <span className="text-accent font-semibold">
                  {unreadMessages} Unread Inquiries Requiring Review
                </span>
              ) : (
                <span className="text-muted-stone">Inbox completely synchronized</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 3: Experience */}
        <div className="bg-surface/60 border border-surface-border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-mono uppercase tracking-widest">
              Career Timeline
            </span>
            <Briefcase size={16} />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-medium text-foreground">
              {totalExperience}
            </div>
            <div className="mt-2 text-xs font-mono text-muted">
              Documented appointments &amp; tenures
            </div>
          </div>
        </div>

        {/* Metric 4: Capabilities */}
        <div className="bg-surface/60 border border-surface-border p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-mono uppercase tracking-widest">
              Disciplines
            </span>
            <Layers size={16} />
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-display font-medium text-foreground">
              {totalCapabilities}
            </div>
            <div className="mt-2 text-xs font-mono text-muted">
              Active engineering capability modules
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Projects & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-7 bg-surface/40 border border-surface-border p-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div>
              <h2 className="text-base font-display font-medium text-foreground">
                Recent Projects
              </h2>
              <p className="text-xs font-mono text-muted">
                Latest portfolio additions and edits
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-mono uppercase tracking-widest text-accent hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-surface-border">
            {recentProjects.map((p: any) => (
              <div
                key={p._id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="truncate">
                  <Link
                    href={`/admin/projects/${p._id}`}
                    className="text-sm font-display text-foreground hover:text-accent transition-colors truncate block"
                  >
                    {p.title}
                  </Link>
                  <span className="text-[11px] font-mono text-muted">
                    {p.category} &bull; {p.year}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${
                      p.status === "published"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                        : "bg-amber-950/40 text-amber-400 border-amber-800/50"
                    }`}
                  >
                    {p.status}
                  </span>
                  <Link
                    href={`/admin/projects/${p._id}`}
                    className="text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Inbound Messages */}
        <div className="lg:col-span-5 bg-surface/40 border border-surface-border p-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div>
              <h2 className="text-base font-display font-medium text-foreground">
                Inbound Inquiries
              </h2>
              <p className="text-xs font-mono text-muted">
                Recent transmissions from public contact form
              </p>
            </div>
            <Link
              href="/admin/messages"
              className="text-xs font-mono uppercase tracking-widest text-accent hover:underline flex items-center gap-1"
            >
              <span>Inbox</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-surface-border">
            {recentMessages.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-muted uppercase tracking-widest">
                No inquiries registered yet.
              </div>
            ) : (
              recentMessages.map((msg: any) => (
                <div key={msg._id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-display font-medium text-foreground truncate">
                      {msg.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.2 ${
                        msg.status === "unread"
                          ? "bg-accent/20 text-accent font-semibold"
                          : "text-muted"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-stone line-clamp-1 font-sans">
                    {msg.message}
                  </p>
                  <span className="text-[10px] font-mono text-muted/60 block">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

