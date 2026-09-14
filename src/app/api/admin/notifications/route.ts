import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const [items, unreadCount] = await Promise.all([
      Notification.find({ recipientRole: "admin" })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Notification.countDocuments({ recipientRole: "admin", read: false }),
    ]);

    return NextResponse.json({ items, unreadCount });
  } catch (error: any) {
    console.error("Admin notifications GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await Notification.updateMany(
      { recipientRole: "admin", read: false },
      { read: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true, unreadCount: 0 });
  } catch (error: any) {
    console.error("Admin mark all read error:", error);
    return NextResponse.json({ error: "Failed to mark all read" }, { status: 500 });
  }
}

