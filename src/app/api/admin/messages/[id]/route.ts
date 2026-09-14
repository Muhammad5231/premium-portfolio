import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import ConversationMessage from "@/models/ConversationMessage";
import Notification from "@/models/Notification";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(params.id)
      .populate("user", "name email username avatarUrl")
      .lean();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Mark as read by admin
    await Conversation.findByIdAndUpdate(params.id, { unreadByAdmin: false });

    const messages = await ConversationMessage.find({
      conversationId: params.id,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      conversation: {
        ...conversation,
        _id: conversation._id.toString(),
      },
      messages: messages.map((m: any) => ({
        ...m,
        _id: m._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error("Admin conversation GET error:", error);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Reply content cannot be empty" }, { status: 400 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findById(params.id).populate("user", "name email");
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    conversation.lastMessageAt = new Date();
    conversation.unreadByUser = true;
    await conversation.save();

    const newMsg = await ConversationMessage.create({
      conversationId: conversation._id,
      senderId: admin.id,
      senderRole: "admin",
      content: content.trim(),
      read: false,
    });

    // Generate ADMIN_MESSAGE notification for the user
    if (conversation.user) {
      const recipientId = (conversation.user as any)._id || conversation.user;
      await Notification.create({
        recipientId,
        recipientRole: "user",
        type: "ADMIN_MESSAGE",
        title: "New Dispatch from Administration",
        message: `${admin.name || "Administration"} replied to your inquiry: "${conversation.subject}".`,
        link: `/messages/${conversation._id}`,
        relatedConversationId: conversation._id,
      });
    }

    return NextResponse.json({ success: true, message: newMsg }, { status: 201 });
  } catch (error: any) {
    console.error("Admin conversation reply error:", error);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    await ConversationMessage.deleteMany({ conversationId: params.id });
    await Conversation.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: "Conversation purged" });
  } catch (error: any) {
    console.error("Admin conversation DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
