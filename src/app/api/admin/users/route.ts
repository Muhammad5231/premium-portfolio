import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Comment from "@/models/Comment";
import Conversation from "@/models/Conversation";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    await connectToDatabase();

    const query: any = {};
    if (status !== "all") {
      query.status = status;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }, { username: regex }];
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((u) => u._id);

    // Aggregate comment counts and conversation counts
    const [commentCounts, conversationCounts] = await Promise.all([
      Comment.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]),
      Conversation.aggregate([
        { $match: { user: { $in: userIds } } },
        { $group: { _id: "$user", count: { $sum: 1 } } },
      ]),
    ]);

    const commentMap = new Map<string, number>();
    commentCounts.forEach((c) => commentMap.set(c._id.toString(), c.count));

    const convMap = new Map<string, number>();
    conversationCounts.forEach((c) => convMap.set(c._id.toString(), c.count));

    const items = users.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
      commentsCount: commentMap.get(u._id.toString()) || 0,
      conversationsCount: convMap.get(u._id.toString()) || 0,
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

