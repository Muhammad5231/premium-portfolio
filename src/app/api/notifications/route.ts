import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    await connectToDatabase();

    const query: any = {
      recipientId: session.id,
      recipientRole: "user",
    };

    if (unreadOnly) {
      query.read = false;
    }

    if (type && type !== "ALL") {
      if (type === "COMMENTS") {
        query.type = { $in: ["COMMENT_REPLY", "COMMENT_APPROVED", "COMMENT_REJECTED"] };
      } else if (type === "MESSAGES") {
        query.type = { $in: ["MESSAGE_RECEIVED", "ADMIN_MESSAGE"] };
      } else if (type === "SYSTEM") {
        query.type = "SYSTEM";
      }
    }

    const [items, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({
        recipientId: session.id,
        recipientRole: "user",
        read: false,
      }),
    ]);

    return NextResponse.json({
      items: items.map((i: any) => ({ ...i, _id: i._id.toString() })),
      unreadCount,
    });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

