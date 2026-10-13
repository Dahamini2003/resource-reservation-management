import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL in .env.local first. See .env.example.');
  process.exit(1);
}

const command = process.argv[2];
const url = new URL(connectionString);
if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection URL.');
}
const databaseName = decodeURIComponent(url.pathname.slice(1));
if (!databaseName || ['postgres', 'template0', 'template1'].includes(databaseName)) {
  throw new Error('Use a dedicated application database in DATABASE_URL.');
}
if (command === 'create') url.pathname = '/postgres';

const client = new pg.Client({ connectionString: url.toString(), connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  if (command === 'create') {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (existing.rowCount) {
      console.log('Application database already exists.');
    } else {
      // SQL identifiers cannot use $1 parameters; quote and escape the identifier.
      await client.query(`CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`);
      console.log('Application database created.');
    }
  } else if (command === 'migrate') {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(73129)");
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    const folder = new URL('../db/migrations/', import.meta.url);
    const files = (await readdir(folder)).filter((name) => name.endsWith('.sql')).sort();
    for (const name of files) {
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
      if (applied.rowCount) continue;
      await client.query(await readFile(new URL(name, folder), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      console.log(`Applied ${name}`);
    }
    await client.query('COMMIT');
    console.log('Database schema is up to date.');
  } else if (command === 'seed') {
    await client.query('BEGIN');
    await client.query(await readFile(new URL('../db/seed.sql', import.meta.url), 'utf8'));
    await client.query('COMMIT');
    console.log('Sample resources added (existing resources preserved).');
  } else if (command === 'check') {
    const result = await client.query('SELECT name, location, is_active FROM resources ORDER BY name');
    console.table(result.rows);
    console.log(`Connection verified: ${result.rowCount} resources.`);
  } else {
    throw new Error('Expected create, migrate, seed, or check.');
  }
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  // Avoid printing connection configuration or credentials.
  console.error(`Database command failed (${error.code ?? 'unknown'}). Check credentials, database permissions, and schema. ${error.code === '28P01' ? 'Password authentication failed.' : ''}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
