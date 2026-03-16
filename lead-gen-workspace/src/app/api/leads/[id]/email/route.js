import { getDb } from '@/lib/db';
import { sendOutreachEmail } from '@/lib/resend';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const db = getDb();
    const leadId = params.id;
    const body = await req.json();
    const { emailIndex = 0 } = body; // Which email in the sequence to send

    // 1. Fetch Lead
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
    if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });

    // 2. Fetch Campaign
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(lead.campaign_id);
    if (!campaign) return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });

    // 3. Get Sequence
    let sequence = [];
    if (campaign.generated_sequence) {
      sequence = JSON.parse(campaign.generated_sequence);
    } else {
      // Fallback mock sequence if not generated
      sequence = [
        { 
          day: 1, 
          subject: 'Quick question about {{city}} properties', 
          body: 'Hi {{name}},\n\nI noticed you manage properties in {{city}} and wanted to see if you are open to a new way to guarantee rent.\n\nBest,\nRentGuard Team' 
        }
      ];
    }

    if (emailIndex >= sequence.length) {
      return NextResponse.json({ success: false, error: 'Email index out of bounds' }, { status: 400 });
    }

    const emailTemplate = sequence[emailIndex];

    // 4. Personalize Variables
    const personalize = (text) => {
      if (!text) return '';
      return text
        .replace(/\{\{name\}\}/g, lead.contact_name || lead.company_name || 'there')
        .replace(/\{\{company\}\}/g, lead.company_name || 'your company')
        .replace(/\{\{city\}\}/g, lead.city || 'your area');
    };

    const subject = personalize(emailTemplate.subject);
    const htmlBody = personalize(emailTemplate.body);
    const toEmail = lead.contact_email || lead.generic_email;

    if (!toEmail) {
      return NextResponse.json({ success: false, error: 'Lead missing email address' }, { status: 400 });
    }

    // 5. Send Email via Resend
    const result = await sendOutreachEmail({
      to: toEmail,
      subject: subject,
      body: htmlBody
    });

    if (result.success) {
      // Update Lead Status
      db.prepare('UPDATE leads SET pipeline_status = ? WHERE id = ?').run('contacted', lead.id);
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
