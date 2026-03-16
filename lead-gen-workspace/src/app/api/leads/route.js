import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const status = searchParams.get('status');
  const campaignId = searchParams.get('campaignId');

  let query = 'SELECT leads.*, campaigns.name as campaign_name FROM leads LEFT JOIN campaigns ON leads.campaign_id = campaigns.id WHERE 1=1';
  let params = [];

  if (city) {
    query += ' AND leads.city LIKE ?';
    params.push(`%${city}%`);
  }
  if (status) {
    query += ' AND leads.pipeline_status = ?';
    params.push(status);
  }
  if (campaignId) {
    query += ' AND leads.campaign_id = ?';
    params.push(campaignId);
  }

  query += ' ORDER BY leads.created_at DESC LIMIT 500';
  const leads = db.prepare(query).all(...params);
  
  return NextResponse.json({ success: true, leads });
}
