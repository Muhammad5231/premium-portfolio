"use client";

import { motion } from "framer-motion";
import { IProfile } from "@/types";

interface IdentitySectionProps {
  profile: IProfile | null;
}

export default function IdentitySection({ profile }: IdentitySectionProps) {
  const statement =
    profile?.personalStatement ||
    "Most software suffers either from brilliant engineering cloaked in indifferent aesthetics, or lavish visual theater built on fragile foundations. I practice the synthesis: software built like an architectural monument—poetic to interact with, indestructible under load.";

  const whatIDo = profile?.whatIDo?.length
    ? profile.whatIDo
    : [
        "Creative Engineering & High-Performance Web Applications",
        "Interactive Editorial Design & Kinetic Motion Systems",
        "Scalable Distributed Backends (Node.js, TypeScript, Next.js, MongoDB)",
        "Bespoke Design Systems & Micro-interaction choreography",
      ];

  const howIWork = profile?.howIWork?.length
    ? profile.howIWork
    : [
        "01 / Radical Typographic & Conceptual Clarity",
        "02 / Zero-bloat, mathematically grounded component architecture",
        "03 / Obsessive tactile feedback: 60fps micro-interactions",
        "04 / Deep domain modeling before writing a single line of UI",
      ];

  const whatIValue = profile?.whatIValue?.length
    ? profile.whatIValue
    : [
        "Subtlety and stillness over sensory overload",
        "Enduring timeless craft over ephemeral trend cycles",
        "Instantaneous, perceptible responsiveness across all viewports",
      ];

  return (
    <section id="about" className="py-16 sm:py-32 px-4 sm:px-8 lg:px-12 border-b border-surface-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-muted mb-8 sm:mb-16">
          <span className="w-1.5 h-1.5 bg-accent" />
          <span>01 // IDENTITY &amp; PHILOSOPHY</span>
        </div>

        {/* Large Statement Typography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16 pb-12 sm:pb-20 border-b border-surface-border">
          <div className="lg:col-span-4">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-stone">
              The Guiding Principle
            </span>
            <h2 className="mt-2 sm:mt-4 text-xl sm:text-3xl font-display font-medium text-foreground tracking-tight">
              A synthesis of structural rigor &amp; visual poetry.
            </h2>
          </div>

          <div className="lg:col-span-8">
            <blockquote className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-display text-foreground/90 font-light leading-relaxed sm:leading-snug tracking-tight">
              &ldquo;{statement}&rdquo;
            </blockquote>

            {profile?.bio && (
              <p className="mt-6 sm:mt-8 text-sm sm:text-lg text-muted-stone leading-relaxed font-sans max-w-3xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Editorial Pillars: What I Do / How I Work / What I Value */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 pt-10 sm:pt-16">
          {/* Pillar 1 */}
          <div className="flex flex-col space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                // Focus
              </span>
              <h3 className="mt-2 text-xl font-display font-medium text-foreground">
                What I Create
              </h3>
            </div>
            <ul className="space-y-4 text-sm font-sans text-muted-stone divide-y divide-surface-border/50">
              {whatIDo.map((item, idx) => (
                <li key={idx} className="pt-4 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="flex flex-col space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                // Process
              </span>
              <h3 className="mt-2 text-xl font-display font-medium text-foreground">
                How I Work
              </h3>
            </div>
            <ul className="space-y-4 text-sm font-sans text-muted-stone divide-y divide-surface-border/50">
              {howIWork.map((item, idx) => (
                <li key={idx} className="pt-4 first:pt-0 font-mono text-xs">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="flex flex-col space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-accent">
                // Standards
              </span>
              <h3 className="mt-2 text-xl font-display font-medium text-foreground">
                What I Value
              </h3>
            </div>
            <ul className="space-y-4 text-sm font-sans text-muted-stone divide-y divide-surface-border/50">
              {whatIValue.map((item, idx) => (
                <li key={idx} className="pt-4 first:pt-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

