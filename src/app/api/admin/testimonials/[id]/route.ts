import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Testimonial from "@/models/Testimonial";
import { getCurrentAdmin } from "@/lib/auth";
import { testimonialSchema } from "@/lib/validations";

interface RouteProps {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validation = testimonialSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid testimonial parameters" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const testimonial = await Testimonial.findByIdAndUpdate(params.id, validation.data, {
      new: true,
    });
    return NextResponse.json({ success: true, testimonial });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update testimonial" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectToDatabase();
    await Testimonial.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: "Testimonial deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}

