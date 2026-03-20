import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const db = getDb();
  const { id } = await params;
  
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  if (!campaign) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const leads = db.prepare('SELECT * FROM leads WHERE campaign_id = ?').all(id);

  // Strategy mock if not generated
  let strategy = campaign.strategy_summary ? JSON.parse(campaign.strategy_summary) : {
    valueProp: "Automated outreach for " + (campaign.geography || 'your target market'),
    angle: "Direct value proposition to decision makers",
    objections: ["Budget concerns", "Existing solutions", "Timing"]
  };

  // Load real sequences from email_sequences table
  const sequenceSteps = db.prepare(
    'SELECT * FROM email_sequences WHERE campaign_id = ? ORDER BY step_number ASC'
  ).all(id);

  // Map to the format the UI expects, fall back to mock if none defined
  let sequence = sequenceSteps.length > 0
    ? sequenceSteps.map(s => ({ day: s.delay_days, subject: s.subject_template, body: s.body_template, step: s.step_number }))
    : [
        { day: 1, step: 1, subject: "Quick question about {{city}}", body: "Hi {{name}},\n\nI wanted to reach out about an opportunity in {{city}}.\n\nBest regards" },
        { day: 3, step: 2, subject: "Following up", body: "Hi {{name}},\n\nWanted to see if you had a chance to look at my previous email.\n\nBest regards" }
      ];

  // Load batches for this campaign
  const batches = db.prepare(`
    SELECT ob.*,
      COUNT(bl.id) as lead_count,
      SUM(CASE WHEN bl.status = 'sent' THEN 1 ELSE 0 END) as sent_count
    FROM outreach_batches ob
    LEFT JOIN batch_leads bl ON bl.batch_id = ob.id
    WHERE ob.campaign_id = ?
    GROUP BY ob.id
    ORDER BY ob.created_at DESC
  `).all(id);

  return NextResponse.json({ success: true, campaign, leads, strategy, sequence, sequenceSteps, batches });
}

export async function PATCH(req, { params }) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run(status, id);
  return NextResponse.json({ success: true });
}
