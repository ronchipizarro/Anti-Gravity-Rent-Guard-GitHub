import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

function personalize(text, lead) {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/g, lead.contact_name || lead.company_name || 'there')
    .replace(/\{\{company\}\}/g, lead.company_name || 'your company')
    .replace(/\{\{city\}\}/g, lead.city || 'your area');
}

export async function POST(req) {
  try {
    const db = getDb();
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'campaignId required' }, { status: 400 });
    }

    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    // Find leads with active sequences
    const activeLeads = db.prepare(
      "SELECT * FROM leads WHERE campaign_id = ? AND outreach_status = 'sequence_active'"
    ).all(campaignId);

    if (activeLeads.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads with active sequences in this campaign' }, { status: 400 });
    }

    // Determine next step for each lead
    const nextStep = activeLeads[0].current_sequence_step + 1;

    // Get the template for the next step
    const template = db.prepare(
      'SELECT * FROM email_sequences WHERE campaign_id = ? AND step_number = ?'
    ).get(campaignId, nextStep);

    if (!template) {
      return NextResponse.json({ success: false, error: `No sequence template for step ${nextStep}. Sequence may be complete.` }, { status: 400 });
    }

    // Check delay: find leads whose last email was sent long enough ago
    const eligibleLeads = [];
    for (const lead of activeLeads) {
      if (lead.current_sequence_step + 1 !== nextStep) continue;

      const lastSent = db.prepare(`
        SELECT bl.sent_at FROM batch_leads bl
        WHERE bl.lead_id = ? AND bl.status = 'sent'
        ORDER BY bl.sent_at DESC LIMIT 1
      `).get(lead.id);

      if (lastSent && lastSent.sent_at) {
        const daysSince = (Date.now() - new Date(lastSent.sent_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince >= template.delay_days) {
          eligibleLeads.push(lead);
        }
      }
    }

    if (eligibleLeads.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No leads are ready for step ${nextStep} yet. Delay is ${template.delay_days} days.`,
        activeLeadsCount: activeLeads.length,
      }, { status: 400 });
    }

    // Create a new draft batch for the next step
    const transaction = db.transaction(() => {
      const batchResult = db.prepare(
        'INSERT INTO outreach_batches (campaign_id, name, status, sequence_step) VALUES (?, ?, ?, ?)'
      ).run(campaignId, `${campaign.name} - Step ${nextStep} Batch`, 'draft', nextStep);

      const batchId = batchResult.lastInsertRowid;

      const insertEmail = db.prepare(
        'INSERT INTO batch_leads (batch_id, lead_id, subject, body, status) VALUES (?, ?, ?, ?, ?)'
      );

      for (const lead of eligibleLeads) {
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
      step: nextStep,
      leadsIncluded: eligibleLeads.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
