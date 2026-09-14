import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import GalleryItem from "@/models/GalleryItem";
import { getCurrentAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Expected an array of items with { id, order }" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const bulkOps = items.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await GalleryItem.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, message: "Gallery plates reordered successfully" });
  } catch (error: any) {
    console.error("Error reordering gallery items:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reorder gallery items" },
      { status: 500 }
    );
  }
}

