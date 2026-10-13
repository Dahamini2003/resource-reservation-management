import assert from 'node:assert/strict';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 5000 });
let id;
try {
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL first.');
  const resource = await pool.query("INSERT INTO resources (name, location) VALUES ('Concurrent booking verification', 'Temporary test fixture') RETURNING id");
  id = resource.rows[0].id;
  const reserve = () => pool.query(`INSERT INTO reservations (resource_id, requester_name, requester_email, purpose, starts_at, ends_at)
    VALUES ($1, 'Test User', 'test@example.com', 'Concurrency test', '2099-02-01T10:00:00+05:30', '2099-02-01T11:00:00+05:30')`, [id]);
  const results = await Promise.allSettled([reserve(), reserve()]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  const rejected = results.find((result) => result.status === 'rejected');
  assert.equal(rejected.reason.code, '23P01');
  console.log('PASS: simultaneous conflicting bookings accept exactly one reservation.');
} catch (error) {
  console.error(`Concurrency verification failed (${error.code ?? error.name}).`);
  process.exitCode = 1;
} finally {
  if (id) {
    await pool.query('DELETE FROM reservations WHERE resource_id = $1', [id]);
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);
  }
  await pool.end();
}
