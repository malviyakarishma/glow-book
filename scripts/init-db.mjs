import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Load .env.local if available
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('\n❌ DATABASE_URL is not set in environment or .env.local');
  console.log('👉 Please set DATABASE_URL in .env.local to run migrations on Neon PostgreSQL.\n');
  process.exit(1);
}

async function init() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  const schemaPath = path.resolve(process.cwd(), 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('Running database schema migration...');
  
  // Split statements by semicolon and execute
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    await sql(statement);
  }

  console.log('✅ Database schema initialized successfully! Tables: orders, transactions are ready.');
}

init().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
