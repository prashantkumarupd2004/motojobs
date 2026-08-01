import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging leaks emails and password hashes into CloudWatch in prod.
    log: process.env.NODE_ENV === "production" ? ["warn", "error"] : ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
