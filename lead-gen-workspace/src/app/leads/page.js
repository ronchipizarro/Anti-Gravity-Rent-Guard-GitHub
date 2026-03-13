'use client';

import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Filters state
  const [filters, setFilters] = useState({ city: '', status: '', campaignId: '' });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchLeads() {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch('/api/leads?' + query);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/leads/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: results.data, campaignId: filters.campaignId || null })
          });
          const result = await res.json();
          if (result.success) {
            alert(`Imported ${result.inserted} leads. Skipped ${result.duplicates} duplicates.`);
            fetchLeads();
          } else {
            alert('Import failed: ' + result.error);
          }
        } catch (err) {
          alert('Error importing data');
        } finally {
          setImporting(false);
          fileInputRef.current.value = '';
        }
      }
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Lead Management</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn btn-primary" 
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? 'Importing...' : 'Upload CSV'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body grid grid-cols-3 gap-4" style={{ padding: 'var(--space-4)' }}>
          <div>
            <label className="label">Campaign</label>
            <select name="campaignId" className="select" onChange={handleFilterChange} value={filters.campaignId}>
              <option value="">All Campaigns</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Pipeline Status</label>
            <select name="status" className="select" onChange={handleFilterChange} value={filters.status}>
              <option value="">All Statuses</option>
              <option value="imported">Imported</option>
              <option value="enriched">Enriched</option>
              <option value="queued">Queued</option>
              <option value="approved">Approved</option>
              <option value="contacted">Contacted</option>
            </select>
          </div>
          <div>
            <label className="label">City</label>
            <input name="city" className="input" placeholder="Search city..." onChange={handleFilterChange} value={filters.city} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {loading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading leads...</div>
          ) : leads.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>No leads found. Need to import some?</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Campaign</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{lead.company_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.website || lead.generic_email || ''}</div>
                    </td>
                    <td>
                      <div>{lead.contact_name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.contact_email}</div>
                    </td>
                    <td>{lead.contact_role}</td>
                    <td>{lead.city}{lead.state ? `, ${lead.state}` : ''}</td>
                    <td>
                      <span className={`badge badge-${lead.pipeline_status === 'approved' ? 'success' : lead.pipeline_status === 'imported' ? 'neutral' : 'primary'}`}>
                        {lead.pipeline_status}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.campaign_name || '-'}</span></td>
                    <td>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
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
