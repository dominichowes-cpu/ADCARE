import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./generated/schema";
import * as relations from "./generated/relations";

const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@127.0.0.1:5432/claritypath",
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema: { ...schema, ...relations } });
export * from "./generated/schema";
export { sql, eq, and, or, desc, asc, isNull, inArray, count, gte, lte } from "drizzle-orm";
