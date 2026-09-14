import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import NavigationItem from "@/models/NavigationItem";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  await connectToDatabase();
  const items = await NavigationItem.find().sort({ order: 1 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    await connectToDatabase();
    const item = await NavigationItem.create(body);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create nav item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items } = await req.json();
    await connectToDatabase();

    // Bulk replace or update navigation order
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item._id) {
          await NavigationItem.findByIdAndUpdate(item._id, item);
        }
      }
    }

    const updated = await NavigationItem.find().sort({ order: 1 });
    return NextResponse.json({ success: true, items: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update navigation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await connectToDatabase();
    await NavigationItem.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Nav item deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete nav item" }, { status: 500 });
  }
}

