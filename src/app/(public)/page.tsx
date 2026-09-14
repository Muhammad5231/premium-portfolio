import connectToDatabase from "@/lib/mongodb";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Capability from "@/models/Capability";
import Experience from "@/models/Experience";
import Testimonial from "@/models/Testimonial";
import SiteSettings from "@/models/SiteSettings";
import HeroSection from "@/components/public/HeroSection";
import IdentitySection from "@/components/public/IdentitySection";
import SelectedWork from "@/components/public/SelectedWork";
import CapabilitiesSection from "@/components/public/CapabilitiesSection";
import ExperienceSection from "@/components/public/ExperienceSection";
import TestimonialsSection from "@/components/public/TestimonialsSection";
import ContactSection from "@/components/public/ContactSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let profile = null;
  let projects = [];
  let capabilities = [];
  let experiences = [];
  let testimonials = [];
  let settings = null;

  try {
    await connectToDatabase();

    const [profileDoc, projectDocs, capabilityDocs, experienceDocs, testimonialDocs, settingsDoc] =
      await Promise.all([
        Profile.findOne().lean(),
        Project.find({ status: "published" }).sort({ order: 1 }).lean(),
        Capability.find({ visible: true }).sort({ order: 1 }).lean(),
        Experience.find({ visible: true }).sort({ order: 1 }).lean(),
        Testimonial.find({ visible: true }).sort({ order: 1 }).lean(),
        SiteSettings.findOne().lean(),
      ]);

    profile = profileDoc ? JSON.parse(JSON.stringify(profileDoc)) : null;
    projects = projectDocs ? JSON.parse(JSON.stringify(projectDocs)) : [];
    capabilities = capabilityDocs ? JSON.parse(JSON.stringify(capabilityDocs)) : [];
    experiences = experienceDocs ? JSON.parse(JSON.stringify(experienceDocs)) : [];
    testimonials = testimonialDocs ? JSON.parse(JSON.stringify(testimonialDocs)) : [];
    settings = settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null;
  } catch (error) {
    console.error("Database retrieval error in HomePage:", error);
  }

  return (
    <div className="flex flex-col w-full">
      {/* 1. Kinetic Hero */}
      <HeroSection profile={profile} />

      {/* 2. Identity / Philosophy */}
      <IdentitySection profile={profile} />

      {/* 3. Selected Work */}
      <SelectedWork projects={projects} />

      {/* 4. Capabilities Matrix */}
      <CapabilitiesSection capabilities={capabilities} />

      {/* 5. Experience Timeline */}
      <ExperienceSection experiences={experiences} />

      {/* 6. Testimonials (Auto-hides if empty) */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 7. Contact / Dispatch */}
      <ContactSection profile={profile} contactEmail={settings?.contactEmail} />
    </div>
  );
}

