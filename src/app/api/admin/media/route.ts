import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import connectToDatabase from "@/lib/mongodb";
import Media from "@/models/Media";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const search = req.nextUrl.searchParams.get("search");

  const query: any = {};
  if (search) {
    query.$or = [
      { originalName: { $regex: search, $options: "i" } },
      { filename: { $regex: search, $options: "i" } },
      { mimeType: { $regex: search, $options: "i" } },
    ];
  }

  const media = await Media.find(query).sort({ createdAt: -1 });
  return NextResponse.json({ media });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate size (e.g. max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds maximum permitted size (15MB)" }, { status: 400 });
    }

    // Validate MIME type against security whitelist
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
      "application/pdf",
      "video/mp4",
      "video/webm",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported media format (${file.type}). Allowed formats: JPEG, PNG, WebP, SVG, GIF, AVIF, PDF, MP4, WebM.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `${Date.now()}-${baseName}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    await connectToDatabase();
    const mediaDoc = await Media.create({
      filename: uniqueFilename,
      originalName: file.name,
      url: publicUrl,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });

    return NextResponse.json({ success: true, media: mediaDoc }, { status: 201 });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json({ error: error.message || "File upload failed" }, { status: 500 });
  }
}

