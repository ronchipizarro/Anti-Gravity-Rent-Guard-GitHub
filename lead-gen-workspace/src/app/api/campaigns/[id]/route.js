import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const db = getDb();
  const id = params.id;
  
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
  if (!campaign) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const leads = db.prepare('SELECT * FROM leads WHERE campaign_id = ?').all(id);
  
  // Strategy mock if not generated
  let strategy = campaign.strategy_summary ? JSON.parse(campaign.strategy_summary) : {
    valueProp: "Automated rent protection for property managers in " + campaign.geography,
    angle: "Financial security and tenant peace of mind",
    objections: ["Implementation cost", "Tenant data privacy", "Process complexity"]
  };

  // Sequence mock if not generated
  let sequence = campaign.generated_sequence ? JSON.parse(campaign.generated_sequence) : [
    { day: 1, subject: "Quick question about ${campaign.geography} listings", body: "Hi {{name}},nnI saw your listings and wanted to ask..." },
    { day: 3, subject: "Following up", body: "Wanted to see if you had a chance to look at my previous email..." }
  ];

  return NextResponse.json({ success: true, campaign, leads, strategy, sequence });
}

export async function PATCH(req, { params }) {
  const db = getDb();
  const id = params.id;
  const body = await req.json();
  const { status } = body;

  db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run(status, id);
  return NextResponse.json({ success: true });
}
