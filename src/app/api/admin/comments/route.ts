import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import User from "@/models/User";
import BlogPost from "@/models/BlogPost";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";

    await connectToDatabase();

    const query: any = {};
    if (status !== "all") {
      query.status = status;
    }

    const comments = await Comment.find(query)
      .populate("userId", "name email username avatarUrl")
      .populate("postId", "title slug")
      .sort({ createdAt: -1 })
      .lean();

    // Telemetry counts
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Comment.countDocuments({ status: "pending" }),
      Comment.countDocuments({ status: "approved" }),
      Comment.countDocuments({ status: "rejected" }),
    ]);

    return NextResponse.json({
      items: comments,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: comments.length,
      },
    });
  } catch (error: any) {
    console.error("Admin comments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

