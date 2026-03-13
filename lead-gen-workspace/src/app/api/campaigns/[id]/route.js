import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateMockStrategy(campaign) {
  return {
    targetSummary: \`Targeting \${campaign.target_roles} at \${campaign.company_type} in \${campaign.geography}.\`,
    angle: \`Focus on reducing operational bottlenecks using our local expertise and automation.\`,
    valueProp: \`We help \${campaign.company_type} scale without adding headcount.\`,
    objections: [\`We already have a system in place\`, \`Too expensive right now\`, \`Implementation takes too long\`],
    cta: \`Are you open to a brief 10-minute introduction call next Tuesday?\`
  };
}

function generateMockSequence(campaign, leadPlaceholder = { first_name: '{{first_name}}', company: '{{company_name}}' }) {
  const cta = \`Are you open to a brief 10-minute introduction call next Tuesday?\`;
  
  return [
    {
      day: 1,
      subject: \`Quick question about \${leadPlaceholder.company}'s growth\`,
      body: \`Hi \${leadPlaceholder.first_name},\\n\\nI noticed \${leadPlaceholder.company} is expanding in \${campaign.geography} and thought I'd reach out. We help \${campaign.company_type} scale without adding headcount.\\n\\n\${cta}\\n\\nBest,\\nAlex\`
    },
    {
      day: 2,
      subject: \`Re: Quick question about \${leadPlaceholder.company}'s growth\`,
      body: \`Hi \${leadPlaceholder.first_name},\\n\\nFollowing up on my last note. One of our partners recently automated 30% of their workflow using our strategy. Would love to share how they did it.\\n\\nThoughts?\\n\\nBest,\\nAlex\`
    },
    {
      day: 4,
      subject: \`Any thoughts?\`,
      body: \`Hi \${leadPlaceholder.first_name},\\n\\nI know things can get busy. If this isn't the right time, just let me know.\\n\\nBest,\\nAlex\`
    },
    {
      day: 5,
      subject: \`Final follow up\`,
      body: \`Hi \${leadPlaceholder.first_name},\\n\\nI'll stop reaching out for now. If reducing operational bottlenecks becomes a priority for \${leadPlaceholder.company} later this year, feel free to pull this email up.\\n\\nThanks,\\nAlex\`
    }
  ];
}

export async function GET(request, { params }) {
  try {
    const db = getDb();
    const campaignId = params.id;

    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const leads = db.prepare('SELECT * FROM leads WHERE campaign_id = ? ORDER BY created_at DESC').all(campaignId);
    
    // Mock strategy and sequence for demonstration
    const strategy = generateMockStrategy(campaign);
    const sequence = generateMockSequence(campaign);

    return NextResponse.json({ success: true, campaign, leads, strategy, sequence });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { status } = await request.json();
    const db = getDb();
    const campaignId = params.id;

    db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run(status, campaignId);

    // If approved, update all queued/imported leads to approved for this MVP
    if (status === 'approved') {
      db.prepare("UPDATE leads SET pipeline_status = 'approved' WHERE campaign_id = ? AND pipeline_status IN ('queued', 'imported')").run(campaignId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
