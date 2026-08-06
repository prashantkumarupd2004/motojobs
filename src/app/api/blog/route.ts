import { NextRequest, NextResponse } from "next/server";
import { getPostBySlug, listPosts } from "@/lib/blog-db";

export const dynamic = "force-dynamic";

/** Public blog feed. `?slug=` returns a single published post. */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (slug) {
    const post = await getPostBySlug(slug);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post });
  }

  const posts = await listPosts();
  return NextResponse.json({ posts, categories: [...new Set(posts.map((p) => p.category))] });
}
