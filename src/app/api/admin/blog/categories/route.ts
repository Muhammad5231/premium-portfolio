import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogCategory from "@/models/BlogCategory";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const categories = await BlogCategory.find().sort({ order: 1 }).lean();
    return NextResponse.json({ items: categories });
  } catch (error: any) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, image, order, visible } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const categorySlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-")
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const existing = await BlogCategory.findOne({ slug: categorySlug });
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
    }

    const newCat = await BlogCategory.create({
      name: name.trim(),
      slug: categorySlug,
      description: description || "",
      image: image || "",
      order: order !== undefined ? Number(order) : 0,
      visible: visible !== undefined ? Boolean(visible) : true,
    });

    return NextResponse.json({ success: true, item: newCat }, { status: 201 });
  } catch (error: any) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

