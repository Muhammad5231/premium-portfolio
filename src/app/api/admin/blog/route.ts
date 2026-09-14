import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    await connectToDatabase();

    const query: any = {};
    if (status && status !== "all") query.status = status;
    if (category && category !== "all") query.category = category;
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }];
    }

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ items: posts });
  } catch (error: any) {
    console.error("Admin blog get error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
      featured,
      readingTime: customReadingTime,
      seoTitle,
      seoDescription,
      ogImage,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let slug = customSlug ? customSlug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") : "";
    if (!slug) {
      slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await BlogPost.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Estimate reading time: 200 words per min
    const wordCount = (content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    const readingTime = customReadingTime || Math.max(1, Math.ceil(wordCount / 200));

    const highestOrder = await BlogPost.findOne().sort({ order: -1 }).select("order").lean();
    const order = highestOrder?.order ? highestOrder.order + 1 : 1;

    const post = await BlogPost.create({
      title: title.trim(),
      slug: uniqueSlug,
      excerpt: excerpt ? excerpt.trim() : (content.slice(0, 160) + "..."),
      content,
      coverImage: coverImage || "",
      author: {
        name: admin.name || "Mohammad",
        avatar: "",
      },
      category: category || "Architecture",
      tags: Array.isArray(tags) ? tags : [],
      status: status || "draft",
      featured: Boolean(featured),
      readingTime,
      publishedAt: status === "published" ? new Date() : undefined,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      ogImage: ogImage || coverImage,
      order,
    });

    return NextResponse.json({ success: true, item: post }, { status: 201 });
  } catch (error: any) {
    console.error("Admin blog create error:", error);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}

