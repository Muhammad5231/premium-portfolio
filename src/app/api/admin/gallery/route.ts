import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import GalleryItem from "@/models/GalleryItem";
import { getCurrentAdmin } from "@/lib/auth";
import { galleryItemSchema } from "@/lib/validations";

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const status = searchParams.get("status")?.trim(); // 'published' | 'draft' | 'all'
    const featured = searchParams.get("featured");

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (status === "published") {
      query.published = true;
    } else if (status === "draft") {
      query.published = false;
    }

    if (featured === "true") {
      query.featured = true;
    } else if (featured === "false") {
      query.featured = false;
    }

    const items = await GalleryItem.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ items, total: items.length });
  } catch (error: any) {
    console.error("Error fetching gallery items:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch gallery items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = galleryItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid gallery item input" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const data = { ...validation.data };

    // Auto-generate slug if missing
    let baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    if (!baseSlug) baseSlug = "plate";

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (await GalleryItem.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    data.slug = finalSlug;

    // Determine default order if not provided
    if (data.order === 0) {
      const highestOrderItem = await GalleryItem.findOne().sort({ order: -1 }).lean();
      data.order = highestOrderItem && highestOrderItem.order ? highestOrderItem.order + 1 : 1;
    }

    const item = await GalleryItem.create(data);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gallery item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create gallery item" },
      { status: 500 }
    );
  }
}

