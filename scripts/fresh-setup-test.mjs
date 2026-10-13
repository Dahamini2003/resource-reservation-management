import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL first.');
const url = new URL(process.env.DATABASE_URL);
const databaseName = `assessment_verify_${randomBytes(8).toString('hex')}`;
const adminUrl = new URL(url);
adminUrl.pathname = '/postgres';
url.pathname = `/${databaseName}`;
const admin = new pg.Client({ connectionString: adminUrl.toString(), connectionTimeoutMillis: 5000 });
let created = false;
try {
  await admin.connect();
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  created = true;
  for (const command of ['migrate', 'migrate', 'seed', 'seed']) {
    const result = spawnSync(process.execPath, ['scripts/db.mjs', command], {
      env: { ...process.env, DATABASE_URL: url.toString() }, encoding: 'utf8', timeout: 30000,
    });
    assert.equal(result.status, 0, `${command} failed in the temporary database`);
  }
  const client = new pg.Client({ connectionString: url.toString() });
  try {
    await client.connect();
    const resources = await client.query('SELECT count(*)::int AS count FROM resources');
    const migrations = await client.query('SELECT count(*)::int AS count FROM schema_migrations');
    assert.equal(resources.rows[0].count, 3);
    assert.equal(migrations.rows[0].count, 1);
  } finally { await client.end(); }
  console.log('PASS: fresh schema setup and repeated migrations/seeds; exactly three sample resources.');
} catch (error) {
  console.error(`Fresh database verification failed (${error.code ?? error.name}).`);
  process.exitCode = 1;
} finally {
  // Only remove the database generated and successfully created by this invocation.
  if (created && /^assessment_verify_[0-9a-f]{16}$/.test(databaseName)) {
    await admin.query(`DROP DATABASE "${databaseName}"`);
  }
  await admin.end();
}
