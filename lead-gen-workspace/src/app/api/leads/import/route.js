import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function normalize(str) {
  return (str || '').toString().toLowerCase().trim();
}

function mapRowToLead(row) {
  // Try to intelligently map common CSV headers to our schema
  const getVal = (keys) => {
    for (const key of keys) {
      // Find case-insensitive match
      const matchingKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase());
      if (matchingKey && row[matchingKey]) return row[matchingKey].toString().trim();
    }
    return '';
  };

  return {
    company_name: getVal(['company name', 'company', 'organization', 'account']),
    website: getVal(['website', 'domain', 'url']),
    city: getVal(['city', 'location']),
    state: getVal(['state', 'province', 'region']),
    address: getVal(['address', 'street']),
    phone: getVal(['phone', 'phone number', 'mobile']),
    generic_email: getVal(['email', 'company email', 'info email']),
    contact_name: getVal(['contact name', 'name', 'first name', 'full name', 'person']),
    contact_role: getVal(['contact role', 'role', 'title', 'job title']),
    contact_email: getVal(['contact email', 'personal email', 'direct email']),
    linkedin_url: getVal(['linkedin', 'linkedin url', 'social']),
    notes: getVal(['notes', 'description']),
    source: 'csv_import'
  };
}

export async function POST(request) {
  try {
    const { data, campaignId } = await request.json();
    const db = getDb();

    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data format');
    }

    let inserted = 0;
    let duplicates = 0;

    const insert = db.prepare(`
      INSERT INTO leads (
        company_name, website, city, state, address, phone, generic_email,
        contact_name, contact_role, contact_email, linkedin_url, source, notes,
        enrichment_status, pipeline_status, campaign_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Using a transaction for speed
    const processUpload = db.transaction((rows) => {
      for (const row of rows) {
        // Skip entirely empty rows
        if (Object.values(row).every(v => !v)) continue;

        const lead = mapRowToLead(row);
        if (!lead.company_name && !lead.contact_name && !lead.website) continue;

        // Deduplication Check
        // Deduplicate by: company name + city OR domain OR email OR phone
        
        let isDuplicate = false;
        let duplicateNotes = '';

        if (lead.website) {
          const checkDomain = db.prepare('SELECT id FROM leads WHERE website LIKE ?').get(\`%\${lead.website}%\`);
          if (checkDomain) { isDuplicate = true; duplicateNotes = 'flag: probable duplicate (domain)'; }
        }
        if (!isDuplicate && (lead.contact_email || lead.generic_email)) {
          const emailToCheck = lead.contact_email || lead.generic_email;
          const checkEmail = db.prepare('SELECT id FROM leads WHERE contact_email = ? OR generic_email = ?').get(emailToCheck, emailToCheck);
          if (checkEmail) { isDuplicate = true; duplicateNotes = 'flag: probable duplicate (email)'; }
        }
        if (!isDuplicate && lead.phone) {
          const checkPhone = db.prepare('SELECT id FROM leads WHERE phone = ?').get(lead.phone);
          if (checkPhone) { isDuplicate = true; duplicateNotes = 'flag: probable duplicate (phone)'; }
        }
        if (!isDuplicate && lead.company_name && lead.city) {
          const checkCompanyCity = db.prepare('SELECT id FROM leads WHERE LOWER(company_name) = ? AND LOWER(city) = ?').get(normalize(lead.company_name), normalize(lead.city));
          if (checkCompanyCity) { isDuplicate = true; duplicateNotes = 'flag: probable duplicate (company+city)'; }
        }

        const combinedNotes = [lead.notes, duplicateNotes].filter(Boolean).join(' | ');

        // Always insert, but flag exact/probable duplicates
        // Requirements say "Flag probable duplicates for review."
        const enrichmentStatus = isDuplicate ? 'needs_review' : 'new';
        
        insert.run(
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
          combinedNotes,
          enrichmentStatus,
          'imported', // pipeline
          campaignId || null
        );

        if (isDuplicate) {
          duplicates++;
        } else {
          inserted++;
        }
      }
    });

    processUpload(data);

    return NextResponse.json({ success: true, inserted, duplicates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
