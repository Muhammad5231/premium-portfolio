import type { Metadata } from "next";
import "./globals.css";
import connectToDatabase from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean();
    return {
      title: {
        default: settings?.seoTitle || "Creative Developer & System Architect",
        template: `%s | ${settings?.siteName || "Portfolio"}`,
      },
      description:
        settings?.seoDescription ||
        "Bespoke digital experiences, creative engineering, and high-craft software systems.",
      keywords: settings?.keywords?.length
        ? settings.keywords
        : ["Design Engineer", "Full Stack Developer", "Creative Technologist", "Next.js", "Architecture"],
      openGraph: {
        title: settings?.seoTitle || "Creative Developer & System Architect",
        description: settings?.seoDescription || "Bespoke digital experiences & software systems.",
        type: "website",
      },
    };
  } catch {
    return {
      title: "Creative Developer & System Architect",
      description: "Bespoke digital experiences, creative engineering, and high-craft software systems.",
    };
  }
}

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('portfolio_theme');
      var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent selection:text-background">
        {children}
      </body>
    </html>
  );
}
