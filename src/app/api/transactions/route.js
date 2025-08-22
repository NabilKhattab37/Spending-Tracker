import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM transactions 
      ORDER BY date DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, category, date, type, value } = await request.json();
    
    const { rows } = await sql`
      INSERT INTO transactions (name, category, date, type, value, created_at)
      VALUES (${name}, ${category}, ${date}, ${type}, ${value}, NOW())
      RETURNING *
    `;
    
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}