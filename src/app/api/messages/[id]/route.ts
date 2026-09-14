import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import ConversationMessage from "@/models/ConversationMessage";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findOne({
      _id: params.id,
      user: session.id,
    }).lean();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Mark as read by user
    await Conversation.findByIdAndUpdate(params.id, { unreadByUser: false });

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
    console.error("User conversation GET error:", error);
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    await connectToDatabase();

    const conversation = await Conversation.findOne({
      _id: params.id,
      user: session.id,
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    if (conversation.status === "CLOSED" || conversation.status === "ARCHIVED") {
      conversation.status = "OPEN"; // Automatically reopen on user reply
    }

    conversation.lastMessageAt = new Date();
    conversation.unreadByAdmin = true;
    await conversation.save();

    const newMsg = await ConversationMessage.create({
      conversationId: conversation._id,
      senderId: session.id,
      senderRole: "user",
      content: content.trim(),
      read: false,
    });

    // Notify Admin
    await Notification.create({
      recipientId: conversation._id,
      recipientRole: "admin",
      type: "MESSAGE_RECEIVED",
      title: "New Dialogue Reply",
      message: `${session.name} replied in thread: "${conversation.subject}".`,
      link: `/admin/messages/${conversation._id}`,
      relatedConversationId: conversation._id,
    });

    return NextResponse.json({ success: true, message: newMsg }, { status: 201 });
  } catch (error: any) {
    console.error("User message reply error:", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}

