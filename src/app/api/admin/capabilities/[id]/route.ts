import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Capability from "@/models/Capability";
import { getCurrentAdmin } from "@/lib/auth";
import { capabilitySchema } from "@/lib/validations";

interface RouteProps {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
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
    const capability = await Capability.findByIdAndUpdate(params.id, validation.data, {
      new: true,
    });
    return NextResponse.json({ success: true, capability });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update capability" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    await Capability.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Capability deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete capability" }, { status: 500 });
  }
}

