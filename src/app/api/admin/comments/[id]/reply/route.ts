import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import BlogPost from "@/models/BlogPost";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getCurrentAdmin } from "@/lib/auth";

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
      return NextResponse.json({ error: "Reply content cannot be empty." }, { status: 400 });
    }

    await connectToDatabase();

    const parentComment = await Comment.findById(params.id).populate("postId", "title slug");
    if (!parentComment) {
      return NextResponse.json({ error: "Original comment not found." }, { status: 404 });
    }

    // Resolve an author id for the admin
    let adminUserId = admin.id;
    const existingUser = await User.findOne({ email: admin.email });
    if (existingUser) {
      adminUserId = existingUser._id.toString();
    } else {
      const anyUser = await User.findOne();
      if (anyUser) adminUserId = anyUser._id.toString();
    }

    const reply = await Comment.create({
      userId: adminUserId,
      postId: (parentComment.postId as any)._id,
      parentId: parentComment._id,
      content: content.trim(),
      status: "approved",
      isAdminReply: true,
      adminAuthorName: admin.name || "Architect",
    });

    const postTitle = (parentComment.postId as any)?.title || "Monograph";
    const postSlug = (parentComment.postId as any)?.slug || "";

    // Generate user notification
    if (parentComment.userId) {
      await Notification.create({
        recipientId: parentComment.userId,
        recipientRole: "user",
        type: "COMMENT_REPLY",
        title: "Editorial Reply to your Commentary",
        message: `${admin.name || "The Author"} replied to your commentary on "${postTitle}".`,
        link: `/blog/${postSlug}#comments`,
        relatedPostId: (parentComment.postId as any)._id,
        relatedCommentId: reply._id,
      });
    }

    return NextResponse.json({ success: true, item: reply }, { status: 201 });
  } catch (error: any) {
    console.error("Admin comment reply error:", error);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}

