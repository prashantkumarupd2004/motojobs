import { Resend } from "resend";

/**
 * Transactional email via Resend.
 *
 * Deliverability rules baked in here, because getting any of them wrong is what
 * lands a noreply@ domain in spam:
 *  - `From` uses a verified domain identity; the display name is separate from
 *    the address so inboxes show "Motojobs.in", not the raw noreply mailbox.
 *  - `Reply-To` points at a monitored inbox. A noreply From with no Reply-To is
 *    a documented spam signal, and users do hit reply.
 *  - Every message ships a plain-text part. HTML-only mail scores badly.
 */

const API_KEY = process.env.RESEND_API_KEY;

const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@motojobs.in";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Motojobs.in";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@motojobs.in";

// Long-lived client: App Runner reuses the container across requests.
const resend = API_KEY ? new Resend(API_KEY) : null;

/**
 * RFC 5322 display names must be quoted-string escaped, otherwise a name
 * containing a comma or quote produces a malformed header the API rejects.
 */
function formatFrom() {
  const escaped = FROM_NAME.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}" <${FROM_ADDRESS}>`;
}

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * Outside production a missing or broken transport must not break the signup
 * flow — the message is logged (and the OTP echoed by the API) so the journey
 * stays walkable. In production a delivery failure is real and must propagate.
 */
async function deliver(mail: Mail) {
  const isProd = process.env.NODE_ENV === "production";

  if (!resend) {
    if (isProd) {
      throw new Error("RESEND_API_KEY is not set — cannot send transactional email");
    }
    console.info(`[email:dev] to=${mail.to} subject=${mail.subject}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: formatFrom(),
      to: [mail.to],
      replyTo: mail.replyTo || REPLY_TO,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (error) throw new Error(`${error.name}: ${error.message}`);
  } catch (err) {
    if (isProd) throw err;
    console.warn(
      `[email:dev] delivery failed for ${mail.to} — continuing:`,
      err instanceof Error ? err.message : err
    );
  }
}

const BRAND_GRADIENT = "linear-gradient(135deg, #0F4C81, #0C3D68)";
const BRAND = "#0F4C81";
const ACCENT = "#FF6B00";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://motojobs.in";

/** User-supplied text lands in an HTML email body, so escape it. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Motojobs.in</title>
</head>
<body style="margin:0; padding:0; background:#f9fafb;">
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
    <div style="background: ${BRAND_GRADIENT}; background-color: ${BRAND}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Motojobs.in</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 13px;">India's Automobile Sector Job Portal</p>
    </div>
    ${bodyHtml}
    <div style="text-align:center; padding: 24px 12px; color:#9ca3af; font-size: 12px; line-height: 1.6;">
      <p style="margin:0 0 6px;">This is a transactional email from Motojobs.in.</p>
      <p style="margin:0;">Questions? Reply to this email or write to ${REPLY_TO}</p>
    </div>
  </div>
</body>
</html>`;
}

function otpBody(name: string, otp: string, intro: string, outro: string) {
  return shell(`
    <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">
      <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 20px;">Hello, ${escapeHtml(name)}!</h2>
      <p style="color: #6b7280; margin: 0 0 30px; font-size: 15px; line-height: 1.6;">${intro}</p>
      <div style="background: #f3f4f6; border: 2px dashed ${BRAND}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
        <span style="font-size: 36px; font-weight: bold; color: ${BRAND}; letter-spacing: 8px;">${otp}</span>
      </div>
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">${outro}</p>
    </div>
  `);
}

export async function sendOTPEmail(email: string, otp: string, name: string) {
  await deliver({
    to: email,
    subject: `${otp} is your Motojobs.in verification code`,
    html: otpBody(
      name,
      otp,
      "Use the code below to verify your email address. It expires in 10 minutes.",
      "If you didn't create a Motojobs.in account, you can safely ignore this email."
    ),
    text: [
      `Hello, ${name}!`,
      ``,
      `Your Motojobs.in verification code is: ${otp}`,
      ``,
      `This code expires in 10 minutes.`,
      ``,
      `If you didn't create a Motojobs.in account, you can safely ignore this email.`,
    ].join("\n"),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  otp: string,
  name: string
) {
  await deliver({
    to: email,
    subject: `${otp} is your Motojobs.in password reset code`,
    html: otpBody(
      name,
      otp,
      "We received a request to reset your password. Enter the code below to continue. It expires in 10 minutes.",
      "If you didn't request a password reset, you can safely ignore this email — your password will not change."
    ),
    text: [
      `Hello, ${name}`,
      ``,
      `Your Motojobs.in password reset code is: ${otp}`,
      ``,
      `This code expires in 10 minutes.`,
      ``,
      `If you didn't request a password reset, ignore this email — your password will not change.`,
    ].join("\n"),
  });
}

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const isCandidate = role === "CANDIDATE";
  const bullets = isCandidate
    ? [
        "Complete your profile — add your ITI, diploma or OEM certifications",
        "Build an auto-industry resume with our AI Resume Builder",
        "Browse jobs at dealerships, service centres, workshops and OEMs",
        "Take skill tests for Service Advisor, Technician, EV and Sales roles",
      ]
    : [
        "Set up your dealership or company profile",
        "Post jobs and reach candidates from the auto sector only",
        "Use AI screening built for automotive hiring",
        "Manage applications with our ATS",
      ];

  await deliver({
    to: email,
    subject: "Welcome to Motojobs.in",
    html: shell(`
      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color:#1f2937; margin:0 0 12px; font-size: 20px;">Hi ${escapeHtml(name)}!</h2>
        <p style="color:#6b7280; margin:0 0 20px; font-size:15px; line-height:1.6;">
          Welcome to Motojobs.in — your ${isCandidate ? "automobile career" : "auto sector hiring"} journey starts now.
        </p>
        <ul style="color:#374151; font-size:14px; line-height:1.9; padding-left:20px; margin:0 0 28px;">
          ${bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
        <a href="${APP_URL}/login" style="background: ${ACCENT}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">Get Started</a>
      </div>
    `),
    text: [
      `Hi ${name}!`,
      ``,
      `Welcome to Motojobs.in — your ${isCandidate ? "automobile career" : "auto sector hiring"} journey starts now.`,
      ``,
      ...bullets.map((b) => `  - ${b}`),
      ``,
      `Get started: ${APP_URL}/login`,
    ].join("\n"),
  });
}

export async function sendContactEmail(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const rows: [string, string][] = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone || "—"],
    ["Subject", input.subject],
  ];

  await deliver({
    to: process.env.CONTACT_INBOX || REPLY_TO,
    // Reply goes to the enquirer, not the noreply mailbox.
    replyTo: input.email,
    subject: `[Contact] ${input.subject}`,
    html: shell(`
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <h2 style="color:#1f2937; margin:0 0 20px; font-size:18px;">New contact enquiry</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          ${rows
            .map(
              ([label, value]) => `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 90px;">${label}</td>
            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(value)}</td>
          </tr>`
            )
            .join("")}
        </table>
        <div style="border-left: 3px solid ${ACCENT}; padding-left: 16px; color: #374151; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${escapeHtml(
          input.message
        )}</div>
      </div>
    `),
    text: [
      `New contact enquiry`,
      ``,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      ``,
      `Message:`,
      input.message,
    ].join("\n"),
  });
}
