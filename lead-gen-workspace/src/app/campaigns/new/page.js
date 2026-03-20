'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    geography: '',
    company_type: '',
    icp_notes: '',
    target_roles: '',
    language: 'English',
    sender_name: '',
    sender_email: '',
    sequence_length: 5,
    batch_size: 50,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert('Campaign name is required.');
    setSaving(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/campaigns/${data.id}`);
      } else {
        alert('Failed to create campaign: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Error creating campaign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create New Campaign</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Campaign Details */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Campaign Details</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label">Campaign Name *</label>
                <input name="name" className="input" value={form.name} onChange={handleChange} placeholder="e.g. Q2 Outreach - Property Managers" required />
              </div>
              <div>
                <label className="label">Geography</label>
                <input name="geography" className="input" value={form.geography} onChange={handleChange} placeholder="e.g. Miami, New York, London" />
              </div>
              <div>
                <label className="label">Company Type</label>
                <input name="company_type" className="input" value={form.company_type} onChange={handleChange} placeholder="e.g. SaaS, Real Estate, Fintech" />
              </div>
              <div>
                <label className="label">Target Roles</label>
                <input name="target_roles" className="input" value={form.target_roles} onChange={handleChange} placeholder="e.g. CEO, VP Sales, Property Manager" />
              </div>
              <div>
                <label className="label">ICP Notes</label>
                <textarea name="icp_notes" className="input" value={form.icp_notes} onChange={handleChange} rows={3} placeholder="Describe your ideal customer profile..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="label">Language</label>
                <select name="language" className="select" value={form.language} onChange={handleChange}>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sender & Settings */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Sender & Settings</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="label">Sender Name</label>
                <input name="sender_name" className="input" value={form.sender_name} onChange={handleChange} placeholder="e.g. Your Name or Company Name" />
              </div>
              <div>
                <label className="label">Sender Email</label>
                <input name="sender_email" className="input" type="email" value={form.sender_email} onChange={handleChange} placeholder="e.g. outreach@yourdomain.com" />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>Must be a verified domain in Resend</p>
              </div>
              <div>
                <label className="label">Sequence Length</label>
                <input name="sequence_length" className="input" type="number" min={1} max={10} value={form.sequence_length} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Batch Size</label>
                <input name="batch_size" className="input" type="number" min={1} max={500} value={form.batch_size} onChange={handleChange} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>Max leads per batch send</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : 'Create Campaign'}
          </button>
          <button type="button" className="btn" onClick={() => router.push('/campaigns')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
