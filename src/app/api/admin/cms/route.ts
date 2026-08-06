import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  auditAdmin,
  badRequest,
  notFound,
  requireAdmin,
  serverError,
  unpackBlocks,
  zodResponse,
} from "@/lib/admin";

/**
 * CMS copy for the marketing pages. `blocks` is a JSON object whose shape
 * depends on the page key, so a new hero field or FAQ entry needs no migration.
 *
 * The public pages fall back to their hard-coded copy when a row is missing or
 * unpublished, so a broken edit degrades rather than blanking the site.
 */

const KEYS = ["HOME", "ABOUT", "CONTACT", "PRIVACY", "TERMS", "FAQ", "FOOTER"] as const;

const updateSchema = z.object({
  key: z.enum(KEYS),
  title: z.string().trim().min(1, "Enter a title").max(160).optional(),
  /// Free-form per page; validated as an object, not against a fixed shape.
  blocks: z.record(z.string(), z.unknown()).optional(),
  seoTitle: z.string().trim().max(200).nullish(),
  seoDescription: z.string().trim().max(400).nullish(),
  isPublished: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const key = new URL(req.url).searchParams.get("key");

    if (key) {
      const page = await prisma.cmsPage.findUnique({ where: { key } });
      if (!page) return notFound("Page not found");
      return NextResponse.json({ page: { ...page, blocks: unpackBlocks(page.blocks) } });
    }

    const pages = await prisma.cmsPage.findMany({
      orderBy: { key: "asc" },
      select: {
        id: true,
        key: true,
        title: true,
        isPublished: true,
        updatedAt: true,
      },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    return serverError("load CMS pages", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { key, blocks, ...fields } = parsed.data;

    const existing = await prisma.cmsPage.findUnique({ where: { key }, select: { id: true } });
    if (!existing) return notFound("Page not found");

    const page = await prisma.cmsPage.update({
      where: { key },
      data: {
        ...fields,
        ...(blocks ? { blocks: JSON.stringify(blocks) } : {}),
        updatedById: auth.user.userId,
        ...(fields.isPublished ? { publishedAt: new Date() } : {}),
      },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "CMS_PAGE_UPDATED",
      entityType: "cms_pages",
      entityId: page.id,
      metadata: { key },
    });

    return NextResponse.json({ page: { ...page, blocks: unpackBlocks(page.blocks) } });
  } catch (error) {
    return serverError("save this page", error);
  }
}
