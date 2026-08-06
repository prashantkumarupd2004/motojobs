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
 * States and their cities. Separate from the flat taxonomy route because the
 * two are related — a city cannot exist without a state, and the UI needs them
 * nested rather than as two independent lists.
 */

const createSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("state"),
    name: z.string().trim().min(2, "Enter a state name").max(80),
  }),
  z.object({
    type: z.literal("city"),
    stateId: z.string().trim().min(1, "Pick a state"),
    name: z.string().trim().min(2, "Enter a city name").max(80),
    isHub: z.boolean().optional(),
  }),
]);

const updateSchema = z.object({
  type: z.enum(["state", "city"]),
  id: z.string().trim().min(1),
  name: z.string().trim().min(2).max(80).optional(),
  isActive: z.boolean().optional(),
  isHub: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const stateId = params.get("stateId") ?? "";
    const search = params.get("search")?.trim() ?? "";

    const states = await prisma.state.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        isActive: true,
        _count: { select: { cities: true } },
      },
    });

    // Cities are only fetched for the selected state — loading all of them
    // would grow unbounded as the admin adds more.
    const cities = stateId
      ? await prisma.city.findMany({
          where: {
            stateId,
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        })
      : [];

    return NextResponse.json({ states, cities });
  } catch (error) {
    return serverError("load locations", error);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);

    if (parsed.data.type === "state") {
      const { name } = parsed.data;
      const clash = await prisma.state.findUnique({ where: { name }, select: { id: true } });
      if (clash) return badRequest("That state already exists", { name: "Already in the list" });

      const last = await prisma.state.findFirst({
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      const state = await prisma.state.create({
        data: { name, sortOrder: (last?.sortOrder ?? 0) + 1 },
      });

      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "STATE_CREATED",
        entityType: "states",
        entityId: state.id,
        metadata: { name },
      });
      return NextResponse.json({ state }, { status: 201 });
    }

    const { stateId, name, isHub } = parsed.data;
    const state = await prisma.state.findUnique({ where: { id: stateId }, select: { id: true } });
    if (!state) return notFound("State not found");

    const clash = await prisma.city.findUnique({
      where: { stateId_name: { stateId, name } },
      select: { id: true },
    });
    if (clash) return badRequest("That city already exists", { name: "Already in the list" });

    const last = await prisma.city.findFirst({
      where: { stateId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const city = await prisma.city.create({
      data: { stateId, name, isHub: isHub ?? false, sortOrder: (last?.sortOrder ?? 0) + 1 },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "CITY_CREATED",
      entityType: "cities",
      entityId: city.id,
      metadata: { name },
    });
    return NextResponse.json({ city }, { status: 201 });
  } catch (error) {
    return serverError("create this location", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { type, id, name, isActive, isHub } = parsed.data;

    if (type === "state") {
      const existing = await prisma.state.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return notFound("State not found");
      const state = await prisma.state.update({
        where: { id },
        data: { ...(name ? { name } : {}), ...(isActive !== undefined ? { isActive } : {}) },
      });
      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "STATE_UPDATED",
        entityType: "states",
        entityId: id,
      });
      return NextResponse.json({ state });
    }

    const existing = await prisma.city.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return notFound("City not found");
    const city = await prisma.city.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isHub !== undefined ? { isHub } : {}),
      },
    });
    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "CITY_UPDATED",
      entityType: "cities",
      entityId: id,
    });
    return NextResponse.json({ city });
  } catch (error) {
    return serverError("update this location", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const type = params.get("type");
    const id = params.get("id");
    if (!id || (type !== "state" && type !== "city")) {
      return badRequest("A type and id are required");
    }

    if (type === "state") {
      const state = await prisma.state.findUnique({
        where: { id },
        select: { id: true, name: true, _count: { select: { cities: true } } },
      });
      if (!state) return notFound("State not found");

      // Cities cascade with the state. Candidate and job rows store the name as
      // free text, so they are unaffected — the option simply disappears.
      await prisma.state.delete({ where: { id } });
      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "STATE_DELETED",
        entityType: "states",
        entityId: id,
        metadata: { name: state.name, cities: state._count.cities },
      });
      return NextResponse.json({ deleted: true, cities: state._count.cities });
    }

    const city = await prisma.city.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!city) return notFound("City not found");

    await prisma.city.delete({ where: { id } });
    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "CITY_DELETED",
      entityType: "cities",
      entityId: id,
      metadata: { name: city.name },
    });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this location", error);
  }
}
