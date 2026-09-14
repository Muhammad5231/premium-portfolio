import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Profile from "@/models/Profile";
import { getCurrentAdmin } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const profile = await Profile.findOne();
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid profile data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const profile = await Profile.findOneAndUpdate({}, validation.data, {
      new: true,
      upsert: true,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}

