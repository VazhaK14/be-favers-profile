import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPool__: Pool | undefined;
}

export const prisma =
  globalThis.__prisma__ ??
  (() => {
    const pool =
      globalThis.__pgPool__ ??
      new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    const client = new PrismaClient({ adapter: new PrismaPg(pool) });
    if (process.env.NODE_ENV !== "production") {
      globalThis.__pgPool__ = pool;
      globalThis.__prisma__ = client;
    }
    return client;
  })();

// Note: in production we rely on process lifetime for pooling.
