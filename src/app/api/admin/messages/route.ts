import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import ConversationMessage from "@/models/ConversationMessage";
import User from "@/models/User";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search");

  const query: any = {};
  if (status && status !== "all") {
    query.status = status.toUpperCase();
  }

  const conversations = await Conversation.find(query)
    .populate("user", "name email username avatarUrl")
    .sort({ lastMessageAt: -1 })
    .lean();

  // Attach latest message snippet
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

  let items = conversations.map((c: any) => ({
    ...c,
    _id: c._id.toString(),
    lastSnippet: snippetMap.get(c._id.toString())?.content || "",
    lastSenderRole: snippetMap.get(c._id.toString())?.senderRole || "user",
  }));

  // Client search filter across user name, email, or subject
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (c) =>
        c.subject?.toLowerCase().includes(q) ||
        c.user?.name?.toLowerCase().includes(q) ||
        c.user?.email?.toLowerCase().includes(q) ||
        c.lastSnippet?.toLowerCase().includes(q)
    );
  }

  const unreadCount = await Conversation.countDocuments({ unreadByAdmin: true });

  return NextResponse.json({ conversations: items, unreadCount });
}
