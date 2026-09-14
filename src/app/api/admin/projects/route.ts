import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import { getCurrentAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const query: any = {};
  if (status && status !== "all") {
    query.status = status;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { client: { $regex: search, $options: "i" } },
    ];
  }

  const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid project data" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check slug uniqueness
    const existing = await Project.findOne({ slug: validation.data.slug });
    if (existing) {
      return NextResponse.json({ error: "A project with this slug already exists" }, { status: 400 });
    }

    const project = await Project.create({
      ...validation.data,
      publishedAt: validation.data.status === "published" ? new Date() : undefined,
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}

