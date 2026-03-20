'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CampaignDetailPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);

  // Sequence editor state
  const [editingSequence, setEditingSequence] = useState(false);
  const [sequenceForm, setSequenceForm] = useState([]);
  const [savingSequence, setSavingSequence] = useState(false);

  // Batch creation state
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [batchStep, setBatchStep] = useState(1);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  async function fetchCampaign() {
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
        // Initialize sequence form from real data
        if (result.sequenceSteps && result.sequenceSteps.length > 0) {
          setSequenceForm(result.sequenceSteps.map(s => ({
            step_number: s.step_number,
            delay_days: s.delay_days,
            subject_template: s.subject_template,
            body_template: s.body_template,
          })));
        }
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
      await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      fetchCampaign();
    } catch (e) {
      alert('Failed to approve campaign');
    }
  }

  async function handleScrape() {
    setScraping(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, geography: campaign.geography })
      });
      const result = await res.json();
      if (result.success) {
        alert('Scrape completed! Leads are being processed.');
        fetchCampaign();
      } else {
        alert('Scrape failed: ' + result.error);
      }
    } catch (e) {
      alert('Error triggering scrape');
    } finally {
      setScraping(false);
    }
  }

  // --- Sequence Management ---
  function addSequenceStep() {
    const nextStep = sequenceForm.length + 1;
    setSequenceForm([...sequenceForm, {
      step_number: nextStep,
      delay_days: nextStep === 1 ? 0 : 3,
      subject_template: '',
      body_template: '',
    }]);
  }

  function updateSequenceStep(index, field, value) {
    const updated = [...sequenceForm];
    updated[index] = { ...updated[index], [field]: value };
    setSequenceForm(updated);
  }

  function removeSequenceStep(index) {
    const updated = sequenceForm.filter((_, i) => i !== index);
    // Renumber steps
    updated.forEach((s, i) => { s.step_number = i + 1; });
    setSequenceForm(updated);
  }

  async function saveSequence() {
    if (sequenceForm.length === 0) return alert('Add at least one step.');
    const incomplete = sequenceForm.find(s => !s.subject_template.trim() || !s.body_template.trim());
    if (incomplete) return alert('All steps must have a subject and body.');

    setSavingSequence(true);
    try {
      const res = await fetch('/api/outreach/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, steps: sequenceForm }),
      });
      const result = await res.json();
      if (result.success) {
        setEditingSequence(false);
        fetchCampaign();
      } else {
        alert('Failed to save: ' + result.error);
      }
    } catch (e) {
      alert('Error saving sequence');
    } finally {
      setSavingSequence(false);
    }
  }

  // --- Batch Management ---
  async function handleCreateBatch() {
    if (selectedLeads.length === 0) return alert('Select at least one lead.');

    setCreatingBatch(true);
    try {
      const res = await fetch('/api/outreach/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, leadIds: selectedLeads, sequenceStep: batchStep }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`Batch created with ${result.leadsIncluded} leads. Review it before sending.`);
        setSelectedLeads([]);
        fetchCampaign();
      } else {
        alert('Failed: ' + result.error);
      }
    } catch (e) {
      alert('Error creating batch');
    } finally {
      setCreatingBatch(false);
    }
  }

  async function handleSendBatch(batchId) {
    if (!confirm('This will send all approved emails in this batch. Continue?')) return;
    try {
      const res = await fetch('/api/outreach/send-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`Batch sent! ${result.sent} sent, ${result.failed} failed.`);
        fetchCampaign();
      } else {
        alert('Send failed: ' + result.error);
      }
    } catch (e) {
      alert('Error sending batch');
    }
  }

  async function handleAdvanceSequence() {
    try {
      const res = await fetch('/api/outreach/advance-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`New batch created for step ${result.step} with ${result.leadsIncluded} leads.`);
        fetchCampaign();
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert('Error advancing sequence');
    }
  }

  function toggleLeadSelection(leadId) {
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  }

  function selectAllApproved() {
    const approved = leads.filter(l => l.pipeline_status === 'approved' && (l.contact_email || l.generic_email));
    setSelectedLeads(approved.map(l => l.id));
  }

  if (loading) return <div style={{ padding: 'var(--space-8)' }}>Loading campaign details...</div>;
  if (!data) return <div style={{ padding: 'var(--space-8)' }}>Campaign not found.</div>;

  const { campaign, leads, strategy, sequence, batches = [] } = data;

  // Outreach stats
  const totalSent = batches.reduce((sum, b) => sum + (b.sent_count || 0), 0);
  const totalLeadsInBatches = batches.reduce((sum, b) => sum + (b.lead_count || 0), 0);
  const repliedCount = leads.filter(l => l.outreach_status === 'replied').length;
  const approvedLeads = leads.filter(l => l.pipeline_status === 'approved');

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">{campaign.name}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            Targeting {campaign.geography || 'All'} &bull; {leads.length} leads
            {campaign.sender_email && <> &bull; Sending as {campaign.sender_name || campaign.sender_email}</>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          <span className={`badge badge-${campaign.status === 'approved' ? 'success' : campaign.status === 'active' ? 'primary' : 'warning'}`} style={{ fontSize: '1rem', padding: '0.25rem 1rem' }}>
            {campaign.status}
          </span>
          <button className="btn" onClick={handleScrape} disabled={scraping} style={{ backgroundColor: scraping ? 'var(--neutral)' : 'var(--text-main)', color: 'white' }}>
            {scraping ? 'Scraping...' : 'Launch Lead Scraper'}
          </button>
          {campaign.status !== 'approved' && (
            <button className="btn btn-primary" onClick={handleApprove}>
              Review & Approve Campaign
            </button>
          )}
        </div>
      </div>

      {/* Outreach Stats */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: 'var(--space-6)' }}>
        {[
          { label: 'Approved Leads', value: approvedLeads.length },
          { label: 'Emails Sent', value: totalSent },
          { label: 'Replied', value: repliedCount },
          { label: 'Batches', value: batches.length },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {/* Strategy Summary */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Campaign Strategy</h2>
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

        {/* Email Sequence Editor / Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Email Sequence</h2>
            <button className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={() => {
              if (!editingSequence && sequenceForm.length === 0) {
                // Pre-populate from current sequence preview
                setSequenceForm(sequence.map((s, i) => ({
                  step_number: s.step || i + 1,
                  delay_days: s.day || 0,
                  subject_template: s.subject || '',
                  body_template: s.body || '',
                })));
              }
              setEditingSequence(!editingSequence);
            }}>
              {editingSequence ? 'Cancel' : 'Edit Sequence'}
            </button>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '500px', overflowY: 'auto' }}>
            {editingSequence ? (
              <>
                {sequenceForm.map((step, i) => (
                  <div key={i} style={{ padding: 'var(--space-3)', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Step {step.step_number}</span>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem' }}>Delay (days):</label>
                        <input type="number" min={0} value={step.delay_days} onChange={(e) => updateSequenceStep(i, 'delay_days', parseInt(e.target.value) || 0)} className="input" style={{ width: '60px', padding: '0.25rem' }} />
                        <button onClick={() => removeSequenceStep(i)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1rem' }}>x</button>
                      </div>
                    </div>
                    <input placeholder="Subject line (use {{name}}, {{company}}, {{city}})" value={step.subject_template} onChange={(e) => updateSequenceStep(i, 'subject_template', e.target.value)} className="input" style={{ marginBottom: 'var(--space-2)', fontSize: '0.875rem' }} />
                    <textarea placeholder="Email body..." value={step.body_template} onChange={(e) => updateSequenceStep(i, 'body_template', e.target.value)} className="input" rows={4} style={{ fontSize: '0.875rem', resize: 'vertical' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn" onClick={addSequenceStep}>+ Add Step</button>
                  <button className="btn btn-primary" onClick={saveSequence} disabled={savingSequence}>
                    {savingSequence ? 'Saving...' : 'Save Sequence'}
                  </button>
                </div>
              </>
            ) : (
              sequence.map((email, i) => (
                <div key={i} style={{ padding: 'var(--space-3)', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Day {email.day}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Subject: {email.subject}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-line', color: 'var(--text-main)' }}>
                    {email.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Batch Management */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Outreach Batches</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button className="btn" onClick={handleAdvanceSequence} style={{ fontSize: '0.875rem' }}>
              Advance to Next Step
            </button>
          </div>
        </div>

        {/* Create Batch Controls */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={selectAllApproved} style={{ fontSize: '0.875rem' }}>
            Select All Approved ({approvedLeads.length})
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: '0.875rem' }}>Sequence Step:</label>
            <input type="number" min={1} value={batchStep} onChange={e => setBatchStep(parseInt(e.target.value) || 1)} className="input" style={{ width: '60px', padding: '0.25rem' }} />
          </div>
          <button className="btn btn-primary" onClick={handleCreateBatch} disabled={creatingBatch || selectedLeads.length === 0} style={{ fontSize: '0.875rem' }}>
            {creatingBatch ? 'Creating...' : `Create Batch (${selectedLeads.length} selected)`}
          </button>
        </div>

        {/* Existing Batches */}
        {batches.length > 0 && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Step</th>
                  <th>Status</th>
                  <th>Leads</th>
                  <th>Sent</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map(batch => (
                  <tr key={batch.id}>
                    <td style={{ fontWeight: 500 }}>{batch.name || `Batch #${batch.id}`}</td>
                    <td>{batch.sequence_step}</td>
                    <td>
                      <span className={`badge badge-${batch.status === 'sent' ? 'success' : batch.status === 'approved' ? 'primary' : 'warning'}`}>
                        {batch.status}
                      </span>
                    </td>
                    <td>{batch.lead_count}</td>
                    <td>{batch.sent_count || 0}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(batch.created_at).toLocaleDateString()}</td>
                    <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => router.push(`/outreach/${batch.id}`)}>
                        Review
                      </button>
                      {batch.status === 'approved' && (
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleSendBatch(batch.id)}>
                          Send
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {batches.length === 0 && (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No batches yet. Select approved leads and create your first batch.
          </div>
        )}
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
                <th style={{ width: '40px' }}>
                  <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) {
                      selectAllApproved();
                    } else {
                      setSelectedLeads([]);
                    }
                  }} checked={selectedLeads.length > 0 && selectedLeads.length === approvedLeads.length} />
                </th>
                <th>Company</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Pipeline</th>
                <th>Outreach</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} style={{ opacity: lead.pipeline_status === 'contacted' ? 0.7 : 1 }}>
                  <td>
                    <input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleLeadSelection(lead.id)} disabled={lead.pipeline_status !== 'approved'} />
                  </td>
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
                    <span className={`badge badge-${lead.pipeline_status === 'approved' ? 'success' : lead.pipeline_status === 'contacted' ? 'primary' : 'neutral'}`}>
                      {lead.pipeline_status}
                    </span>
                  </td>
                  <td>
                    {lead.outreach_status ? (
                      <span className={`badge badge-${lead.outreach_status === 'replied' ? 'success' : lead.outreach_status === 'sequence_active' ? 'primary' : 'neutral'}`}>
                        {lead.outreach_status}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
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
