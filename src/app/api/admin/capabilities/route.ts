import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Capability from "@/models/Capability";
import { getCurrentAdmin } from "@/lib/auth";
import { capabilitySchema } from "@/lib/validations";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const capabilities = await Capability.find().sort({ order: 1 });
  return NextResponse.json({ capabilities });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = capabilitySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid capability parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const capability = await Capability.create(validation.data);
    return NextResponse.json({ success: true, capability }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create capability" }, { status: 500 });
  }
}

