import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test connection first
    await sql`SELECT 1`;
    console.log('Database connected successfully');
    
    // Create table with simpler syntax
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        type VARCHAR(20) NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('Table created successfully');
    
    // Test the table by inserting and deleting a test record
    await sql`
      INSERT INTO transactions (name, category, date, type, value) 
      VALUES ('test', 'test', '2024-01-01', 'Revenue', 1.00)
    `;
    
    await sql`DELETE FROM transactions WHERE name = 'test'`;
    
    console.log('Table test successful');
    
    return NextResponse.json({ 
      message: 'Database setup completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Setup error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    return NextResponse.json({ 
      error: 'Database setup failed',
      details: error.message,
      code: error.code || 'UNKNOWN',
      hint: error.hint || 'Check logs for more details'
    }, { status: 500 });
  }
}