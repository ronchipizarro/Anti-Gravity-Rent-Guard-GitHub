import { getDb } from './db.js';

export function seedDatabase() {
  const db = getDb();

  // Check if campaign already exists to avoid duplicate seed
  const existingCampaign = db.prepare('SELECT id FROM campaigns LIMIT 1').get();
  if (existingCampaign) {
    console.log('Database already seeded. Skipping seed.');
    return;
  }

  console.log('Seeding database with sample active campaign...');

  // 1. Insert Campaign
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (name, geography, company_type, icp_notes, target_roles, language, sequence_length, batch_size, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campaignResult = insertCampaign.run(
    'Florida Q1 Broker Outreach',
    'Florida',
    'residential rental brokers',
    'Agencies managing 100+ doors missing modern tech tools',
    'CEO, Owner, Commercial Director, Partnerships, Broker',
    'English',
    5,
    50,
    'active'
  );

  const campaignId = campaignResult.lastInsertRowid;

  // 2. Insert mock leads
  const leads = [
    {
      company_name: 'Sunshine Realty Group',
      website: 'sunshinerealty-fl.example.com',
      city: 'Miami',
      state: 'FL',
      address: '123 Ocean Drive, Miami FL',
      phone: '305-555-0101',
      generic_email: 'hello@sunshinerealty-fl.example.com',
      contact_name: 'Sarah Jenkins',
      contact_role: 'Owner',
      contact_email: 'sarah.j@sunshinerealty-fl.example.com',
      linkedin_url: 'https://linkedin.com/in/sarah-jenkins-mock',
      source: 'manual_seed',
      notes: 'High priority, managing 250 units',
      enrichment_status: 'enriched',
      pipeline_status: 'queued'
    },
    {
      company_name: 'Orlando Property Pros',
      website: 'orlandoprops.example.com',
      city: 'Orlando',
      state: 'FL',
      address: '445 Theme Park Way',
      phone: '407-555-0202',
      generic_email: 'info@orlandoprops.example.com',
      contact_name: 'Michael Chen',
      contact_role: 'Commercial Director',
      contact_email: 'm.chen@orlandoprops.example.com',
      linkedin_url: '',
      source: 'manual_seed',
      notes: 'Need to verify email',
      enrichment_status: 'needs_review',
      pipeline_status: 'imported'
    },
    {
      company_name: 'Gulf Coast Rentals',
      website: 'gulfcoastrentals-fl.example.com',
      city: 'Tampa',
      state: 'FL',
      address: '778 Bay Blvd, Tampa FL',
      phone: '813-555-0303',
      generic_email: 'contact@gulfcoastrentals-fl.example.com',
      contact_name: 'David Rodriguez',
      contact_role: 'CEO',
      contact_email: 'david@gulfcoastrentals-fl.example.com',
      linkedin_url: 'https://linkedin.com/in/david-rodriguez-mock',
      source: 'manual_seed',
      notes: 'Met at FL convention 2025',
      enrichment_status: 'enriched',
      pipeline_status: 'approved'
    }
  ];

  const insertLead = db.prepare(`
    INSERT INTO leads (
      company_name, website, city, state, address, phone, generic_email,
      contact_name, contact_role, contact_email, linkedin_url, source, notes,
      enrichment_status, pipeline_status, campaign_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const lead of leads) {
    insertLead.run(
      lead.company_name,
      lead.website,
      lead.city,
      lead.state,
      lead.address,
      lead.phone,
      lead.generic_email,
      lead.contact_name,
      lead.contact_role,
      lead.contact_email,
      lead.linkedin_url,
      lead.source,
      lead.notes,
      lead.enrichment_status,
      lead.pipeline_status,
      campaignId
    );
  }

  console.log('Seed completed successfully!');
}
