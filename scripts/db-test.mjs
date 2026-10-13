import assert from 'node:assert/strict';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('Set DATABASE_URL in .env.local before running database tests.');
  process.exit(1);
}
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  await client.query('BEGIN');
  const { rows: [resource] } = await client.query("INSERT INTO resources (name, location) VALUES ('Constraint test', 'Test location') RETURNING id");
  const insert = (start, end, resourceId = resource.id) => client.query(
    `INSERT INTO reservations (resource_id, requester_name, requester_email, purpose, starts_at, ends_at)
     VALUES ($1, 'Test User', 'test@example.com', 'Constraint verification', $2, $3) RETURNING id`,
    [resourceId, start, end],
  );
  const expectFailure = async (code, operation) => {
    await client.query('SAVEPOINT expected_failure');
    let caught;
    try { await operation(); } catch (error) { caught = error; }
    await client.query('ROLLBACK TO SAVEPOINT expected_failure');
    await client.query('RELEASE SAVEPOINT expected_failure');
    assert.equal(caught?.code, code);
  };
  const at = (time) => `2099-01-01T${time}:00+05:30`;
  const { rows: [booking] } = await insert(at('10:00'), at('11:00'));
  await expectFailure('23P01', () => insert(at('10:30'), at('11:30')));
  await expectFailure('23P01', () => insert(at('09:00'), at('12:00')));
  await insert(at('11:00'), at('12:00'));
  await expectFailure('23514', () => insert(at('13:00'), at('12:00')));
  await expectFailure('23514', () => insert(at('13:00'), at('13:00')));
  await expectFailure('23503', () => insert(at('14:00'), at('15:00'), '00000000-0000-4000-8000-999999999999'));
  await expectFailure('23503', () => client.query('DELETE FROM resources WHERE id = $1', [resource.id]));
  const { rows: [other] } = await client.query("INSERT INTO resources (name, location) VALUES ('Other test resource', 'Test location') RETURNING id");
  await insert(at('10:00'), at('11:00'), other.id);
  await client.query("UPDATE reservations SET status = 'cancelled' WHERE id = $1", [booking.id]);
  await insert(at('10:00'), at('11:00'));
  await expectFailure('23P01', () => client.query("UPDATE reservations SET status = 'confirmed' WHERE id = $1", [booking.id]));
  console.log('PASS: overlaps, containment, adjacent bookings, invalid times, foreign keys, separate resources, cancellation, and reactivation.');
} catch (error) {
  console.error(`Database verification failed (${error.code ?? error.name}).`);
  process.exitCode = 1;
} finally {
  await client.query('ROLLBACK').catch(() => {});
  await client.end();
}
