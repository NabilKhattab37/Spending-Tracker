import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connection successful:', result);
    
    return NextResponse.json({ 
      message: 'Database connection successful!',
      time: result.rows[0].current_time 
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error.message,
      env_check: {
        has_postgres_url: !!process.env.POSTGRES_URL,
        has_vercel_url: !!process.env.POSTGRES_PRISMA_URL
      }
    }, { status: 500 });
  }
}