import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Project from "@/models/Project";
import { getCurrentAdmin } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

interface RouteProps {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const project = await Project.findById(params.id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
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

    // Check slug uniqueness excluding self
    const existing = await Project.findOne({
      slug: validation.data.slug,
      _id: { $ne: params.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Another project with this slug already exists" }, { status: 400 });
    }

    const currentDoc = await Project.findById(params.id);
    if (!currentDoc) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedData: any = { ...validation.data };
    if (validation.data.status === "published" && !currentDoc.publishedAt) {
      updatedData.publishedAt = new Date();
    }

    const project = await Project.findByIdAndUpdate(params.id, updatedData, { new: true });
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    await Project.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}

