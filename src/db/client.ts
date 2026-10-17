import { PrismaClient } from "@prisma/client";
import { config } from "../config/env.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = db;
}
