import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const db = getDb();
  const body = await req.json();
  const { data, campaignId } = body;

  let inserted = 0;
  let duplicates = 0;

  const insertStmt = db.prepare(`
    INSERT INTO leads (company_name, website, city, state, address, phone, generic_email, contact_name, contact_role, contact_email, source, campaign_id, pipeline_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'imported')
  `);

  const checkStmt = db.prepare(`SELECT id FROM leads WHERE company_name = ? AND (contact_email = ? OR website = ?)`);

  const transaction = db.transaction((leads) => {
    for (const lead of leads) {
      const existing = checkStmt.get(lead.company || lead.company_name, lead.email || lead.contact_email, lead.website);
      if (existing) {
        duplicates++;
        continue;
      }
      
      insertStmt.run(
        lead.company || lead.company_name,
        lead.website,
        lead.city,
        lead.state,
        lead.address,
        lead.phone,
        lead.generic_email || lead.email,
        lead.full_name || lead.contact_name,
        lead.title || lead.contact_role,
        lead.email || lead.contact_email,
        lead.source || 'CSV Import',
        campaignId
      );
      inserted++;
    }
  });

  transaction(data);

  return NextResponse.json({ success: true, inserted, duplicates });
}
