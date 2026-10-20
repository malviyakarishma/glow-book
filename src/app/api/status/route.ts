import { NextResponse } from 'next/server';
import { isDatabaseConfigured, ensureTablesExist } from '@/lib/db';

export async function GET() {
  const configured = isDatabaseConfigured();
  if (configured) {
    try {
      await ensureTablesExist();
      return NextResponse.json({
        configured: true,
        connected: true,
        provider: 'Neon PostgreSQL',
        message: 'Connected to Neon PostgreSQL database.'
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown database error';
      return NextResponse.json({
        configured: true,
        connected: false,
        provider: 'Neon PostgreSQL',
        error: message
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    configured: false,
    connected: false,
    provider: 'Local Storage Fallback',
    message: 'DATABASE_URL is not set. Running in local browser storage mode.'
  });
}
