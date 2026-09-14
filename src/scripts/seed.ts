import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { Profile } from "../models/Profile";
import { Project } from "../models/Project";
import { Experience } from "../models/Experience";
import { Capability } from "../models/Capability";
import { NavigationItem } from "../models/NavigationItem";
import { SiteSettings } from "../models/SiteSettings";
import { GalleryItem } from "../models/GalleryItem";
import { BlogPost } from "../models/BlogPost";
import { BlogCategory } from "../models/BlogCategory";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

async function seed() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully.");

  // 1. Admin
  console.log("Seeding Admin account...");
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@portfolio.local";
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(initialPassword, salt);
    await Admin.create({
      name: "Creative Director",
      email: adminEmail,
      passwordHash,
      role: "superadmin",
    });
    console.log(`Created default admin: ${adminEmail} / ${initialPassword}`);
  } else {
    console.log("Admin account already exists.");
  }

  // 2. Profile
  console.log("Seeding Profile...");
  await Profile.deleteMany({});
  await Profile.create({
    name: "Mohammad",
    headline: "Translating complex structural systems into quiet, indelible digital experiences.",
    subheadline:
      "Multidisciplinary Design Engineer & Full-Stack Architect crafting high-performance software at the intersection of radical aesthetic discipline and resilient distributed engineering.",
    bio: "Over 7 years architecting and engineering high-impact digital products. I specialize in bridging the divide between extreme visual craftsmanship and high-throughput server backends.",
    personalStatement:
      "Most digital products suffer either from brilliant engineering cloaked in indifferent aesthetics, or lavish visual theater built upon fragile foundations. I practice the synthesis: software built like an architectural monument—poetic to interact with, indestructible under load.",
    whatIDo: [
      "Creative Engineering & High-Performance Web Applications",
      "Interactive Editorial Design & Kinetic Motion Systems",
      "Scalable Distributed Backends (Node.js, TypeScript, Next.js, MongoDB)",
      "Bespoke Design Systems & Micro-interaction choreography",
    ],
    howIWork: [
      "01 / Radical Typographic & Conceptual Clarity",
      "02 / Zero-bloat, mathematically grounded component architecture",
      "03 / Obsessive tactile feedback: 60fps micro-interactions",
      "04 / Deep domain modeling before writing a single line of UI",
    ],
    whatIValue: [
      "Subtlety and stillness over sensory overload",
      "Enduring timeless craft over ephemeral trend cycles",
      "Instantaneous, perceptible responsiveness across all viewports",
    ],
    avatarUrl: "",
    location: "Global Remote / San Francisco & London",
    availability: {
      status: "available",
      message: "Available for select architectural commissions & advisory",
    },
    email: "hello@mohammad.studio",
    resumeUrl: "",
    socialLinks: [
      { platform: "GitHub", url: "https://github.com" },
      { platform: "X (Twitter)", url: "https://twitter.com" },
      { platform: "LinkedIn", url: "https://linkedin.com" },
      { platform: "ReadCV", url: "https://read.cv" },
    ],
    currentYear: new Date().getFullYear(),
  });

  // 3. Projects
  console.log("Seeding Projects...");
  await Project.deleteMany({});
  await Project.create([
    {
      title: "VORTEX ARCHIVE",
      slug: "vortex-archive",
      shortDescription:
        "A minimalist digital archive and interactive exploration platform for rare typography specimens and geometric ephemera.",
      description:
        "Vortex Archive is an exploratory digital repository engineered to archive rare geometric typography, modernist specimens, and architectural ephemera from 1920 to 1970. Designed with an ultra-lean headless pipeline, spatial grid navigations, and sub-pixel optical controls.",
      category: "Digital Identity & Design Engineering",
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "MongoDB", "Motion"],
      year: 2024,
      client: "Vortex Typographic Foundation",
      role: "Lead Design Engineer & Architect",
      featured: true,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      heroMedia: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
      ],
      liveUrl: "https://vortex-archive.example.com",
      githubUrl: "https://github.com/example/vortex-archive",
      challenge:
        "Traditional typographic archives rely on rigid, catalog-style tables that strip historic specimens of physical scale, paper texture, and optical resonance. The foundation needed an experience that felt closer to inspecting physical archival plates in a climate-controlled gallery.",
      approach:
        "Developed a bespoke coordinate-mapped canvas viewer paired with dynamic contrast filters, allowing visitors to inspect 1,200 DPI vector scans without downloading massive assets simultaneously.",
      solution:
        "Implemented progressive vector streaming with Next.js App Router and optimized MongoDB sparse indexes, delivering lightning-fast sub-100ms search latency across 40,000 specimen variants.",
      results:
        "Achieved 180,000 monthly active researchers, received an Awwwards Site of the Day citation, and reduced infrastructure memory consumption by 54%.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "MongoDB"],
      order: 1,
      seoTitle: "Vortex Archive — Modernist Typographic Platform",
      seoDescription: "An interactive digital archive for rare modernist typographic ephemera.",
      publishedAt: new Date(),
    },
    {
      title: "KAIROS CHRONOMETRY",
      slug: "kairos-chronometry",
      shortDescription:
        "Real-time telemetry and bespoke digital showroom for an independent Swiss mechanical atelier.",
      description:
        "Kairos Chronometry combines high-horology storytelling with live escapement frequency analysis, allowing collectors across the globe to inspect the micro-mechanical heart of each custom timepiece.",
      category: "Systems & Interface Architecture",
      tags: ["Distributed Systems", "WebSockets", "Data Visualization", "Three.js"],
      year: 2024,
      client: "Kairos Atelier Geneve",
      role: "Principal Systems Architect",
      featured: true,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      heroMedia: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200&auto=format&fit=crop",
      ],
      liveUrl: "https://kairos.example.com",
      challenge:
        "Conveying the tactile precision of a 4 Hz balance wheel on digital displays without sluggish 3D asset downloads or confusing navigation.",
      approach:
        "Engineered lightweight procedurally generated SVG gears and synchronized harmonic waveforms driven by live audio frequency capture.",
      solution:
        "A hybrid server-rendered Next.js experience with zero render blocking, dynamic SVG math engines, and localized multi-currency reservation flows.",
      results:
        "Entire annual production run of 48 bespoke timepieces subscribed within 72 hours of launch.",
      technologies: ["TypeScript", "Next.js", "Tailwind CSS", "SVG Math", "MongoDB"],
      order: 2,
      seoTitle: "Kairos Chronometry — Haute Horlogerie Digital Platform",
      seoDescription: "High-horology digital identity and real-time mechanical telemetry.",
      publishedAt: new Date(),
    },
    {
      title: "AURA COMPUTE ENGINE",
      slug: "aura-compute-engine",
      shortDescription:
        "Low-latency streaming computation dashboard and telemetry pipeline for neural inference nodes.",
      description:
        "A unified developer cockpit and orchestration telemetry dashboard for enterprise neural inference clusters, visualizing memory bandwidth, latency spikes, and quantization accuracy in real-time.",
      category: "Cloud Infrastructure & Tooling",
      tags: ["Next.js", "Node.js", "High-Throughput", "MongoDB"],
      year: 2023,
      client: "Aura Distributed Systems",
      role: "Lead Full-Stack Engineer",
      featured: true,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
      heroMedia: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop",
      gallery: [],
      liveUrl: "https://aura-compute.example.com",
      githubUrl: "https://github.com/example/aura-compute",
      challenge:
        "Rendering 100,000 telemetry data points per second across 250 cluster nodes without freezing the DOM or degrading user frame rates.",
      approach:
        "Architected offscreen canvas web workers, ring buffers, and compressed binary message payloads over persistent WebSocket connections.",
      solution:
        "Combined a high-density tabular terminal aesthetic with ultra-responsive interactive scrubber histograms.",
      results:
        "Eliminated 99% of UI thread bottlenecks and dropped incident triage time from 42 minutes to under 4 minutes.",
      technologies: ["Next.js", "WebSockets", "MongoDB", "Tailwind CSS", "TypeScript"],
      order: 3,
      seoTitle: "Aura Compute Engine — Distributed Inference Telemetry",
      seoDescription: "High-throughput cluster telemetry and real-time visualization platform.",
      publishedAt: new Date(),
    },
    {
      title: "MONOLITH OS",
      slug: "monolith-os",
      shortDescription:
        "An experimental, typography-driven desktop environment exploring gestural navigation and calm computing.",
      description:
        "A proof-of-concept operating interface stripped of neon distractions, chaotic notifications, and visual noise. Built exclusively with typographic hierarchy, acoustic feedback, and keyboard-first spatial windows.",
      category: "Experimental Interface",
      tags: ["Spatial UI", "Micro-frontends", "Design Systems"],
      year: 2023,
      client: "Independent Research",
      role: "Solo Creator",
      featured: true,
      status: "published",
      thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
      heroMedia: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1600&auto=format&fit=crop",
      gallery: [],
      liveUrl: "https://monolith-os.example.com",
      challenge:
        "Reimagining personal computing interfaces without copying 1980s Xerox PARC skeuomorphism or modern glassmorphic trends.",
      approach:
        "Implemented strict brutalist typographic constraints: zero drop shadows, monospaced coordinate indicators, and instant kinetic snap transitions.",
      solution:
        "Crafted a custom window manager in TypeScript using pure CSS transforms and zero heavy UI dependencies.",
      results:
        "Garnered 4,500+ GitHub stars and featured in multiple design technology newsletters worldwide.",
      technologies: ["TypeScript", "Next.js", "Tailwind CSS", "Web Audio API"],
      order: 4,
      seoTitle: "Monolith OS — Calm Experimental Computing",
      seoDescription: "An experimental typographic desktop interface exploring calm computing paradigms.",
      publishedAt: new Date(),
    },
  ]);

  // 4. Experiences
  console.log("Seeding Experiences...");
  await Experience.deleteMany({});
  await Experience.create([
    {
      company: "Atelier Minimal",
      role: "Principal Design Engineer & Systems Architect",
      location: "San Francisco / Remote",
      startDate: "2022",
      endDate: "Present",
      current: true,
      description:
        "Leading design engineering and architecture for next-generation digital platforms, interactive identity systems, and high-load web applications.",
      responsibilities: [
        "Architecting full-stack web applications with Next.js, Node.js, and MongoDB",
        "Developing bespoke micro-interaction libraries and WebGL shaders for high-craft client launches",
        "Establishing engineering standards that consistently hit 99+ Lighthouse performance scores",
      ],
      technologies: ["TypeScript", "Next.js", "Tailwind CSS", "MongoDB", "Framer Motion", "Docker"],
      website: "https://example.com",
      order: 1,
      visible: true,
    },
    {
      company: "Synthetix Labs",
      role: "Senior Full-Stack Engineer",
      location: "New York / Remote",
      startDate: "2020",
      endDate: "2022",
      current: false,
      description:
        "Engineered real-time telemetry dashboards, distributed caching mechanisms, and scalable API gateways for developer infrastructure.",
      responsibilities: [
        "Constructed high-throughput data pipelines processing millions of events daily",
        "Refactored legacy monolith into modular Next.js and Node.js microservices",
        "Mentored junior engineers in TypeScript architecture and database indexing",
      ],
      technologies: ["React", "TypeScript", "Node.js", "MongoDB", "Redis", "AWS"],
      website: "https://example.com",
      order: 2,
      visible: true,
    },
    {
      company: "Studio Form & Code",
      role: "Interactive Developer & UI Designer",
      location: "Berlin / Remote",
      startDate: "2018",
      endDate: "2020",
      current: false,
      description:
        "Collaborated with international brands and cultural institutions to produce experimental digital installations, kinetic typography, and bespoke websites.",
      responsibilities: [
        "Designed and coded award-winning interactive digital campaigns",
        "Created responsive design systems and generative typography tools",
      ],
      technologies: ["JavaScript", "HTML5 Canvas", "CSS3", "WebGL", "REST APIs"],
      website: "https://example.com",
      order: 3,
      visible: true,
    },
  ]);

  // 5. Capabilities
  console.log("Seeding Capabilities...");
  await Capability.deleteMany({});
  await Capability.create([
    {
      category: "01 / Creative Engineering & UI",
      subtitle: "Tactile, responsive interface systems",
      items: [
        {
          title: "Bespoke Interface Systems",
          description: "Fluid, mathematically precise UI components that feel physical and alive.",
          tags: ["Next.js", "React", "Tailwind", "Framer Motion"],
        },
        {
          title: "Kinetic Typography & Motion",
          description: "Choreographed transitions and micro-interactions that clarify rather than distract.",
          tags: ["Motion Design", "SVG Geometry", "Physics"],
        },
        {
          title: "Design Systems & Tokens",
          description: "Living design systems unifying typography, spacing, and accessible color scales.",
          tags: ["Figma to Code", "Design Tokens", "Accessibility"],
        },
      ],
      order: 1,
      visible: true,
    },
    {
      category: "02 / Full-Stack & Systems Architecture",
      subtitle: "Robust, resilient backends",
      items: [
        {
          title: "Server Architectures & Next.js",
          description: "SSR, ISR, Server Actions, and edge computing for instantaneous page loads.",
          tags: ["Next.js App Router", "Node.js", "Edge Computing"],
        },
        {
          title: "Database Modeling & Optimization",
          description: "Clean schema architecture, compound indexing, and query optimization.",
          tags: ["MongoDB", "Mongoose", "Caching Strategy"],
        },
        {
          title: "Security & Authentication",
          description: "Stateless signed JWT cookies, bcrypt hashing, CSRF prevention, and rate-limiting.",
          tags: ["Auth Security", "Data Sanitization", "Zod Validation"],
        },
      ],
      order: 2,
      visible: true,
    },
    {
      category: "03 / Craft & Performance Engineering",
      subtitle: "Discipline and uncompromising quality",
      items: [
        {
          title: "Performance & Zero Layout Shift",
          description: "Sub-second initial paint times and strict 100/100 Core Web Vitals targets.",
          tags: ["Lighthouse 100", "Image Optimization", "Code Splitting"],
        },
        {
          title: "Accessibility (WCAG AA)",
          description: "Semantic landmarks, keyboard navigation, high-contrast ratios, and reduced motion.",
          tags: ["a11y", "ARIA Standards", "Keyboard Focus"],
        },
        {
          title: "Technical Direction & Product Strategy",
          description: "Transforming vague conceptual briefs into precise engineering roadmaps.",
          tags: ["System Design", "Product Discovery", "Architecture"],
        },
      ],
      order: 3,
      visible: true,
    },
  ]);

  // 6. Navigation
  console.log("Seeding Navigation...");
  await NavigationItem.deleteMany({});
  await NavigationItem.create([
    { label: "Work", url: "/#work", order: 1, visible: true, isExternal: false },
    { label: "Identity", url: "/#about", order: 2, visible: true, isExternal: false },
    { label: "Capabilities", url: "/#capabilities", order: 3, visible: true, isExternal: false },
    { label: "Experience", url: "/#experience", order: 4, visible: true, isExternal: false },
    { label: "Gallery", url: "/gallery", order: 5, visible: true, isExternal: false },
    { label: "Blog", url: "/blog", order: 6, visible: true, isExternal: false },
    { label: "Contact", url: "/#contact", order: 7, visible: true, isExternal: false },
  ]);

  // 7. Site Settings
  console.log("Seeding Site Settings...");
  await SiteSettings.deleteMany({});
  await SiteSettings.create({
    siteName: "Mohammad — Design Engineer & Architect",
    logoText: "MOHAMMAD",
    contactEmail: "hello@mohammad.studio",
    seoTitle: "Mohammad — Design Engineer & Full-Stack Architect",
    seoDescription:
      "Bespoke digital experiences, creative engineering, and high-craft software systems with Next.js and MongoDB.",
    keywords: [
      "Design Engineer",
      "Full-Stack Architect",
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Creative Developer",
      "Editorial Design",
    ],
    footerStatement:
      "Crafting enduring digital identities, scalable architectures, and memorable interactive software.",
    copyrightText: "Designed & Engineered with uncompromising craft.",
    maintenanceMode: false,
    analyticsId: "",
  });

  // 8. Gallery Items
  console.log("Seeding Gallery Items...");
  await GalleryItem.deleteMany({});
  await GalleryItem.create([
    {
      title: "VORTEX ARCHIVE // Specimen Sheet",
      slug: "vortex-archive-specimen-sheet",
      description: "Exhibition Plate 01 // Vector glyph scan at 1,200 DPI",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85",
      category: "Digital Identity",
      tags: ["Typography", "vortex-archive", "Modernist"],
      featured: true,
      published: true,
      order: 1,
    },
    {
      title: "VORTEX ARCHIVE // Geometric Ephemera",
      slug: "vortex-archive-geometric-ephemera",
      description: "Archival Plate 02 // Geometric structural study",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
      category: "Digital Identity",
      tags: ["Ephemera", "vortex-archive", "Modernist"],
      featured: false,
      published: true,
      order: 2,
    },
    {
      title: "KAIROS CHRONOMETRY // Balance Escapement",
      slug: "kairos-chronometry-balance-escapement",
      description: "Micro-mechanical frequency analysis telemetry",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&q=85",
      category: "Systems & Interface",
      tags: ["Horology", "kairos-chronometry", "Telemetry"],
      featured: true,
      published: true,
      order: 3,
    },
    {
      title: "KAIROS CHRONOMETRY // Atelier Cleanroom",
      slug: "kairos-chronometry-atelier-cleanroom",
      description: "Plate 02 // Cleanroom workstation capture",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1800&q=85",
      category: "Systems & Interface",
      tags: ["Horology", "kairos-chronometry", "Atelier"],
      featured: false,
      published: true,
      order: 4,
    },
    {
      title: "AURA COMPUTE ENGINE // Neural Mesh",
      slug: "aura-compute-engine-neural-mesh",
      description: "Offscreen canvas real-time telemetry buffer",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=85",
      category: "Cloud Infrastructure",
      tags: ["Distributed", "aura-compute-engine", "Telemetry"],
      featured: true,
      published: true,
      order: 5,
    },
    {
      title: "MONOLITH OS // Typographic Window Canvas",
      slug: "monolith-os-typographic-window-canvas",
      description: "Brutalist coordinate workspace specimen",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1800&q=85",
      category: "Experimental Interface",
      tags: ["Calm Computing", "monolith-os", "Typography"],
      featured: true,
      published: true,
      order: 6,
    },
    {
      title: "SYNTHETIX // Token Matrix Specimen",
      slug: "synthetix-token-matrix-specimen",
      description: "High-density token hierarchy specimen",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1800&q=85",
      category: "Design Systems",
      tags: ["Design Systems", "vortex-archive", "Tokens"],
      featured: false,
      published: true,
      order: 7,
    },
  ]);

  // 9. Blog Categories
  console.log("Seeding Blog Categories...");
  await BlogCategory.deleteMany({});
  await BlogCategory.create([
    {
      name: "Architecture & Systems",
      slug: "architecture-and-systems",
      description: "Distributed backends, data modeling, concurrency, and resilient cloud architectures.",
      order: 1,
      visible: true,
    },
    {
      name: "Spatial Interfaces",
      slug: "spatial-interfaces",
      description: "Modern tactile digital canvases, micro-interactions, and 60fps kinetic motion.",
      order: 2,
      visible: true,
    },
    {
      name: "Creative Engineering",
      slug: "creative-engineering",
      description: "Pushing the limits of web tech: WebGL shaders, SVG geometry, and offscreen compute.",
      order: 3,
      visible: true,
    },
    {
      name: "Typography & Craft",
      slug: "typography-and-craft",
      description: "Radical editorial discipline, sub-pixel typesetting, and enduring digital design.",
      order: 4,
      visible: true,
    },
  ]);

  // 10. Blog Posts
  console.log("Seeding Blog Posts...");
  await BlogPost.deleteMany({});
  await BlogPost.create([
    {
      title: "The Architecture of Quiet Software: Radical Discipline Over Digital Clutter",
      slug: "architecture-of-quiet-software",
      excerpt:
        "Why modern digital products feel deafeningly loud, and how architectural discipline, spatial stillness, and typographic restraint restore human agency to software.",
      content: `## The Cacophony of the Modern Web

Every day, digital products demand our cognitive surplus through blinking badges, artificial urgency modals, and erratic transitions designed to harvest fleeting seconds of attention. We have normalized interfaces that behave like anxious hawkers in a crowded bazaar rather than tranquil architectural sanctuaries.

Quiet software begins with an ontological premise: **the user is not an attention resource to be consumed, but an autonomous intellect seeking stillness, clarity, and precision.**

\`\`\`typescript
// The principle of deterministic stillness
interface QuietSystem {
  opticalRestraint: boolean;
  zeroUnsolicitedModals: true;
  tactileFeedbackBudgetMs: number; // <= 16ms
}
\`\`\`

## Structural Stillness: Designing from Negative Space

When Mies van der Rohe proposed *less is more*, he did not advocate for vacuous emptiness. He demanded that every structural column justify its existence against the forces of gravity. In digital systems, negative space is not the absence of elements; it is the gravitational field that allows essential content to breathe.

### 1. Typographic Weight and Sub-pixel Harmony

By limiting the type scale to a rigorous geometric progression and stripping away unnecessary color fills, we allow typography to carry the entire tonal architecture. Monospaced indices paired with modernist grotesques yield an atmosphere of considered industrial craftsmanship.

### 2. Kinetic Snap Over Flamboyant Flourish

Animation must serve spatial comprehension rather than visual vanity. A transition that takes 800ms to swoosh into view is an impediment; a transition that snaps decisively in 180ms with exponential damping conveys physical solidity and confidence.

## Engineering the Backend for Uncompromised Velocity

A beautiful interface that stutters during data fetching instantly destroys the illusion of tangible craft. To deliver quietness, the underlying backend must execute queries with ruthless efficiency:

* **Compound compound indexes** on high-frequency predicates.
* **Stateless cryptographically signed tokens** that eliminate continuous database roundtrips for session authentication.
* **Server-rendered editorial shells** hydrated progressively without jarring cumulative layout shifts.

Quiet software is not merely an aesthetic doctrine—it is an ethical and engineering contract between the creator and the observer.`,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85",
      author: {
        name: "Mohammad",
        avatar: "",
      },
      category: "Architecture & Systems",
      tags: ["Systems", "Architecture", "Minimalism", "Design Engineering"],
      status: "published",
      featured: true,
      readingTime: 6,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      seoTitle: "The Architecture of Quiet Software — Radical Discipline",
      seoDescription: "Exploring the philosophical and engineering foundations of calm, intentional software architecture.",
      views: 342,
    },
    {
      title: "Sub-Millisecond Interfaces: Orchestrating Next.js, SVG Math, and Frame Budgets",
      slug: "sub-millisecond-interfaces",
      excerpt:
        "An in-depth technical analysis on bypassing browser paint bottlenecks, streaming vector coordinates, and maintaining a solid 60fps across high-density telemetry displays.",
      content: `## The Illusion of Tangibility

When a visitor manipulates a slider or scrolls through a catalog, the human eye detects even 12 milliseconds of frame jitter. Physical objects don't drop frames when pushed across a desk; if digital interfaces aspire to feel like precision instruments, they must honor the 16.6ms hardware frame budget unconditionally.

## Bypassing React Reconciliation for Kinetic Scrubbing

In high-frequency telemetry viewports—such as our Kairos escapement viewer or Aura compute dashboards—triggering a full React re-render cycle on every mousemove coordinate is suicide for main thread performance.

\`\`\`typescript
// Direct hardware-accelerated transform mutator
function updateTransformDirect(element: HTMLElement, x: number, y: number) {
  element.style.transform = \`translate3d(\${x}px, \${y}px, 0)\`;
}
\`\`\`

Instead of binding state variables directly to SVG path coordinates:
1. We establish a ref pointer directly to the SVG \`<path>\` node.
2. We compute cubic bezier anchors inside an offscreen web worker.
3. We stream the mutated path geometry directly to the DOM node via \`requestAnimationFrame\`.

## Optimizing Server-Driven State with Next.js App Router

Next.js Server Components allow us to precompute expensive typographic hierarchies and syntax-highlighted code blocks on the server, shipping zero bytes of client-side Markdown parsing JavaScript.

The result is instant First Contentful Paint (FCP) and near-zero Total Blocking Time (TBT), even on low-powered mobile devices.`,
      coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1800&q=85",
      author: {
        name: "Mohammad",
        avatar: "",
      },
      category: "Creative Engineering",
      tags: ["Performance", "Next.js", "SVG", "Animation", "TypeScript"],
      status: "published",
      featured: true,
      readingTime: 5,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      seoTitle: "Sub-Millisecond Interfaces: High-Craft Web Performance",
      seoDescription: "Technical deep-dive on maintaining 60fps animations and sub-100ms response times in modern web applications.",
      views: 218,
    },
    {
      title: "Modernist Grid Systems in Contemporary Web Architecture",
      slug: "modernist-grid-systems",
      excerpt:
        "Translating the geometric principles of Emil Ruder, Josef Müller-Brockmann, and Wim Crouwel into fluid CSS Grid coordinate systems.",
      content: `## The Swiss Legacy in Modern Viewports

In 1961, Josef Müller-Brockmann codified the grid system as an instrument of intellectual rigor. The grid was not invented to imprison creative freedom, but to liberate the reader from arbitrary chaos.

When translating these analog typographic canons to liquid, responsive viewports, naive CSS implementations often fall into two traps:
- Rigid desktop columns that break into messy single-column stacks on mobile.
- Unconstrained fluid layouts that stretch line lengths into unreadable 120-character ribbons on ultra-wide monitors.

## The Mathematical Ratio: Golden Measure and Baseline Rhythms

A resilient digital grid establishes an immutable rhythm based on vertical line height:

\`\`\`css
:root {
  --baseline: 1.5rem;
  --gutter: clamp(1rem, 3vw, 2.5rem);
  --column-max: 72ch;
}
\`\`\`

By ensuring that paragraph margins, heading padding, and media block heights are strict integer multiples of this baseline, the entire composition resonates with musical coherence.

## Spatial Tension: Balancing Dense Terminals and Expansive Margins

Contrast is what gives an interface life. A dense telemetry block conveying server status or Git commit hashes gains dramatic presence when flanked by generous, unadorned margins.

Modern web design has too often succumbed to timid medium gray cards with rounded corners. By reviving high-contrast architectural borders and deliberate coordinate stamps, we create websites that stand apart as enduring cultural artifacts.`,
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1800&q=85",
      author: {
        name: "Mohammad",
        avatar: "",
      },
      category: "Typography & Craft",
      tags: ["Typography", "CSS Grid", "Design Systems", "Swiss Style"],
      status: "published",
      featured: false,
      readingTime: 4,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
      seoTitle: "Modernist Grid Systems in Contemporary Web Architecture",
      seoDescription: "How classic Swiss typography and geometric grid canons inform high-craft digital interfaces.",
      views: 185,
    },
  ]);

  console.log("Database seeded successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

