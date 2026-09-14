import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import Comment from "@/models/Comment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10);
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = { status: "published" };

    if (category && category !== "All") {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ featured: -1, publishedAt: -1, order: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    // Attach approved comment count for each post
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds }, status: "approved" } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    commentCounts.forEach((c) => {
      countMap.set(c._id.toString(), c.count);
    });

    const items = posts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
      commentCount: countMap.get(post._id.toString()) || 0,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Public blog query error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts." },
      { status: 500 }
    );
  }
}

