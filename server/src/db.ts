import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. API will fail until .env is configured.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T extends pg.QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}
