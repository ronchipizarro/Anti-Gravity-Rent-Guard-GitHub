'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CampaignDetailPage({ params }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/campaigns/${params.id}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!confirm('This will approve the campaign and queue all leads for contact. Continue?')) return;
    
    try {
      await fetch(`/api/campaigns/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      fetchCampaign();
    } catch (e) {
      alert('Failed to approve campaign');
    }
  }

  if (loading) return <div style={{ padding: 'var(--space-8)' }}>Loading campaign details...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)' }}>Campaign not found.</div>;

  const { campaign, leads, strategy, sequence } = data;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">{campaign.name}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            Targeting {campaign.geography} • {leads.length} leads
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <span className={`badge badge-${campaign.status === 'approved' ? 'success' : campaign.status === 'active' ? 'primary' : 'warning'}`} style={{ fontSize: '1rem', padding: '0.25rem 1rem' }}>
            {campaign.status}
          </span>
          {campaign.status !== 'approved' && (
            <button className="btn btn-primary" onClick={handleApprove}>
              Review & Approve Campaign
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Strategy Summary */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Generated Campaign Strategy</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--space-1)' }}>Value Proposition</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{strategy.valueProp}</p>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--space-1)' }}>Core Angle</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{strategy.angle}</p>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: 'var(--space-1)' }}>Expected Objections</strong>
              <ul style={{ color: 'var(--text-muted)', fontSize: '0.875rem', paddingLeft: 'var(--space-4)' }}>
                {strategy.objections.map((obj, i) => <li key={i}>{obj}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Sequence Preview */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Email Sequence Preview</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '400px', overflowY: 'auto' }}>
            {sequence.map((email, i) => (
              <div key={i} style={{ padding: 'var(--space-3)', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Day {email.day}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Subject: {email.subject}</span>
                </div>
                <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
                  {email.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Campaign Leads</h2>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lead.company_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.website}</div>
                  </td>
                  <td>
                    <div>{lead.contact_name || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.contact_email}</div>
                  </td>
                  <td>{lead.contact_role}</td>
                  <td>
                    <span className={`badge badge-${lead.pipeline_status === 'approved' ? 'success' : 'neutral'}`}>
                      {lead.pipeline_status}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
                    No leads imported yet. Go to Leads section to upload CSV.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
