"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  User,
  Briefcase,
  Layers,
  Quote,
  Mail,
  Image as ImageIcon,
  Compass,
  Sliders,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Images,
  BookOpen,
  Users,
  MessageSquare,
  Bell,
} from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface AdminSidebarProps {
  admin: SessionUser;
}

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch unread count for message badge
  useEffect(() => {
    fetch("/api/admin/messages")
      .then((res) => res.json())
      .then((data) => {
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: number;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Content",
      items: [
        { label: "Profile & Hero", href: "/admin/profile", icon: User },
        { label: "Projects Archive", href: "/admin/projects", icon: FolderGit2 },
        { label: "Gallery", href: "/admin/gallery", icon: Images },
        { label: "Blog & Monographs", href: "/admin/blog", icon: BookOpen },
        { label: "Experience", href: "/admin/experience", icon: Briefcase },
        { label: "Capabilities", href: "/admin/capabilities", icon: Layers },
        { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      ],
    },
    {
      title: "Community",
      items: [
        { label: "Members Directory", href: "/admin/users", icon: Users },
        { label: "Comments & Reviews", href: "/admin/comments", icon: MessageSquare },
      ],
    },
    {
      title: "Communication",
      items: [
        {
          label: "Inbound Messages",
          href: "/admin/messages",
          icon: Mail,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
    {
      title: "Assets & System",
      items: [
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
        { label: "Navigation Links", href: "/admin/navigation", icon: Compass },
        { label: "Site & SEO Settings", href: "/admin/settings", icon: Sliders },
        { label: "Notification Center", href: "/admin/notifications", icon: Bell },
      ],
    },
  ];

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full justify-between">
      {/* Top brand header */}
      <div className="p-6 border-b border-surface-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-accent" />
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold block">
              Editorial CMS
            </span>
            <span className="text-[10px] font-mono text-muted tracking-wide block">
              MongoDB Terminal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="p-1.5 text-muted hover:text-accent transition-colors"
            title="View Live Website"
          >
            <ExternalLink size={15} />
          </Link>
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-muted hover:text-foreground transition-colors"
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Navigation links */}
      <nav className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-muted/60 block mb-2">
              // {group.title}
            </span>
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-foreground text-background font-semibold"
                      : "text-muted hover:text-foreground hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={14} className={isActive ? "text-background" : "text-muted"} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="bg-accent text-background px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom User info & Logout */}
      <div className="p-4 border-t border-surface-border bg-surface/60 shrink-0 mt-auto">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-xs font-display font-medium text-foreground truncate block">
              {admin.name}
            </span>
            <span className="text-[10px] font-mono text-muted truncate block">
              {admin.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Terminate Session"
            aria-label="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-surface border-b border-surface-border shrink-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent" />
          <span className="text-xs font-mono uppercase tracking-widest font-semibold">
            Control Console
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-muted hover:text-foreground focus:outline-none"
          aria-label="Toggle Navigation Drawer"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex h-full w-72 flex-col shrink-0 border-r border-surface-border bg-surface/95 z-30 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-full bg-surface border-r border-surface-border shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
