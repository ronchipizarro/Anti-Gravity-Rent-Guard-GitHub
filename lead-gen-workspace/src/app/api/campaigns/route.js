import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const db = getDb();

    const insert = db.prepare(`
      INSERT INTO campaigns (
        name, geography, company_type, icp_notes, target_roles, 
        language, sequence_length, batch_size, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `);

    const result = insert.run(
      data.name,
      data.geography,
      data.company_type,
      data.icp_notes,
      data.target_roles,
      data.language,
      data.sequence_length || 5,
      data.batch_size || 50
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
