import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const { outreach_status } = await req.json();

    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    db.prepare('UPDATE leads SET outreach_status = ? WHERE id = ?').run(outreach_status, id);

    // If marked as replied, cancel all pending batch_leads for this lead
    if (outreach_status === 'replied') {
      db.prepare("UPDATE batch_leads SET status = 'cancelled' WHERE lead_id = ? AND status = 'pending'").run(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
