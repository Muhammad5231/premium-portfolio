import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import Comment from "@/models/Comment";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    await connectToDatabase();

    const post = await BlogPost.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!post) {
      return NextResponse.json(
        { error: "Article not found." },
        { status: 404 }
      );
    }

    // Related posts by category or tags
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      status: "published",
      $or: [
        { category: post.category },
        { tags: { $in: post.tags || [] } },
      ],
    })
      .select("title slug excerpt coverImage readingTime publishedAt category")
      .limit(3)
      .lean();

    const commentCount = await Comment.countDocuments({
      postId: post._id,
      status: "approved",
    });

    return NextResponse.json({
      post: {
        ...post,
        _id: post._id.toString(),
        commentCount,
      },
      relatedPosts: relatedPosts.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error("Public blog slug fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article." },
      { status: 500 }
    );
  }
}

