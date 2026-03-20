import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const db = getDb();
    const { id } = await params;

    const batch = db.prepare(`
      SELECT ob.*, c.name as campaign_name, c.sender_name, c.sender_email
      FROM outreach_batches ob
      LEFT JOIN campaigns c ON ob.campaign_id = c.id
      WHERE ob.id = ?
    `).get(id);

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    const emails = db.prepare(`
      SELECT bl.*, l.contact_name, l.contact_email, l.generic_email, l.company_name, l.city, l.contact_role
      FROM batch_leads bl
      LEFT JOIN leads l ON bl.lead_id = l.id
      WHERE bl.batch_id = ?
      ORDER BY bl.id ASC
    `).all(id);

    return NextResponse.json({ success: true, batch, emails });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const db = getDb();
    const { id } = await params;
    const { status } = await req.json();

    if (status === 'approved') {
      db.prepare('UPDATE outreach_batches SET status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?').run('approved', id);
    } else {
      db.prepare('UPDATE outreach_batches SET status = ? WHERE id = ?').run(status, id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const db = getDb();
    const { id } = await params;

    const batch = db.prepare('SELECT * FROM outreach_batches WHERE id = ?').get(id);
    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    if (batch.status === 'sent' || batch.status === 'sending') {
      return NextResponse.json({ success: false, error: 'Cannot delete a batch that has been sent' }, { status: 400 });
    }

    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM batch_leads WHERE batch_id = ?').run(id);
      db.prepare('DELETE FROM outreach_batches WHERE id = ?').run(id);
    });
    transaction();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
