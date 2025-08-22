import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('Revenue', 'Expense')),
        value DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    return NextResponse.json({ message: 'Database setup completed successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Database setup failed' }, { status: 500 });
  }
}