import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  auditAdmin,
  badRequest,
  notFound,
  requireAdmin,
  serverError,
  zodResponse,
} from "@/lib/admin";

/**
 * CRUD for every flat admin-managed list, discriminated by `kind`. Four
 * near-identical routes would be four places to forget the admin guard.
 *
 * `value` is what jobs and profiles persist, so it is settable on create and
 * frozen thereafter — renaming it would orphan every row already referencing it.
 * `label` is free to change.
 */

const KINDS = [
  "JOB_CATEGORY",
  "INDUSTRY",
  "EXPERIENCE_LEVEL",
  "EMPLOYMENT_TYPE",
  "SKILL",
  "QUALIFICATION",
] as const;

const createSchema = z.object({
  kind: z.enum(KINDS),
  label: z.string().trim().min(1, "Enter a name").max(120),
  /// Defaults to `label` when omitted, which is right for every list but
  /// JOB_CATEGORY, whose values are short slugs.
  value: z.string().trim().max(120).optional(),
  group: z.string().trim().max(60).optional(),
  blurb: z.string().trim().max(300).optional(),
});

const updateSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1, "Enter a name").max(120).optional(),
  group: z.string().trim().max(60).nullish(),
  blurb: z.string().trim().max(300).nullish(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const kind = params.get("kind");
    if (!kind || !KINDS.includes(kind as (typeof KINDS)[number])) {
      return badRequest("A valid kind is required");
    }

    const search = params.get("search")?.trim() ?? "";
    const group = params.get("group") ?? "";

    const where: Record<string, unknown> = { kind };
    if (search) where.label = { contains: search, mode: "insensitive" };
    if (group) where.group = group;

    const [items, groups] = await Promise.all([
      prisma.taxonomy.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      }),
      // Distinct groups for the filter, e.g. skill categories.
      prisma.taxonomy.findMany({
        where: { kind, group: { not: null } },
        distinct: ["group"],
        select: { group: true },
        orderBy: { group: "asc" },
      }),
    ]);

    return NextResponse.json({
      items,
      total: items.length,
      groups: groups.map((g) => g.group).filter(Boolean),
    });
  } catch (error) {
    return serverError("load this list", error);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { kind, label, group, blurb } = parsed.data;
    const value = parsed.data.value?.trim() || label;

    const clash = await prisma.taxonomy.findUnique({
      where: { kind_value: { kind, value } },
      select: { id: true },
    });
    if (clash) return badRequest("That entry already exists", { label: "Already in the list" });

    const last = await prisma.taxonomy.findFirst({
      where: { kind },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const item = await prisma.taxonomy.create({
      data: {
        kind,
        value,
        label,
        group: group ?? null,
        blurb: blurb ?? null,
        sortOrder: (last?.sortOrder ?? 0) + 1,
      },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "TAXONOMY_CREATED",
      entityType: "taxonomies",
      entityId: item.id,
      metadata: { kind, value },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return serverError("create this entry", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, ...fields } = parsed.data;

    const existing = await prisma.taxonomy.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return notFound("Entry not found");

    const item = await prisma.taxonomy.update({ where: { id }, data: fields });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "TAXONOMY_UPDATED",
      entityType: "taxonomies",
      entityId: id,
    });

    return NextResponse.json({ item });
  } catch (error) {
    return serverError("update this entry", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("An id is required");

    const item = await prisma.taxonomy.findUnique({ where: { id } });
    if (!item) return notFound("Entry not found");

    // Jobs and profiles store the value as free text, so deleting an entry
    // cannot cascade — it only removes the option from future dropdowns. The
    // count is reported so the admin can see what they are about to orphan.
    const inUse =
      item.kind === "JOB_CATEGORY"
        ? await prisma.job.count({ where: { category: item.value } })
        : item.kind === "SKILL"
          ? await prisma.skill.count({ where: { name: item.value } })
          : 0;

    await prisma.taxonomy.delete({ where: { id } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "TAXONOMY_DELETED",
      entityType: "taxonomies",
      entityId: id,
      metadata: { kind: item.kind, value: item.value, inUse },
    });

    return NextResponse.json({ deleted: true, inUse });
  } catch (error) {
    return serverError("delete this entry", error);
  }
}
