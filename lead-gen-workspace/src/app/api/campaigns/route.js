import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  return NextResponse.json({ success: true, campaigns });
}

export async function POST(req) {
  const db = getDb();
  const body = await req.json();
  const { name, geography, company_type, icp_notes, target_roles, language } = body;
  
  const result = db.prepare(`
    INSERT INTO campaigns (name, geography, company_type, icp_notes, target_roles, language, status)
    VALUES (?, ?, ?, ?, ?, ?, 'draft')
  `).run(name, geography, company_type, icp_notes, target_roles, language);

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}
