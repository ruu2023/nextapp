// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// グローバルに PrismaClient をキャッシュする
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // 開発中だけクエリをログに出す
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;