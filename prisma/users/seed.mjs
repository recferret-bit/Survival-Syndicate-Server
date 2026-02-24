import { PrismaClient, AdminStatus } from './generated/index.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ensurePgBouncerParam, getPoolConfig } from '../pool-config.mjs';

const { Pool } = pg;

async function main() {
  const isLocal = process.env.NODE_ENV === 'local';
  
  // Use test direct URL for local, PgBouncer URL for production
  let databaseUrl = isLocal 
    ? process.env.TEST_DIRECT_USERS_DATABASE_URL
    : ensurePgBouncerParam(process.env.PGBOUNCER_USERS_DATABASE_URL);
  
  if (!databaseUrl) {
    console.error('Database URL not configured');
    process.exit(1);
  }

  console.log(`Seeding users database (${isLocal ? 'local' : 'prod'})...`);
  console.log(`Database URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

  const poolConfig = getPoolConfig(databaseUrl);
  const pool = new Pool(poolConfig);
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Seed default admin
    await prisma.admin.upsert({
      where: { email: 'admin@casino.local' },
      update: {
        status: AdminStatus.active,
      },
      create: {
        email: 'admin@casino.local',
        apiKey: 'cfe09d32-3cd5-4968-86a2-2e02bd79d2bd',
        status: AdminStatus.active,
      },
    });

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
