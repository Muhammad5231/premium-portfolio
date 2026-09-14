import Link from "next/link";
import Image from "next/image";
import { Plus, Search, ExternalLink, Edit, Star } from "lucide-react";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  await connectToDatabase();

  const query: any = {};
  if (searchParams.status && searchParams.status !== "all") {
    query.status = searchParams.status;
  }
  if (searchParams.search) {
    query.$or = [
      { title: { $regex: searchParams.search, $options: "i" } },
      { category: { $regex: searchParams.search, $options: "i" } },
      { client: { $regex: searchParams.search, $options: "i" } },
    ];
  }

  const projects = await Project.find(query).sort({ order: 1, createdAt: -1 }).lean();

  return (
    <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
            <span>Portfolio</span>
            <span>//</span>
            <span>Archive Directory</span>
          </div>
          <h1 className="text-3xl font-display font-medium text-foreground tracking-tight">
            Projects Archive Management
          </h1>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
        >
          <Plus size={14} />
          <span>Create New Archive</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface/50 border border-surface-border p-4">
        <form method="GET" className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-3 text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search || ""}
            placeholder="Search archives by title, category..."
            className="w-full bg-background border border-surface-border pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent"
          />
        </form>

        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider w-full sm:w-auto">
          {["all", "published", "draft", "archived"].map((st) => (
            <Link
              key={st}
              href={`/admin/projects?status=${st}${searchParams.search ? `&search=${searchParams.search}` : ""}`}
              className={`px-3 py-1 border transition-colors ${
                (searchParams.status || "all") === st
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-surface border-surface-border text-muted hover:text-foreground"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-surface/30 border border-surface-border overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-surface/80 border-b border-surface-border text-muted font-mono uppercase tracking-widest text-[10px]">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Year</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted font-mono text-xs uppercase tracking-widest">
                  No project archives found matching query criteria.
                </td>
              </tr>
            ) : (
              projects.map((p: any) => (
                <tr key={p._id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-muted text-xs">
                    #{p.order}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-8 bg-surface border border-surface-border shrink-0 overflow-hidden">
                        {p.thumbnail && (
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/projects/${p._id}`}
                            className="text-sm font-display font-medium text-foreground hover:text-accent transition-colors"
                          >
                            {p.title}
                          </Link>
                          {p.featured && (
                            <Star size={12} className="text-accent fill-accent" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-muted">
                          /projects/{p.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-muted-stone">
                    {p.category}
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-muted">
                    {p.year}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest border ${
                        p.status === "published"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                          : p.status === "draft"
                          ? "bg-amber-950/40 text-amber-400 border-amber-800/50"
                          : "bg-gray-900 text-gray-400 border-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3 font-mono text-xs">
                      {p.status === "published" && (
                        <Link
                          href={`/projects/${p.slug}`}
                          target="_blank"
                          className="text-muted hover:text-accent transition-colors p-1"
                          title="View live case study"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/projects/${p._id}`}
                        className="text-foreground hover:text-accent uppercase tracking-wider text-[11px] inline-flex items-center gap-1"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

