import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import BlogCategory from "@/models/BlogCategory";
import BlogPost from "@/models/BlogPost";

export async function GET() {
  try {
    await connectToDatabase();

    const categories = await BlogCategory.find({ visible: true })
      .sort({ order: 1 })
      .lean();

    // Attach post counts
    const postCounts = await BlogPost.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    postCounts.forEach((c) => {
      countMap.set(c._id, c.count);
    });

    const items = categories.map((cat: any) => ({
      ...cat,
      _id: cat._id.toString(),
      count: countMap.get(cat.name) || 0,
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Public blog categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

