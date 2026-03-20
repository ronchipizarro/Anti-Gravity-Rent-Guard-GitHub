'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OutreachPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  async function fetchBatches() {
    try {
      const res = await fetch('/api/outreach/batches');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const totalSent = batches.reduce((sum, b) => sum + (b.sent_count || 0), 0);
  const totalPending = batches.filter(b => b.status === 'draft' || b.status === 'approved').length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Outreach</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Total Batches', value: batches.length },
          { label: 'Emails Sent', value: totalSent },
          { label: 'Pending Batches', value: totalPending },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Batches Table */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>All Batches</h2>
        </div>
        <div className="table-container">
          {loading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : batches.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
              No outreach batches yet. Create one from a campaign page.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Campaign</th>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Leads</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr key={batch.id} style={{ opacity: batch.status === 'sent' ? 0.7 : 1 }}>
                    <td style={{ fontWeight: 500 }}>{batch.name || `Batch #${batch.id}`}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{batch.campaign_name}</td>
                    <td>{batch.sequence_step}</td>
                    <td>
                      <span className={`badge badge-${batch.status === 'sent' ? 'success' : batch.status === 'approved' ? 'primary' : batch.status === 'sending' ? 'primary' : 'warning'}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td>{batch.lead_count}</td>
                    <td>{batch.sent_count || 0}</td>
                    <td>{batch.failed_count || 0}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(batch.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => router.push(`/outreach/${batch.id}`)}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
