import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { limitBy, LIMITS } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,19}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  subject: z.string().trim().min(3, "Add a subject").max(160),
  message: z.string().trim().min(20, "Tell us a little more — at least 20 characters").max(4000),
});

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "contact", LIMITS.contact);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const data = contactSchema.parse(await req.json());
    await sendContactEmail(data);
    return NextResponse.json({
      message: "Thanks — we've got your message and will reply within one working day.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid details", fieldErrors },
        { status: 400 }
      );
    }
    console.error("Contact error:", error);
    return NextResponse.json({ error: "Could not send your message" }, { status: 500 });
  }
}
