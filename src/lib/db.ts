import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export default pool;
