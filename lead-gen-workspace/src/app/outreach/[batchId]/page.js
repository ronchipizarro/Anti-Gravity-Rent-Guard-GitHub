'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BatchReviewPage({ params }) {
  const router = useRouter();
  const { batchId } = React.use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchBatch();
  }, [batchId]);

  async function fetchBatch() {
    try {
      const res = await fetch(`/api/outreach/batches/${batchId}`);
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
    if (!confirm('Approve this batch? You can then send all emails.')) return;
    try {
      const res = await fetch(`/api/outreach/batches/${batchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      const result = await res.json();
      if (result.success) fetchBatch();
      else alert('Failed to approve: ' + result.error);
    } catch (e) {
      alert('Error approving batch');
    }
  }

  async function handleSend() {
    if (!confirm('This will send all pending emails in this batch. Continue?')) return;
    setSending(true);
    try {
      const res = await fetch('/api/outreach/send-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`Sent: ${result.sent}, Failed: ${result.failed}`);
        fetchBatch();
      } else {
        alert('Send failed: ' + result.error);
      }
    } catch (e) {
      alert('Error sending batch');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this batch? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/outreach/batches/${batchId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        router.push('/outreach');
      } else {
        alert('Failed to delete: ' + result.error);
      }
    } catch (e) {
      alert('Error deleting batch');
    }
  }

  if (loading) return <div style={{ padding: 'var(--space-8)' }}>Loading batch...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)' }}>Batch not found.</div>;

  const { batch, emails } = data;
  const pendingCount = emails.filter(e => e.status === 'pending').length;
  const sentCount = emails.filter(e => e.status === 'sent').length;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">{batch.name || `Batch #${batch.id}`}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            {batch.campaign_name} &bull; Step {batch.sequence_step} &bull; {emails.length} emails
            {batch.sender_email && <> &bull; From: {batch.sender_name || batch.sender_email}</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <span className={`badge badge-${batch.status === 'sent' ? 'success' : batch.status === 'approved' ? 'primary' : 'warning'}`} style={{ fontSize: '1rem', padding: '0.25rem 1rem' }}>
            {batch.status}
          </span>
          {batch.status === 'draft' && (
            <>
              <button className="btn btn-primary" onClick={handleApprove}>Approve Batch</button>
              <button className="btn" onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
            </>
          )}
          {batch.status === 'approved' && (
            <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : `Send ${pendingCount} Emails`}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Pending', value: pendingCount },
          { label: 'Sent', value: sentCount },
          { label: 'Failed', value: emails.filter(e => e.status === 'failed').length },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Email Previews */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Email Previews</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
          {emails.map(email => (
            <div key={email.id} style={{
              padding: 'var(--space-4)',
              backgroundColor: email.status === 'sent' ? '#f0fdf4' : email.status === 'failed' ? '#fef2f2' : '#f9fafb',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              opacity: email.status === 'sent' ? 0.8 : 1,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <div>
                  <strong>{email.contact_name || 'Unknown'}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)', fontSize: '0.875rem' }}>
                    {email.contact_email || email.generic_email}
                  </span>
                </div>
                <span className={`badge badge-${email.status === 'sent' ? 'success' : email.status === 'failed' ? 'warning' : 'neutral'}`}>
                  {email.status}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                Subject: {email.subject}
              </div>
              <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', color: 'var(--text-main)', maxHeight: '120px', overflow: 'hidden' }}>
                {email.body}
              </div>
              {email.company_name && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                  {email.company_name} &bull; {email.contact_role || 'N/A'} &bull; {email.city || 'N/A'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
