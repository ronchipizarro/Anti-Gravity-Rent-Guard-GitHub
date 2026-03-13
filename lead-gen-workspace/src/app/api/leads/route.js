import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const city = searchParams.get('city');

    const db = getDb();
    
    let query = 'SELECT leads.*, campaigns.name as campaign_name FROM leads LEFT JOIN campaigns ON leads.campaign_id = campaigns.id WHERE 1=1';
    const params = [];

    if (campaignId) {
      query += ' AND campaign_id = ?';
      params.push(campaignId);
    }
    if (status) {
      query += ' AND pipeline_status = ?';
      params.push(status);
    }
    if (city) {
      query += ' AND city LIKE ?';
      params.push(`%${city}%`);
    }

    query += ' ORDER BY leads.created_at DESC';

    const leads = db.prepare(query).all(...params);

    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
