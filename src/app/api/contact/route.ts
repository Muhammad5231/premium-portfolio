import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import ConversationMessage from "@/models/ConversationMessage";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getCurrentUser, getCurrentAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const adminSession = await getCurrentAdmin();

    if (!session && !adminSession) {
      return NextResponse.json(
        { error: "Please sign in to send a commission inquiry or message." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subject, message, honeypot } = body;

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Message received" });
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Scope of work / brief cannot be empty." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let userId = session?.id;
    let userName = session?.name || "Member";
    let userEmail = session?.email || "user@domain.com";

    if (!userId && adminSession) {
      const anyUser = await User.findOne();
      userId = anyUser?._id.toString() || adminSession.id;
      userName = adminSession.name;
      userEmail = adminSession.email;
    }

    const cleanSubject = (subject || "Commission Inquiry").trim();

    // 1. Create Conversation
    const conversation = await Conversation.create({
      user: userId,
      subject: cleanSubject,
      status: "OPEN",
      lastMessageAt: new Date(),
      unreadByUser: false,
      unreadByAdmin: true,
    });

    // 2. Create first Message in thread
    const convMsg = await ConversationMessage.create({
      conversationId: conversation._id,
      senderId: userId,
      senderRole: "user",
      content: message.trim(),
      read: false,
    });

    // 3. Create Notification for Admin
    await Notification.create({
      recipientId: conversation._id, // Admin inbox
      recipientRole: "admin",
      type: "MESSAGE_RECEIVED",
      title: "New Commission Dialogue",
      message: `${userName} initiated dialogue: "${cleanSubject}".`,
      link: `/admin/messages/${conversation._id}`,
      relatedConversationId: conversation._id,
    });

    // 4. Also store in legacy Message collection for backward compatibility
    await Message.create({
      name: userName,
      email: userEmail,
      subject: cleanSubject,
      message: message.trim(),
      status: "unread",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transmission received and dialogue established.",
        conversationId: conversation._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Unable to log message. Please try again." },
      { status: 500 }
    );
  }
}
