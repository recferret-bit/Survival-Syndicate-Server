#!/usr/bin/env node
/**
 * Create test databases for integration tests.
 * Uses pg client (no psql required). Works with Docker or local PostgreSQL.
 */
import pg from 'pg';

const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/postgres';

const DBS = ['users_test', 'balance_test'];

async function main() {
  const client = new pg.Client({ connectionString: POSTGRES_URL });
  try {
    await client.connect();
    for (const db of DBS) {
      const res = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [db],
      );
      if (res.rows.length > 0) {
        console.log(`  ${db} already exists`);
      } else {
        await client.query(`CREATE DATABASE ${db}`);
        console.log(`  Created ${db}`);
      }
    }
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
