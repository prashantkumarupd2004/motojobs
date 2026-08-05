import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { notify } from "@/lib/notifications";
import { INTERVIEW_MODES } from "@/lib/automotive";
import {
  employerContext,
  notFound,
  rateLimited,
  unauthorized,
  zodResponse,
} from "@/lib/employer";

/**
 * Interview scheduling. An interview is anchored to an application, so an
 * employer cannot invite a candidate who never applied — the same rule the
 * Conversation model enforces for messaging.
 */

const modeIds = INTERVIEW_MODES.map((m) => m.id) as [string, ...string[]];

const createSchema = z.object({
  applicationId: z.string().trim().min(1),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: "Pick a date and time in the future",
  }),
  durationMins: z.coerce.number().int().min(5).max(480).default(30),
  mode: z.enum(modeIds).default("IN_PERSON"),
  venue: z.string().trim().max(400).optional(),
  notes: z.string().trim().max(2000).optional(),
});

const updateSchema = z.object({
  id: z.string().trim().min(1),
  action: z.enum(["reschedule", "cancel", "complete"]),
  scheduledAt: z.coerce.date().optional(),
  outcome: z.string().trim().max(2000).optional(),
});

function formatWhen(date: Date) {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");
    if (!context.companyId) {
      return NextResponse.json({ upcoming: [], past: [], candidates: [] });
    }

    const [interviews, shortlist] = await Promise.all([
      prisma.interview.findMany({
        where: { companyId: context.companyId },
        orderBy: { scheduledAt: "desc" },
        take: 200,
        include: {
          job: { select: { id: true, title: true } },
          application: {
            select: {
              id: true,
              candidate: {
                select: {
                  id: true,
                  currentCity: true,
                  user: { select: { name: true, email: true, profileImage: true } },
                },
              },
            },
          },
        },
      }),
      // Anyone already shortlisted or interviewing is who an employer would
      // realistically book next, so the scheduling form can offer them directly.
      prisma.application.findMany({
        where: {
          job: { recruiterId: context.recruiterId },
          status: { in: ["SHORTLISTED", "INTERVIEW", "SCREENING"] },
        },
        orderBy: { appliedAt: "desc" },
        take: 100,
        select: {
          id: true,
          job: { select: { id: true, title: true } },
          candidate: { select: { id: true, user: { select: { name: true } } } },
        },
      }),
    ]);

    const now = Date.now();
    return NextResponse.json({
      upcoming: interviews
        .filter((i) => i.status === "SCHEDULED" && i.scheduledAt.getTime() >= now)
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()),
      // Anything cancelled, completed, or simply in the past.
      past: interviews.filter(
        (i) => i.status !== "SCHEDULED" || i.scheduledAt.getTime() < now
      ),
      candidates: shortlist,
    });
  } catch (error) {
    console.error("Interviews GET error:", error);
    return NextResponse.json({ error: "Failed to load interviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const limit = limitBy(req, "interview", LIMITS.interview, user.userId);
    if (!limit.ok) return rateLimited(limit.retryAfter);

    const context = await employerContext(user);
    if (!context?.companyId) return notFound("Complete your company profile first");

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const data = parsed.data;

    // Scoped to the employer's own jobs — the anchor that stops cold-inviting.
    const application = await prisma.application.findFirst({
      where: { id: data.applicationId, job: { recruiterId: context.recruiterId } },
      select: {
        id: true,
        jobId: true,
        job: { select: { title: true } },
        candidate: { select: { userId: true } },
      },
    });
    if (!application) return notFound("Application not found");

    const interview = await prisma.interview.create({
      data: {
        applicationId: application.id,
        companyId: context.companyId,
        jobId: application.jobId,
        scheduledAt: data.scheduledAt,
        durationMins: data.durationMins,
        mode: data.mode,
        venue: data.venue ?? null,
        notes: data.notes ?? null,
      },
    });

    // Booking a slot is what moves a candidate into the interview stage; doing
    // it here keeps the pipeline honest without a second request.
    await prisma.application.update({
      where: { id: application.id },
      data: { status: "INTERVIEW", stage: "Interview" },
    });

    await notify({
      userId: application.candidate.userId,
      type: "INTERVIEW",
      title: "Your interview is scheduled",
      body: `${application.job.title} — ${formatWhen(data.scheduledAt)}`,
      link: "/candidate/interviews",
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    console.error("Interview POST error:", error);
    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const limit = limitBy(req, "interview", LIMITS.interview, user.userId);
    if (!limit.ok) return rateLimited(limit.retryAfter);

    const context = await employerContext(user);
    if (!context?.companyId) return notFound("Recruiter profile not found");

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, action, scheduledAt, outcome } = parsed.data;

    const existing = await prisma.interview.findFirst({
      where: { id, companyId: context.companyId },
      select: {
        id: true,
        job: { select: { title: true } },
        application: { select: { candidate: { select: { userId: true } } } },
      },
    });
    if (!existing) return notFound("Interview not found");

    if (action === "reschedule" && !scheduledAt) {
      return NextResponse.json({ error: "Pick a new date and time" }, { status: 400 });
    }
    if (action === "reschedule" && scheduledAt!.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Pick a date and time in the future" },
        { status: 400 }
      );
    }

    const data =
      action === "reschedule"
        ? { scheduledAt: scheduledAt!, status: "SCHEDULED", cancelledAt: null }
        : action === "cancel"
          ? { status: "CANCELLED", cancelledAt: new Date() }
          : { status: "COMPLETED", outcome: outcome ?? null };

    const interview = await prisma.interview.update({ where: { id: existing.id }, data });

    if (action !== "complete") {
      await notify({
        userId: existing.application.candidate.userId,
        type: "INTERVIEW",
        title:
          action === "cancel"
            ? "An interview was cancelled"
            : "Your interview was rescheduled",
        body:
          action === "cancel"
            ? existing.job.title
            : `${existing.job.title} — ${formatWhen(scheduledAt!)}`,
        link: "/candidate/interviews",
      });
    }

    return NextResponse.json({ interview });
  } catch (error) {
    console.error("Interview PATCH error:", error);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}
