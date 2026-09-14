import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const notif = await Notification.findOneAndUpdate(
      { _id: params.id, recipientId: session.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: session.id,
      recipientRole: "user",
      read: false,
    });

    return NextResponse.json({ success: true, notification: notif, unreadCount });
  } catch (error: any) {
    console.error("Mark notification read error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}

