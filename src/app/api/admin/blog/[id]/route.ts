import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const post = await BlogPost.findById(params.id).lean();
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ item: post });
  } catch (error: any) {
    console.error("Admin blog get single error:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

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
    await connectToDatabase();

    const post = await BlogPost.findById(params.id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (body.title) post.title = body.title.trim();
    if (body.excerpt !== undefined) post.excerpt = body.excerpt.trim();
    if (body.content) {
      post.content = body.content;
      const wordCount = body.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
      post.readingTime = body.readingTime || Math.max(1, Math.ceil(wordCount / 200));
    }
    if (body.coverImage !== undefined) post.coverImage = body.coverImage;
    if (body.category) post.category = body.category;
    if (body.tags) post.tags = body.tags;
    if (body.featured !== undefined) post.featured = Boolean(body.featured);
    if (body.order !== undefined) post.order = Number(body.order);
    if (body.seoTitle !== undefined) post.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) post.seoDescription = body.seoDescription;
    if (body.ogImage !== undefined) post.ogImage = body.ogImage;

    if (body.status && body.status !== post.status) {
      post.status = body.status;
      if (body.status === "published" && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    if (body.slug && body.slug !== post.slug) {
      const cleanSlug = body.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
      const existing = await BlogPost.findOne({
        slug: cleanSlug,
        _id: { $ne: post._id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Slug is already used by another article." },
          { status: 409 }
        );
      }
      post.slug = cleanSlug;
    }

    await post.save();

    return NextResponse.json({ success: true, item: post });
  } catch (error: any) {
    console.error("Admin blog update error:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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
    const deleted = await BlogPost.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Article deleted successfully." });
  } catch (error: any) {
    console.error("Admin blog delete error:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

