import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogCategory from "@/models/BlogCategory";
import { getCurrentAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const cat = await BlogCategory.findById(params.id);
    if (!cat) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (body.name) cat.name = body.name.trim();
    if (body.description !== undefined) cat.description = body.description;
    if (body.image !== undefined) cat.image = body.image;
    if (body.order !== undefined) cat.order = Number(body.order);
    if (body.visible !== undefined) cat.visible = Boolean(body.visible);

    if (body.slug && body.slug !== cat.slug) {
      const cleanSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
      const existing = await BlogCategory.findOne({
        slug: cleanSlug,
        _id: { $ne: cat._id },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
      }
      cat.slug = cleanSlug;
    }

    await cat.save();

    return NextResponse.json({ success: true, item: cat });
  } catch (error: any) {
    console.error("Admin categories PUT error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await BlogCategory.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("Admin categories DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

