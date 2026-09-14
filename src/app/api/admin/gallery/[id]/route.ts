import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import GalleryItem from "@/models/GalleryItem";
import { getCurrentAdmin } from "@/lib/auth";
import { galleryItemSchema } from "@/lib/validations";

interface RouteProps {
  params: { id: string };
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const item = await GalleryItem.findById(params.id).lean();
    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve gallery item" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = galleryItemSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid gallery parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const data: any = { ...validation.data };

    if (data.slug) {
      data.slug = generateSlug(data.slug);
      // Ensure slug uniqueness against other records
      const existing = await GalleryItem.findOne({
        slug: data.slug,
        _id: { $ne: params.id },
      });
      if (existing) {
        data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await GalleryItem.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("Error updating gallery item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const deleted = await GalleryItem.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Gallery plate deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}

