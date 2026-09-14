import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    await Notification.updateMany(
      { recipientId: session.id, recipientRole: "user", read: false },
      { read: true, readAt: new Date() }
    );

    return NextResponse.json({ success: true, unreadCount: 0 });
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
  }
}

