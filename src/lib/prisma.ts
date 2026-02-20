import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance in development to avoid exhausting connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["query", "error", "warn"], // Uncomment if you want query logs while debugging.
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;