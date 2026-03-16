import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();
  const tasks = db.prepare(`
    SELECT tasks.*, leads.company_name as lead_company, campaigns.name as campaign_name 
    FROM tasks 
    LEFT JOIN leads ON tasks.lead_id = leads.id 
    LEFT JOIN campaigns ON tasks.campaign_id = campaigns.id 
    ORDER BY tasks.created_at DESC
  `).all();
  
  return NextResponse.json({ success: true, tasks });
}

export async function POST(req) {
  const db = getDb();
  const body = await req.json();
  const { title, type, lead_id, campaign_id } = body;

  const result = db.prepare(`
    INSERT INTO tasks (title, type, lead_id, campaign_id, status)
    VALUES (?, ?, ?, ?, 'open')
  `).run(title, type, lead_id, campaign_id);

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}

export async function PATCH(req) {
  const db = getDb();
  const body = await req.json();
  const { id, status } = body;

  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
  return NextResponse.json({ success: true });
}
