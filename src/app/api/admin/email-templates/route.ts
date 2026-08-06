import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  auditAdmin,
  notFound,
  requireAdmin,
  serverError,
  unpackList,
  zodResponse,
} from "@/lib/admin";

/**
 * Transactional email copy. `src/lib/email.ts` keeps its hard-coded defaults
 * and only consults these rows as an override, so a bad edit degrades to the
 * built-in template instead of stopping signup mail.
 */

const updateSchema = z.object({
  key: z.string().trim().min(1),
  name: z.string().trim().min(1).max(120).optional(),
  subject: z.string().trim().min(1, "Enter a subject").max(200).optional(),
  bodyHtml: z.string().trim().min(1, "Enter the HTML body").max(20000).optional(),
  bodyText: z.string().trim().min(1, "Enter the plain-text body").max(20000).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({
      templates: templates.map((t) => ({ ...t, variables: unpackList(t.variables) })),
    });
  } catch (error) {
    return serverError("load email templates", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { key, ...fields } = parsed.data;

    const existing = await prisma.emailTemplate.findUnique({
      where: { key },
      select: { id: true },
    });
    if (!existing) return notFound("Template not found");

    const template = await prisma.emailTemplate.update({ where: { key }, data: fields });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "EMAIL_TEMPLATE_UPDATED",
      entityType: "email_templates",
      entityId: template.id,
      metadata: { key },
    });

    return NextResponse.json({
      template: { ...template, variables: unpackList(template.variables) },
    });
  } catch (error) {
    return serverError("save this template", error);
  }
}
