import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Comment from "@/models/Comment";
import BlogPost from "@/models/BlogPost";
import Notification from "@/models/Notification";
import { getCurrentAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "approved", "rejected", "deleted"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    await connectToDatabase();
    const comment = await Comment.findById(params.id).populate("postId", "title slug");
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const previousStatus = comment.status;
    comment.status = status;
    await comment.save();

    // Send user notification when status changes to approved or rejected
    if (previousStatus !== status && comment.userId) {
      const postTitle = (comment.postId as any)?.title || "Monograph";
      const postSlug = (comment.postId as any)?.slug || "";

      if (status === "approved") {
        await Notification.create({
          recipientId: comment.userId,
          recipientRole: "user",
          type: "COMMENT_APPROVED",
          title: "Commentary Approved",
          message: `Your commentary on "${postTitle}" has been approved and published to the archive.`,
          link: `/blog/${postSlug}#comments`,
          relatedPostId: comment.postId,
          relatedCommentId: comment._id,
        });
      } else if (status === "rejected") {
        await Notification.create({
          recipientId: comment.userId,
          recipientRole: "user",
          type: "COMMENT_REJECTED",
          title: "Commentary Moderated",
          message: `Your submission on "${postTitle}" was declined under community editorial guidelines.`,
          link: `/blog/${postSlug}`,
          relatedPostId: comment.postId,
          relatedCommentId: comment._id,
        });
      }
    }

    return NextResponse.json({ success: true, item: comment });
  } catch (error: any) {
    console.error("Admin comment status update error:", error);
    return NextResponse.json({ error: "Failed to update comment status" }, { status: 500 });
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
    await Comment.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: "Comment purged." });
  } catch (error: any) {
    console.error("Admin comment delete error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

