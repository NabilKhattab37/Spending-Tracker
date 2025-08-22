import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await sql`DELETE FROM transactions WHERE id = ${id}`;
    
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}