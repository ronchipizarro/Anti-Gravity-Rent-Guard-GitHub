'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convert numerical values
    data.sequence_length = parseInt(data.sequence_length, 10);
    data.batch_size = parseInt(data.batch_size, 10);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        router.push('/campaigns/' + result.id);
      } else {
        alert('Failed to create campaign: ' + result.error);
      }
    } catch (err) {
      alert('Error creating campaign');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create New Campaign</h1>
      </div>

      <div className="card">
        <form className="card-body" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label" htmlFor="name">Campaign Name</label>
              <input required id="name" name="name" className="input" placeholder="e.g. Florida Q1 Outreach" />
            </div>
            <div>
              <label className="label" htmlFor="geography">Geography / Zone</label>
              <input required id="geography" name="geography" className="input" placeholder="e.g. Florida" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label" htmlFor="company_type">Company Type</label>
              <input required id="company_type" name="company_type" className="input" placeholder="e.g. Enterprise SaaS, Real Estate" />
            </div>
            <div>
              <label className="label" htmlFor="target_roles">Target Roles (comma separated)</label>
              <input required id="target_roles" name="target_roles" className="input" placeholder="e.g. CEO, CTO, VP Engineering" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="icp_notes">ICP / Ideal Customer Profile Notes</label>
            <textarea id="icp_notes" name="icp_notes" className="textarea" placeholder="Describe the problem they have or specific qualifications..."></textarea>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="label" htmlFor="language">Language</label>
              <select id="language" name="language" className="select" defaultValue="English">
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="sequence_length">Sequence Length</label>
              <input required id="sequence_length" name="sequence_length" type="number" min="1" max="10" defaultValue="5" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="batch_size">Daily Batch Size</label>
              <input required id="batch_size" name="batch_size" type="number" min="1" max="500" defaultValue="50" className="input" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
            <button type="button" onClick={() => router.back()} className="btn" style={{ marginRight: 'var(--space-4)' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Creating...' : 'Create Campaign'}</button>
          </div>

        </form>
      </div>
    </div>
  );
}
