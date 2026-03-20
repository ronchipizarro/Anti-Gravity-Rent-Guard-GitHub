import { getDb } from '@/lib/db';
import { sendOutreachEmail } from '@/lib/resend';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const db = getDb();
    const { batchId } = await req.json();

    if (!batchId) {
      return NextResponse.json({ success: false, error: 'batchId required' }, { status: 400 });
    }

    const batch = db.prepare(`
      SELECT ob.*, c.sender_name, c.sender_email
      FROM outreach_batches ob
      LEFT JOIN campaigns c ON ob.campaign_id = c.id
      WHERE ob.id = ?
    `).get(batchId);

    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }
    if (batch.status !== 'approved') {
      return NextResponse.json({ success: false, error: `Batch must be approved before sending. Current status: ${batch.status}` }, { status: 400 });
    }

    // Mark batch as sending
    db.prepare('UPDATE outreach_batches SET status = ? WHERE id = ?').run('sending', batchId);

    // Fetch pending emails with lead data
    const emails = db.prepare(`
      SELECT bl.*, l.contact_email, l.generic_email, l.contact_name
      FROM batch_leads bl
      LEFT JOIN leads l ON bl.lead_id = l.id
      WHERE bl.batch_id = ? AND bl.status = 'pending'
    `).all(batchId);

    const from = batch.sender_name && batch.sender_email
      ? `${batch.sender_name} <${batch.sender_email}>`
      : undefined;

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const email of emails) {
      const toAddress = email.contact_email || email.generic_email;
      if (!toAddress) {
        db.prepare('UPDATE batch_leads SET status = ? WHERE id = ?').run('failed', email.id);
        failed++;
        errors.push({ leadId: email.lead_id, error: 'No email address' });
        continue;
      }

      try {
        const result = await sendOutreachEmail({
          to: toAddress,
          subject: email.subject,
          body: email.body,
          from,
        });

        if (result.success) {
          db.prepare('UPDATE batch_leads SET status = ?, resend_id = ?, sent_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run('sent', result.data?.id || null, email.id);
          db.prepare('UPDATE leads SET outreach_status = ?, current_sequence_step = ?, pipeline_status = ? WHERE id = ?')
            .run('sequence_active', batch.sequence_step, 'contacted', email.lead_id);
          sent++;
        } else {
          db.prepare('UPDATE batch_leads SET status = ? WHERE id = ?').run('failed', email.id);
          failed++;
          errors.push({ leadId: email.lead_id, error: result.error });
        }
      } catch (err) {
        db.prepare('UPDATE batch_leads SET status = ? WHERE id = ?').run('failed', email.id);
        failed++;
        errors.push({ leadId: email.lead_id, error: err.message });
      }

      // Rate limit: 150ms between sends
      await new Promise(r => setTimeout(r, 150));
    }

    // Mark batch as sent
    db.prepare('UPDATE outreach_batches SET status = ? WHERE id = ?').run('sent', batchId);

    return NextResponse.json({ success: true, sent, failed, errors });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
