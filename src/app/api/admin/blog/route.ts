import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/validation/company";
import {
  auditAdmin,
  badRequest,
  notFound,
  packList,
  paging,
  requireAdmin,
  serverError,
  unpackList,
  zodResponse,
} from "@/lib/admin";

/**
 * Blog posts. `src/lib/blog.ts` still serves the public pages from a static
 * array; rows created here take over once they exist, which is why this route
 * writes the same fields those pages already render.
 */

const bodySchema = {
  title: z.string().trim().min(3, "Enter a title").max(200),
  slug: z.string().trim().max(120).optional(),
  excerpt: z.string().trim().max(500).nullish(),
  body: z.string().trim().min(1, "Write the post body"),
  category: z.string().trim().max(80).nullish(),
  tags: z.array(z.string().trim().max(40)).max(20).optional(),
  coverImage: z.string().trim().max(300).nullish(),
  authorName: z.string().trim().max(120).nullish(),
  seoTitle: z.string().trim().max(200).nullish(),
  seoDescription: z.string().trim().max(400).nullish(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  readMinutes: z.coerce.number().int().min(1).max(120).optional(),
};

const createSchema = z.object(bodySchema);
const updateSchema = z.object({ id: z.string().trim().min(1), ...bodySchema }).partial({
  title: true,
  body: true,
});

async function uniqueSlug(title: string, explicit: string | undefined, excludeId: string) {
  const base = slugify(explicit || title) || "post";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken || taken.id === excludeId) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Rough reading time at 200 words per minute, used when none is given. */
function estimateReadMinutes(body: string) {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const id = params.get("id");

    if (id) {
      const post = await prisma.blogPost.findUnique({ where: { id } });
      if (!post) return notFound("Post not found");
      return NextResponse.json({ post: { ...post, tags: unpackList(post.tags) } });
    }

    const { page, limit, skip } = paging(req);
    const search = params.get("search")?.trim() ?? "";
    const status = params.get("status") ?? "";
    const category = params.get("category") ?? "";

    const where: Record<string, unknown> = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status) where.status = status;
    if (category) where.category = category;

    const [posts, total, categories] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          status: true,
          views: true,
          readMinutes: true,
          publishedAt: true,
          updatedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where: { category: { not: null } },
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" },
      }),
    ]);

    return NextResponse.json({
      posts,
      categories: categories.map((c) => c.category).filter(Boolean),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load blog posts", error);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { tags, slug, status, readMinutes, ...fields } = parsed.data;

    const post = await prisma.blogPost.create({
      data: {
        ...fields,
        slug: await uniqueSlug(fields.title, slug, ""),
        tags: packList(tags),
        status: status ?? "DRAFT",
        readMinutes: readMinutes ?? estimateReadMinutes(fields.body),
        authorId: auth.user.userId,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "BLOG_CREATED",
      entityType: "blogs",
      entityId: post.id,
      metadata: { title: post.title },
    });

    return NextResponse.json({ post: { ...post, tags: unpackList(post.tags) } }, { status: 201 });
  } catch (error) {
    return serverError("create this post", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, tags, slug, status, readMinutes, ...fields } = parsed.data;

    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true, status: true, publishedAt: true },
    });
    if (!existing) return notFound("Post not found");

    const title = fields.title ?? existing.title;
    const slugChanged = slug !== undefined && slugify(slug) !== existing.slug;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...fields,
        ...(tags ? { tags: packList(tags) } : {}),
        ...(status ? { status } : {}),
        ...(readMinutes ? { readMinutes } : {}),
        ...(slugChanged ? { slug: await uniqueSlug(title, slug, id) } : {}),
        // Stamped on first publish only, so re-publishing an edit does not
        // reorder the public listing.
        ...(status === "PUBLISHED" && !existing.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "BLOG_UPDATED",
      entityType: "blogs",
      entityId: id,
    });

    return NextResponse.json({ post: { ...post, tags: unpackList(post.tags) } });
  } catch (error) {
    return serverError("save this post", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("A post id is required");

    const post = await prisma.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (!post) return notFound("Post not found");

    await prisma.blogPost.delete({ where: { id } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "BLOG_DELETED",
      entityType: "blogs",
      entityId: id,
      metadata: { title: post.title },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this post", error);
  }
}
