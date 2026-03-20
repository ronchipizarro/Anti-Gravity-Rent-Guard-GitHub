import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'campaignId required' }, { status: 400 });
    }

    const steps = db.prepare(
      'SELECT * FROM email_sequences WHERE campaign_id = ? ORDER BY step_number ASC'
    ).all(campaignId);

    return NextResponse.json({ success: true, steps });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const db = getDb();
    const { campaignId, steps } = await req.json();

    if (!campaignId || !steps || !steps.length) {
      return NextResponse.json({ success: false, error: 'campaignId and steps[] required' }, { status: 400 });
    }

    const transaction = db.transaction(() => {
      // Clear existing steps for this campaign
      db.prepare('DELETE FROM email_sequences WHERE campaign_id = ?').run(campaignId);

      const insert = db.prepare(
        'INSERT INTO email_sequences (campaign_id, step_number, delay_days, subject_template, body_template) VALUES (?, ?, ?, ?, ?)'
      );

      for (const step of steps) {
        insert.run(campaignId, step.step_number, step.delay_days, step.subject_template, step.body_template);
      }
    });

    transaction();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
