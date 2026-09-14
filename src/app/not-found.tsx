import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background text-foreground text-center">
      <div className="max-w-md w-full border border-surface-border bg-surface/40 p-12 relative overflow-hidden">
        <div className="text-xs font-mono uppercase tracking-widest text-accent mb-4">
          Error // 404_Null_Reference
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-medium text-foreground tracking-tight">
          Coordinates Void
        </h1>
        <p className="mt-4 text-sm text-muted-stone leading-relaxed font-sans">
          The requested artifact or address has either been deprecated, relocated, or exists beyond this domain&apos;s index.
        </p>

        <div className="mt-8 pt-6 border-t border-surface-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Origin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

