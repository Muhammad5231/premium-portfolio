import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import ConversationMessage from "@/models/ConversationMessage";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const conversations = await Conversation.find({ user: session.id })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach latest snippet for each conversation
    const convIds = conversations.map((c) => c._id);
    const latestMessages = await ConversationMessage.aggregate([
      { $match: { conversationId: { $in: convIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          content: { $first: "$content" },
          senderRole: { $first: "$senderRole" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]);

    const snippetMap = new Map<string, any>();
    latestMessages.forEach((m) => {
      snippetMap.set(m._id.toString(), m);
    });

    const items = conversations.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      lastSnippet: snippetMap.get(c._id.toString())?.content || "",
      lastSenderRole: snippetMap.get(c._id.toString())?.senderRole || "user",
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("User messages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

