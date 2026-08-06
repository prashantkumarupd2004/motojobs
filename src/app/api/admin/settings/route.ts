import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auditAdmin, requireAdmin, serverError, zodResponse } from "@/lib/admin";

/**
 * Website settings, stored as a flat key/value table so a new setting needs no
 * migration.
 *
 * Secret values (SMTP passwords, API keys) are never sent to the browser — the
 * response reports only whether one is set, and a blank submission leaves the
 * stored value untouched rather than wiping it.
 */

const updateSchema = z.object({
  values: z.record(z.string(), z.string().max(4000)),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({
      settings: settings.map((s) => ({
        key: s.key,
        label: s.label,
        group: s.group,
        inputType: s.inputType,
        hint: s.hint,
        isSecret: s.isSecret,
        value: s.isSecret ? "" : s.value,
        hasValue: s.value.length > 0,
      })),
    });
  } catch (error) {
    return serverError("load settings", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);

    const keys = Object.keys(parsed.data.values);
    if (keys.length === 0) return NextResponse.json({ updated: 0 });

    const existing = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
      select: { key: true, isSecret: true },
    });
    const secretKeys = new Set(existing.filter((s) => s.isSecret).map((s) => s.key));

    let updated = 0;
    for (const [key, value] of Object.entries(parsed.data.values)) {
      // A blank secret means "leave it alone", not "clear it" — the field is
      // rendered empty on every load, so submitting the form would otherwise
      // erase every credential.
      if (secretKeys.has(key) && value.trim() === "") continue;
      await prisma.siteSetting.updateMany({ where: { key }, data: { value } });
      updated++;
    }

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "SETTINGS_UPDATED",
      entityType: "site_settings",
      metadata: { keys: keys.filter((k) => !secretKeys.has(k)) },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    return serverError("save settings", error);
  }
}
