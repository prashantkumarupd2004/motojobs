import { prisma } from "@/lib/prisma";
import {
  generateOTP,
  hashOTP,
  getOTPExpiry,
  OTP_MAX_ATTEMPTS,
} from "@/lib/auth";
import { sendOTPEmail, sendPasswordResetEmail } from "@/lib/email";

export type OtpPurpose = "SIGNUP" | "LOGIN_VERIFY" | "EMAIL_CHANGE";

/** Codes are echoed back only in development so the flow is testable without SMTP. */
function devEcho(otp: string) {
  return process.env.NODE_ENV === "development" ? { devOtp: otp } : {};
}

export async function issueEmailOtp(
  user: { id: string; email: string; name: string },
  purpose: OtpPurpose = "SIGNUP"
) {
  // Invalidate any outstanding codes so only the newest one works.
  await prisma.emailVerification.updateMany({
    where: { userId: user.id, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const otp = generateOTP();
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      email: user.email,
      codeHash: await hashOTP(otp),
      purpose,
      expiresAt: getOTPExpiry(),
    },
  });

  await sendOTPEmail(user.email, otp, user.name);
  return devEcho(otp);
}

export type OtpVerdict =
  | { ok: true }
  | { ok: false; reason: "NO_CODE" | "EXPIRED" | "TOO_MANY_ATTEMPTS" | "INVALID" };

export async function consumeEmailOtp(
  userId: string,
  code: string,
  purpose: OtpPurpose = "SIGNUP"
): Promise<OtpVerdict> {
  const record = await prisma.emailVerification.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "NO_CODE" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "EXPIRED" };
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  if (record.codeHash !== (await hashOTP(code))) {
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "INVALID" };
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}

export async function issuePasswordResetOtp(user: {
  id: string;
  email: string;
  name: string;
}) {
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const otp = generateOTP();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      email: user.email,
      codeHash: await hashOTP(otp),
      expiresAt: getOTPExpiry(),
    },
  });

  await sendPasswordResetEmail(user.email, otp, user.name);
  return devEcho(otp);
}

export async function consumePasswordResetOtp(
  userId: string,
  code: string
): Promise<OtpVerdict> {
  const record = await prisma.passwordReset.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, reason: "NO_CODE" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "EXPIRED" };
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  if (record.codeHash !== (await hashOTP(code))) {
    await prisma.passwordReset.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "INVALID" };
  }

  await prisma.passwordReset.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}

export function otpErrorMessage(reason: Exclude<OtpVerdict, { ok: true }>["reason"]) {
  switch (reason) {
    case "NO_CODE":
      return "No active code. Please request a new one.";
    case "EXPIRED":
      return "This code has expired. Please request a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many incorrect attempts. Please request a new code.";
    case "INVALID":
      return "That code is incorrect.";
  }
}
