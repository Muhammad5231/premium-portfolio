import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { getCurrentAdmin } from "@/lib/auth";
import { experienceSchema } from "@/lib/validations";

interface RouteProps {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = experienceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid experience parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const experience = await Experience.findByIdAndUpdate(params.id, validation.data, {
      new: true,
    });
    return NextResponse.json({ success: true, experience });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    await Experience.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Experience deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete experience" }, { status: 500 });
  }
}

