import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const tasks = db.prepare(\`
      SELECT tasks.*, leads.company_name as lead_company, campaigns.name as campaign_name 
      FROM tasks 
      LEFT JOIN leads ON tasks.lead_id = leads.id 
      LEFT JOIN campaigns ON tasks.campaign_id = campaigns.id 
      ORDER BY tasks.status DESC, tasks.created_at DESC
    \`).all();
    
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, type, lead_id, campaign_id } = await request.json();
    const db = getDb();
    const insert = db.prepare('INSERT INTO tasks (title, type, lead_id, campaign_id, status) VALUES (?, ?, ?, ?, ?)');
    insert.run(title, type || 'general', lead_id || null, campaign_id || null, 'open');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    const db = getDb();
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
