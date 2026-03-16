'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title">Campaigns</h1>
        <Link href="/campaigns/new" className="btn btn-primary">
          + New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No campaigns found. Create one to get started!
          </div>
        ) : (
          campaigns.map(campaign => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ transition: 'border-color 200ms', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-1)' }}>{campaign.name}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Targeting {campaign.geography} • {campaign.company_type}</p>
                  </div>
                  <div>
                    <span className={`badge badge-${campaign.status === 'approved' ? 'success' : campaign.status === 'active' ? 'primary' : 'warning'}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
