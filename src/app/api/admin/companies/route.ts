import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/validation/company";
import {
  auditAdmin,
  badRequest,
  csvResponse,
  notFound,
  paging,
  requireAdmin,
  serverError,
  toCsv,
  unpackList,
  zodResponse,
} from "@/lib/admin";

/**
 * Company records. Editing here is the admin's override — the employer edits
 * the same row from /recruiter/company, so the field list is kept deliberately
 * narrow: identity, address and verification, not hiring preferences.
 */

const editSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(2).max(140),
  industry: z.string().trim().max(80).nullish(),
  size: z.string().trim().max(40).nullish(),
  description: z.string().trim().max(2000).nullish(),
  website: z.string().trim().max(300).nullish(),
  email: z.string().trim().max(160).nullish(),
  phone: z.string().trim().max(20).nullish(),
  gstNumber: z.string().trim().max(15).nullish(),
  panNumber: z.string().trim().max(10).nullish(),
  addressLine: z.string().trim().max(240).nullish(),
  city: z.string().trim().max(80).nullish(),
  state: z.string().trim().max(80).nullish(),
  pincode: z.string().trim().max(6).nullish(),
  logo: z.string().trim().max(300).nullish(),
  isVerified: z.boolean().optional(),
});

async function uniqueSlug(name: string, excludeId: string): Promise<string> {
  const base = slugify(name) || "company";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken || taken.id === excludeId) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req);

    const search = params.get("search")?.trim() ?? "";
    const industry = params.get("industry") ?? "";
    const state = params.get("state") ?? "";
    const verified = params.get("verified") ?? "";

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (industry) where.industry = industry;
    if (state) where.state = state;
    if (verified === "yes") where.isVerified = true;
    if (verified === "no") where.isVerified = false;

    const select = {
      id: true,
      name: true,
      slug: true,
      logo: true,
      industry: true,
      size: true,
      city: true,
      state: true,
      website: true,
      email: true,
      phone: true,
      isVerified: true,
      isProfileComplete: true,
      profileCompletion: true,
      createdAt: true,
      _count: { select: { jobs: true, recruiters: true } },
    } as const;

    if (params.get("export") === "csv") {
      const rows = await prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5000,
        select,
      });
      const csv = toCsv(
        rows.map((c) => ({
          name: c.name,
          type: c.industry ?? "",
          size: c.size ?? "",
          city: c.city ?? "",
          state: c.state ?? "",
          email: c.email ?? "",
          phone: c.phone ?? "",
          jobs: c._count.jobs,
          recruiters: c._count.recruiters,
          verified: c.isVerified ? "Yes" : "No",
          registeredAt: c.createdAt.toISOString().slice(0, 10),
        })),
        [
          "name", "type", "size", "city", "state", "email",
          "phone", "jobs", "recruiters", "verified", "registeredAt",
        ]
      );
      return csvResponse(csv, "companies.csv");
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load companies", error);
  }
}

/** Full record for the edit drawer. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) return badRequest("A company id is required");

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        recruiters: {
          select: {
            id: true,
            designation: true,
            user: { select: { id: true, name: true, email: true, isActive: true } },
          },
        },
        documents: {
          orderBy: { uploadedAt: "desc" },
          select: {
            id: true,
            type: true,
            fileUrl: true,
            fileName: true,
            status: true,
            uploadedAt: true,
          },
        },
        _count: { select: { jobs: true } },
      },
    });
    if (!company) return notFound("Company not found");

    return NextResponse.json({
      company: { ...company, hiringCategories: unpackList(company.hiringCategories) },
    });
  } catch (error) {
    return serverError("load this company", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = editSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, ...fields } = parsed.data;

    const existing = await prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) return notFound("Company not found");

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...fields,
        headquarters: [fields.city, fields.state].filter(Boolean).join(", ") || null,
        ...(fields.name !== existing.name
          ? { slug: await uniqueSlug(fields.name, id) }
          : {}),
      },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "COMPANY_EDITED",
      entityType: "companies",
      entityId: id,
    });

    return NextResponse.json({
      company: { ...company, hiringCategories: unpackList(company.hiringCategories) },
    });
  } catch (error) {
    return serverError("update this company", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("A company id is required");

    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true, _count: { select: { jobs: true, recruiters: true } } },
    });
    if (!company) return notFound("Company not found");

    // Jobs reference the company optionally, so they survive as orphans and
    // their application history with them. Recruiter rows keep their user
    // account and simply lose the company link.
    await prisma.company.delete({ where: { id } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "COMPANY_DELETED",
      entityType: "companies",
      entityId: id,
      metadata: { name: company.name, jobs: company._count.jobs },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this company", error);
  }
}
