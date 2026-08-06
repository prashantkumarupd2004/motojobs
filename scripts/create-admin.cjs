/**
 * Creates or resets the single Super Admin account.
 *
 * There is deliberately no admin registration route — the panel has one
 * privileged login and it is provisioned here, not through the web.
 *
 *   node scripts/create-admin.cjs <email> [name]
 *   node scripts/create-admin.cjs <email> --reset    # new password, same account
 *
 * The password is generated, printed once, and never stored in plaintext.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Ambiguous characters (0/O, 1/l/I) are excluded so the password can be read
 * off a screen and typed without error. 20 chars from a 58-char alphabet is
 * ~117 bits, far past anything brute-forceable.
 */
function generatePassword(length = 20) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  // The login schema requires a letter and a digit; the alphabet guarantees
  // letters, so only the digit needs forcing.
  if (!/[0-9]/.test(out)) out = `${out.slice(0, -1)}7`;
  return out;
}

(async () => {
  const [email, second] = process.argv.slice(2);
  const reset = process.argv.includes('--reset');
  const name = second && !second.startsWith('--') ? second : 'Super Admin';

  if (!email) {
    console.error('Usage: node scripts/create-admin.cjs <email> [name] [--reset]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing && !reset) {
    console.error(`\n${email} already exists (role: ${existing.role}).`);
    console.error('Re-run with --reset to issue a new password for it.\n');
    process.exit(1);
  }

  const otherAdmins = await prisma.user.count({
    where: { role: 'ADMIN', email: { not: email } },
  });
  if (otherAdmins > 0 && !reset) {
    console.error(`\n${otherAdmins} other admin account(s) already exist.`);
    console.error('This platform is designed for a single admin. Review before adding another.\n');
    process.exit(1);
  }

  const password = generatePassword();
  const hashed = await bcrypt.hash(password, 12);

  const user = existing
    ? await prisma.user.update({
        where: { email },
        data: {
          password: hashed,
          role: 'ADMIN',
          isActive: true,
          isEmailVerified: true,
          emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
          suspendedAt: null,
          suspendedReason: null,
        },
      })
    : await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: 'ADMIN',
          isActive: true,
          // Skips the OTP step: the account is provisioned out of band, and an
          // admin who cannot log in cannot verify anything.
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

  console.log(`\n${existing ? 'Password reset for' : 'Created'} Super Admin\n`);
  console.log(`  Login page  https://www.motojobs.in/admin/login`);
  console.log(`  Email       ${user.email}`);
  console.log(`  Password    ${password}`);
  console.log(`\nStore it in a password manager, then change it from`);
  console.log(`/admin/profile after your first sign-in.\n`);

  await prisma.$disconnect();
})().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
