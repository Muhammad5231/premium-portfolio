"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, AlertCircle, Loader2, Lock, User as UserIcon, MessageSquare } from "lucide-react";
import { IProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";

interface ContactSectionProps {
  profile: IProfile | null;
  contactEmail?: string;
}

export default function ContactSection({
  profile,
  contactEmail = "hello@domain.com",
}: ContactSectionProps) {
  const { user, openAuthModal } = useAuth();

  const [formData, setFormData] = useState({
    subject: "Commission Inquiry",
    message: "",
    honeypot: "", // Bot trap
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [createdConversationId, setCreatedConversationId] = useState<string | null>(null);

  const effectiveEmail = profile?.email || contactEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("Please authenticate to initiate a confidential commission dialogue.");
      return;
    }

    if (formData.honeypot) {
      setStatus("success");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          honeypot: formData.honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to transmit message. Please try again.");
      }

      setStatus("success");
      if (data.conversationId) {
        setCreatedConversationId(data.conversationId);
      }
      setFormData({
        subject: "Commission Inquiry",
        message: "",
        honeypot: "",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected transmission error occurred.");
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 border-b border-surface-border bg-grain">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted mb-8">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>06 // INITIATE DIALOGUE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">
          {/* Left: Memorable Closing Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8 sm:space-y-12">
            <div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-foreground tracking-tight leading-tight">
                Have something worth building?
              </h2>
              <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-muted-stone leading-relaxed font-sans max-w-lg">
                I partner with forward-thinking studios, founders, and cultural institutions to architect high-craft digital products and systems.
              </p>
            </div>

            <div className="space-y-6 pt-6 sm:pt-8 border-t border-surface-border">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted">
                  Direct Channel
                </span>
                <a
                  href={`mailto:${effectiveEmail}`}
                  className="mt-2 text-lg sm:text-2xl font-display font-medium text-foreground hover:text-accent transition-colors flex items-center gap-2 break-all"
                >
                  <span>{effectiveEmail}</span>
                  <ArrowUpRight size={18} className="text-accent shrink-0" />
                </a>
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-muted">
                  Availability Status
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
                  <span className="text-sm font-mono text-foreground/80">
                    {profile?.availability?.message || "Accepting select commissions"}
                  </span>
                </div>
              </div>

              {profile?.socialLinks && profile.socialLinks.length > 0 && (
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-muted">
                    Digital Networks
                  </span>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {profile.socialLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-muted-stone hover:text-accent transition-colors flex items-center gap-1"
                      >
                        <span>{link.platform}</span>
                        <ArrowUpRight size={11} className="opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-6 bg-surface/60 border border-surface-border p-6 sm:p-12">
            <h3 className="text-xl font-display font-medium text-foreground mb-2">
              Transmission Dispatch
            </h3>
            <p className="text-xs font-mono text-muted mb-8 uppercase tracking-widest">
              Direct delivery to private atelier inbox
            </p>

            {status === "success" ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <CheckCircle2 size={40} className="text-accent animate-bounce" />
                <h4 className="text-xl font-display text-foreground font-medium">
                  Transmission Received // Dialogue Established
                </h4>
                <p className="text-sm text-muted-stone max-w-sm">
                  Your commission dispatch has been cataloged as a private dialogue thread.
                </p>

                {createdConversationId && (
                  <Link
                    href={`/messages/${createdConversationId}`}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors font-medium"
                  >
                    <span>View Conversation Thread</span>
                    <ArrowUpRight size={13} />
                  </Link>
                )}

                <button
                  onClick={() => {
                    setStatus("idle");
                    setCreatedConversationId(null);
                  }}
                  className="mt-4 text-xs font-mono uppercase tracking-widest text-muted hover:text-foreground"
                >
                  Send another inquiry →
                </button>
              </div>
            ) : !user ? (
              /* Requirement 25: Unauthenticated visitor prompt */
              <div className="py-10 text-center space-y-6">
                <div className="w-12 h-12 bg-surface border border-surface-border flex items-center justify-center mx-auto text-accent">
                  <Lock size={20} />
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="text-lg font-display font-medium text-foreground">
                    Please Sign In to Send a Message
                  </h4>
                  <p className="text-xs font-mono text-muted leading-relaxed">
                    To maintain private, authenticated dialogue threads with the studio, all commission briefs require verified membership.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal("Please sign in to send a commission inquiry.")}
                    className="w-full sm:w-auto px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal("Create an account to initiate dialogue.")}
                    className="w-full sm:w-auto px-6 py-3 border border-surface-border text-foreground font-mono text-xs uppercase tracking-widest hover:border-foreground/50 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            ) : (
              /* Authenticated User Dispatch Form */
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Honeypot anti-spam trap */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {/* Authenticated Identity Pill */}
                <div className="p-3 bg-background border border-surface-border flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <UserIcon size={14} className="text-accent" />
                    <span className="text-muted">Dispatching as:</span>
                    <strong className="text-foreground">{user.name}</strong>
                  </div>
                  <span className="text-muted/60 text-[11px] truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Subject / Commission Focus *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-background border border-surface-border px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
                    Scope of Work / Architectural Brief *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide context regarding the project, timeline, budget, and architectural requirements..."
                    className="w-full bg-background border border-surface-border px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent transition-colors resize-none font-sans"
                  />
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400 bg-red-950/30 border border-red-800/50 p-3">
                    <AlertCircle size={14} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full group flex items-center justify-center gap-3 bg-foreground text-background py-4 text-xs font-mono uppercase tracking-widest hover:bg-accent transition-all duration-300 disabled:opacity-50 font-medium"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Transmitting Payload...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Dispatch &amp; Establish Thread</span>
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

