import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import Comment from "@/models/Comment";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getCurrentUser, getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    await connectToDatabase();

    const post = await BlogPost.findOne({ slug });
    if (!post) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    const admin = await getCurrentAdmin();
    const currentUser = await getCurrentUser();

    // Query condition: public visitors only see approved comments.
    // Authors can see their own pending comments. Admins can see all.
    let statusFilter: any = { status: "approved" };
    if (admin) {
      statusFilter = { status: { $ne: "deleted" } };
    } else if (currentUser) {
      statusFilter = {
        $or: [
          { status: "approved" },
          { userId: currentUser.id, status: "pending" },
        ],
      };
    }

    const allComments = await Comment.find({
      postId: post._id,
      ...statusFilter,
    })
      .populate("userId", "name username avatarUrl")
      .sort({ createdAt: 1 })
      .lean();

    // Organize into roots and replies
    const roots: any[] = [];
    const repliesMap = new Map<string, any[]>();

    allComments.forEach((c: any) => {
      const item = {
        ...c,
        _id: c._id.toString(),
      };
      if (c.parentId) {
        const pId = c.parentId.toString();
        if (!repliesMap.has(pId)) {
          repliesMap.set(pId, []);
        }
        repliesMap.get(pId)!.push(item);
      } else {
        roots.push(item);
      }
    });

    roots.forEach((root) => {
      root.replies = repliesMap.get(root._id) || [];
    });

    return NextResponse.json({ comments: roots });
  } catch (error: any) {
    console.error("Fetch blog comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getCurrentUser();
    const adminSession = await getCurrentAdmin();

    if (!session && !adminSession) {
      return NextResponse.json(
        { error: "Authentication required to publish commentary." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Commentary content cannot be empty." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const post = await BlogPost.findOne({ slug: params.slug });
    if (!post) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    let userId = session?.id;
    let isAdminReply = false;
    let adminAuthorName = "";
    let status = "pending"; // Default moderation required

    if (adminSession) {
      isAdminReply = true;
      adminAuthorName = adminSession.name || "Architect";
      status = "approved"; // Admin comments auto-approved
      if (!userId) {
        // If admin is commenting directly via admin token, find or use first admin user id
        const anyUser = await User.findOne();
        userId = anyUser?._id.toString() || adminSession.id;
      }
    }

    const comment = await Comment.create({
      userId,
      postId: post._id,
      parentId: parentId || null,
      content: content.trim(),
      status,
      isAdminReply,
      adminAuthorName,
    });

    // If reply, notify the parent comment author
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (
        parentComment &&
        parentComment.userId.toString() !== userId?.toString()
      ) {
        await Notification.create({
          recipientId: parentComment.userId,
          recipientRole: "user",
          type: "COMMENT_REPLY",
          title: "Reply to your commentary",
          message: `${session?.name || "A member"} replied to your comment on "${post.title}".`,
          link: `/blog/${post.slug}#comments`,
          relatedPostId: post._id,
          relatedCommentId: comment._id,
        });
      }
    }

    // Notify admin about new comment
    if (!adminSession) {
      await Notification.create({
        recipientId: post._id, // placeholder for admin channel
        recipientRole: "admin",
        type: "COMMENT_REPLY",
        title: "New commentary submitted",
        message: `${session?.name} posted commentary on "${post.title}" requiring review.`,
        link: `/admin/comments`,
        relatedPostId: post._id,
        relatedCommentId: comment._id,
      });
    }

    return NextResponse.json(
      {
        success: true,
        status: comment.status,
        comment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Internal server error creating comment." },
      { status: 500 }
    );
  }
}

