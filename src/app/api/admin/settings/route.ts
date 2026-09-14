import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import { getCurrentAdmin } from "@/lib/auth";
import { siteSettingsSchema } from "@/lib/validations";

export async function GET() {
  await connectToDatabase();
  const settings = await SiteSettings.findOne();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = siteSettingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid settings data" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const settings = await SiteSettings.findOneAndUpdate({}, validation.data, {
      new: true,
      upsert: true,
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}

