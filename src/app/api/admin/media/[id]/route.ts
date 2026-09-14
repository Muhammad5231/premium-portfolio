import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import connectToDatabase from "@/lib/mongodb";
import Media from "@/models/Media";
import { getCurrentAdmin } from "@/lib/auth";

interface RouteProps {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    const media = await Media.findById(params.id);
    if (!media) return NextResponse.json({ error: "Media record not found" }, { status: 404 });

    // Try deleting physical file if local
    if (media.filename) {
      const filePath = path.join(process.cwd(), "public", "uploads", media.filename);
      await unlink(filePath).catch(() => {});
    }

    await Media.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Media deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}

