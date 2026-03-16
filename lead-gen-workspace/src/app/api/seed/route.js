import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = getDb();

  // Clear existing data for fresh seed
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM leads').run();
  db.prepare('DELETE FROM campaigns').run();

  // Seed Campaign
  const campaign = db.prepare(`
    INSERT INTO campaigns (name, geography, company_type, status)
    VALUES (?, ?, ?, ?)
  `).run('Florida Expansion - Miami', 'Miami, FL', 'Real Estate Agencies', 'active');

  const campaignId = campaign.lastInsertRowid;

  // Seed Leads
  const leads = [
    { name: 'Miami Homes & Rent', email: 'contact@miamihomes.com', city: 'Miami', role: 'Property Manager' },
    { name: 'Sunshine Realty', email: 'info@sunshinerealty.com', city: 'Miami', role: 'Agency Director' },
    { name: 'Dade County Properties', email: 'leads@dadecounty.com', city: 'Miami', role: 'Broker' }
  ];

  const insertLead = db.prepare(`
    INSERT INTO leads (company_name, contact_email, city, contact_role, campaign_id, pipeline_status)
    VALUES (?, ?, ?, ?, ?, 'imported')
  `);

  for (const lead of leads) {
    insertLead.run(lead.name, lead.email, lead.city, lead.role, campaignId);
  }

  // Seed Tasks
  db.prepare(`
    INSERT INTO tasks (title, type, status)
    VALUES (?, ?, ?)
  `).run('Contact Miami Homes & Rent', 'outreach', 'open');

  return NextResponse.json({ success: true, message: 'Database seeded successfully' });
}
