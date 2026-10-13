import 'server-only';
import { Pool } from 'pg';

const globalForDb = globalThis as unknown as { reservationPool?: Pool };

// Initialize lazily so builds do not require a live database connection.
export function getDb(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Configure .env.local.');
  }
  if (!globalForDb.reservationPool) {
    globalForDb.reservationPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
    globalForDb.reservationPool.on('error', () => {
      console.error('An idle PostgreSQL connection failed.');
    });
  }
  return globalForDb.reservationPool;
}
