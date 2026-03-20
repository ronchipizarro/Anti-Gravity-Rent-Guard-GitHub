import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db;

export function getDb() {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'lead-gen.db');
  db = new Database(dbPath);

  // Initialize tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      geography TEXT,
      company_type TEXT,
      icp_notes TEXT,
      target_roles TEXT,
      language TEXT,
      sequence_length INTEGER DEFAULT 5,
      batch_size INTEGER DEFAULT 50,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      website TEXT,
      city TEXT,
      state TEXT,
      address TEXT,
      phone TEXT,
      generic_email TEXT,
      contact_name TEXT,
      contact_role TEXT,
      contact_email TEXT,
      linkedin_url TEXT,
      source TEXT,
      notes TEXT,
      enrichment_status TEXT DEFAULT 'new',
      pipeline_status TEXT DEFAULT 'imported',
      campaign_id INTEGER,
      strategy_summary TEXT, -- Stores generated strategies per lead/campaign
      generated_sequence TEXT, -- Stores JSON string space for emails generated
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT,
      lead_id INTEGER,
      campaign_id INTEGER,
      status TEXT DEFAULT 'open',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads (id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
    );

    CREATE TABLE IF NOT EXISTS email_sequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      delay_days INTEGER NOT NULL,
      subject_template TEXT NOT NULL,
      body_template TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
    );

    CREATE TABLE IF NOT EXISTS outreach_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      name TEXT,
      status TEXT DEFAULT 'draft',
      sequence_step INTEGER DEFAULT 1,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
    );

    CREATE TABLE IF NOT EXISTS batch_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      lead_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      resend_id TEXT,
      sent_at DATETIME,
      FOREIGN KEY (batch_id) REFERENCES outreach_batches (id),
      FOREIGN KEY (lead_id) REFERENCES leads (id)
    );
  `);

  // Migrations for new columns on existing tables
  const campaignCols = db.prepare("PRAGMA table_info(campaigns)").all().map(c => c.name);
  if (!campaignCols.includes('sender_name')) {
    db.exec("ALTER TABLE campaigns ADD COLUMN sender_name TEXT");
  }
  if (!campaignCols.includes('sender_email')) {
    db.exec("ALTER TABLE campaigns ADD COLUMN sender_email TEXT");
  }

  const leadCols = db.prepare("PRAGMA table_info(leads)").all().map(c => c.name);
  if (!leadCols.includes('outreach_status')) {
    db.exec("ALTER TABLE leads ADD COLUMN outreach_status TEXT DEFAULT NULL");
  }
  if (!leadCols.includes('current_sequence_step')) {
    db.exec("ALTER TABLE leads ADD COLUMN current_sequence_step INTEGER DEFAULT 0");
  }

  return db;
}
