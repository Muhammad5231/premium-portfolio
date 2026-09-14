"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { INavigationItem } from "@/types";
import Logo from "@/components/ui/Logo";
import NotificationDropdown from "@/components/public/NotificationDropdown";
import UserAccountMenu from "@/components/public/UserAccountMenu";
import ThemeToggle from "@/components/public/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

interface NavigationProps {
  logoText?: string;
  availabilityText?: string;
  isAvailable?: boolean;
  navItems?: INavigationItem[];
}

export default function Navigation({
  logoText = "MOHAMMAD",
  availabilityText = "Available for Q3/Q4 Commissions",
  isAvailable = true,
  navItems = [],
}: NavigationProps) {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY && !mobileMenuOpen) {
          setIsVisible(false); // scrolling down
        } else {
          setIsVisible(true); // scrolling up
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  const defaultItems = [
    { label: "Work", url: "/#work" },
    { label: "Identity", url: "/#about" },
    { label: "Capabilities", url: "/#capabilities" },
    { label: "Experience", url: "/#experience" },
    { label: "Gallery", url: "/gallery" },
    { label: "Blog", url: "/blog" },
    { label: "Contact", url: "/#contact" },
  ];

  // Merge default items ensuring /blog is included
  const hasBlog = navItems.some((i) => i.url === "/blog");
  const displayNav = hasBlog
    ? navItems
    : navItems.length > 0
    ? [...navItems, { label: "Blog", url: "/blog", order: 5, visible: true, isExternal: false }]
    : defaultItems;

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "py-2.5 bg-background/90 backdrop-blur-md border-b border-surface-border"
            : "py-4 sm:py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Logo / Brand identity */}
          <Logo text={logoText} size="md" showSubtitle={true} subtitle="ATELIER // STUDIO" href="/" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-6 text-xs font-mono tracking-widest uppercase text-muted">
              {displayNav.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url}
                  className="hover:text-foreground transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-accent hover:after:w-full after:transition-all after:duration-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="w-[1px] h-4 bg-surface-border" />

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Notification Bell Dropdown */}
            {user && <NotificationDropdown />}

            {/* User Account / Auth Menu */}
            <UserAccountMenu />
          </nav>

          {/* Mobile Right Controls: Theme Toggle + Notification icon + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />

            {user && <NotificationDropdown />}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-muted hover:text-foreground focus:outline-none bg-surface/60 border border-surface-border transition-colors active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl pt-24 pb-8 px-6 flex flex-col justify-between overflow-y-auto md:hidden"
          >
            <div className="flex flex-col space-y-6 my-auto">
              <span className="text-[11px] font-mono uppercase tracking-widest text-accent">
                // Navigation Index
              </span>
              <nav className="flex flex-col space-y-2">
                {displayNav.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-display uppercase tracking-tight text-foreground hover:text-accent transition-colors flex items-center justify-between border-b border-surface-border/50 py-2 active:text-accent"
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight size={15} className="text-muted" />
                  </Link>
                ))}

                {user && (
                  <div className="pt-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent block mb-1">
                      // Member Hub: {user.name}
                    </span>
                    <Link
                      href="/messages"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-mono text-muted hover:text-foreground flex items-center justify-between py-1.5"
                    >
                      <span>Conversations</span>
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link
                      href="/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-mono text-muted hover:text-foreground flex items-center justify-between py-1.5"
                    >
                      <span>Notifications</span>
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-mono text-muted hover:text-foreground flex items-center justify-between py-1.5"
                    >
                      <span>Profile Settings</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                )}
              </nav>
            </div>

            <div className="pt-4 border-t border-surface-border mt-4 space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-surface-border/50">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted">Theme</span>
                <ThemeToggle showLabel={true} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
                  <span className="text-[11px] font-mono text-muted">{availabilityText}</span>
                </div>

                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-mono text-accent uppercase tracking-wider"
                  >
                    Sign In →
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-mono text-foreground font-semibold uppercase tracking-wider"
                  >
                    Member Profile →
                  </Link>
                )}
              </div>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-mono text-muted/60 hover:text-accent transition-colors uppercase tracking-widest block pt-1 border-t border-surface-border/40"
              >
                Access Terminal / CMS →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

