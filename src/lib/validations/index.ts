import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Valid email required"),
  subject: z.string().min(2, "Subject is required").max(120).default("Project Inquiry"),
  message: z.string().min(10, "Message should be at least 10 characters").max(5000),
  honeypot: z.string().optional(), // Anti-spam field: should remain empty
});

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().optional().default(""),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  year: z.union([z.string(), z.number()]).default(() => new Date().getFullYear()),
  client: z.string().optional().default(""),
  role: z.string().min(1, "Role is required"),
  featured: z.boolean().default(false),
  status: z.enum(["published", "draft", "archived"]).default("draft"),
  thumbnail: z.string().min(1, "Thumbnail URL or image is required"),
  heroMedia: z.string().optional().default(""),
  gallery: z.array(z.string()).default([]),
  videoUrl: z.string().optional().default(""),
  liveUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  challenge: z.string().optional().default(""),
  approach: z.string().optional().default(""),
  solution: z.string().optional().default(""),
  results: z.string().optional().default(""),
  technologies: z.array(z.string()).default([]),
  order: z.number().default(0),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().default("Remote"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().default(""),
  current: z.boolean().default(false),
  description: z.string().optional().default(""),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  website: z.string().optional().default(""),
  logo: z.string().optional().default(""),
  order: z.number().default(0),
  visible: z.boolean().default(true),
});

export const capabilitySchema = z.object({
  category: z.string().min(1, "Category is required"),
  subtitle: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Item title required"),
        description: z.string().optional().default(""),
        tags: z.array(z.string()).optional().default([]),
      })
    )
    .default([]),
  order: z.number().default(0),
  visible: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  person: z.string().min(1, "Person name is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  quote: z.string().min(5, "Quote is required"),
  image: z.string().optional().default(""),
  companyLogo: z.string().optional().default(""),
  order: z.number().default(0),
  visible: z.boolean().default(true),
});

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().min(1, "Headline is required"),
  subheadline: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  personalStatement: z.string().optional().default(""),
  whatIDo: z.array(z.string()).default([]),
  howIWork: z.array(z.string()).default([]),
  whatIValue: z.array(z.string()).default([]),
  avatarUrl: z.string().optional().default(""),
  location: z.string().default("Worldwide"),
  availability: z.object({
    status: z.enum(["available", "limited", "unavailable"]).default("available"),
    message: z.string().default("Available for select design & engineering work"),
  }),
  email: z.string().email("Valid email required"),
  resumeUrl: z.string().optional().default(""),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string(),
        icon: z.string().optional(),
      })
    )
    .default([]),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  logoText: z.string().optional().default("PORTFOLIO"),
  contactEmail: z.string().email("Valid email required"),
  seoTitle: z.string().min(1, "SEO title is required"),
  seoDescription: z.string().min(1, "SEO description is required"),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional().default(""),
  footerStatement: z.string().optional().default(""),
  copyrightText: z.string().optional().default(""),
  maintenanceMode: z.boolean().default(false),
  analyticsId: z.string().optional().default(""),
});

export const galleryItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional().default(""),
  description: z.string().optional().default(""),
  image: z.string().min(1, "Image is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().default(0),
});


