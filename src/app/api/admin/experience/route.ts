import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Experience from "@/models/Experience";
import { getCurrentAdmin } from "@/lib/auth";
import { experienceSchema } from "@/lib/validations";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const experiences = await Experience.find().sort({ order: 1 });
  return NextResponse.json({ experiences });
}

export async function POST(req: NextRequest) {
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
    const experience = await Experience.create(validation.data);
    return NextResponse.json({ success: true, experience }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create experience" }, { status: 500 });
  }
}

