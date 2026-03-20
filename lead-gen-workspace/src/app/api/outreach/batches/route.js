import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

function personalize(text, lead) {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/g, lead.contact_name || lead.company_name || 'there')
    .replace(/\{\{company\}\}/g, lead.company_name || 'your company')
    .replace(/\{\{city\}\}/g, lead.city || 'your area');
}

export async function GET(req) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    let query = `
      SELECT ob.*,
        COUNT(bl.id) as lead_count,
        SUM(CASE WHEN bl.status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN bl.status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        c.name as campaign_name
      FROM outreach_batches ob
      LEFT JOIN batch_leads bl ON bl.batch_id = ob.id
      LEFT JOIN campaigns c ON ob.campaign_id = c.id
    `;
    const params = [];

    if (campaignId) {
      query += ' WHERE ob.campaign_id = ?';
      params.push(campaignId);
    }

    query += ' GROUP BY ob.id ORDER BY ob.created_at DESC';

    const batches = db.prepare(query).all(...params);
    return NextResponse.json({ success: true, batches });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const db = getDb();
    const { campaignId, leadIds, sequenceStep = 1 } = await req.json();

    if (!campaignId || !leadIds || !leadIds.length) {
      return NextResponse.json({ success: false, error: 'campaignId and leadIds[] required' }, { status: 400 });
    }

    // Fetch the sequence template for this step
    const template = db.prepare(
      'SELECT * FROM email_sequences WHERE campaign_id = ? AND step_number = ?'
    ).get(campaignId, sequenceStep);

    if (!template) {
      return NextResponse.json({ success: false, error: `No sequence template found for step ${sequenceStep}. Define your email sequence first.` }, { status: 400 });
    }

    // Validate leads
    const placeholders = leadIds.map(() => '?').join(',');
    const leads = db.prepare(
      `SELECT * FROM leads WHERE id IN (${placeholders}) AND pipeline_status = 'approved'`
    ).all(...leadIds);

    if (leads.length === 0) {
      return NextResponse.json({ success: false, error: 'No approved leads found in selection' }, { status: 400 });
    }

    const leadsWithEmail = leads.filter(l => l.contact_email || l.generic_email);
    if (leadsWithEmail.length === 0) {
      return NextResponse.json({ success: false, error: 'None of the selected leads have email addresses' }, { status: 400 });
    }

    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);

    const transaction = db.transaction(() => {
      // Create the batch
      const batchResult = db.prepare(
        'INSERT INTO outreach_batches (campaign_id, name, status, sequence_step) VALUES (?, ?, ?, ?)'
      ).run(campaignId, `${campaign.name} - Step ${sequenceStep} Batch`, 'draft', sequenceStep);

      const batchId = batchResult.lastInsertRowid;

      // Create personalized emails for each lead
      const insertEmail = db.prepare(
        'INSERT INTO batch_leads (batch_id, lead_id, subject, body, status) VALUES (?, ?, ?, ?, ?)'
      );

      for (const lead of leadsWithEmail) {
        const subject = personalize(template.subject_template, lead);
        const body = personalize(template.body_template, lead);
        insertEmail.run(batchId, lead.id, subject, body, 'pending');
      }

      return batchId;
    });

    const batchId = transaction();

    return NextResponse.json({
      success: true,
      batchId,
      leadsIncluded: leadsWithEmail.length,
      leadsSkipped: leads.length - leadsWithEmail.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
