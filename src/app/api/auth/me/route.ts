import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Conversation from "@/models/Conversation";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    await connectToDatabase();
    const user = await User.findById(session.id)
      .select("-passwordHash")
      .lean();

    if (!user || user.status === "suspended") {
      return NextResponse.json({ user: null });
    }

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      recipientId: user._id,
      read: false,
    });

    // Get unread conversations count
    const unreadMessages = await Conversation.countDocuments({
      user: user._id,
      unreadByUser: true,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
      },
      unreadNotifications,
      unreadMessages,
    });
  } catch (error: any) {
    console.error("Fetch current user error:", error);
    return NextResponse.json({ user: null });
  }
}

