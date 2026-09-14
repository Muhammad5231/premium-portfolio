import connectToDatabase from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import Profile from "@/models/Profile";
import NavigationItem from "@/models/NavigationItem";
import Navigation from "@/components/public/Navigation";
import Footer from "@/components/public/Footer";
import PublicProviders from "@/components/public/PublicProviders";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = null;
  let profile = null;
  let navItems = [];

  try {
    await connectToDatabase();
    const settingsDoc = await SiteSettings.findOne().lean();
    const profileDoc = await Profile.findOne().lean();
    const navDocs = await NavigationItem.find({ visible: true }).sort({ order: 1 }).lean();

    settings = settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null;
    profile = profileDoc ? JSON.parse(JSON.stringify(profileDoc)) : null;
    navItems = navDocs ? JSON.parse(JSON.stringify(navDocs)) : [];
  } catch (error) {
    console.error("Database retrieval error in PublicLayout:", error);
  }

  return (
    <PublicProviders>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navigation
          logoText={settings?.logoText || profile?.name || "MOHAMMAD"}
          availabilityText={profile?.availability?.message}
          isAvailable={profile?.availability?.status === "available"}
          navItems={navItems}
        />
        <main className="flex-1">{children}</main>
        <Footer
          siteName={settings?.siteName || profile?.name || "MOHAMMAD"}
          statement={settings?.footerStatement}
          copyright={settings?.copyrightText}
          navItems={navItems}
          email={profile?.email || settings?.contactEmail}
          location={profile?.location}
        />
      </div>
    </PublicProviders>
  );
}
