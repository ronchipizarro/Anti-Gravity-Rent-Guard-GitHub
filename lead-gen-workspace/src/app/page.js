import { getDb } from '@/lib/db';
import Link from 'next/link';

// Use dynamic rendering since we are reading from DB on every load
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const db = getDb();

  // Dashboard Stats
  const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  const activeCampaigns = db.prepare('SELECT COUNT(*) as count FROM campaigns WHERE status = ?').get('active').count;
  const pendingApprovals = db.prepare('SELECT COUNT(*) as count FROM leads WHERE enrichment_status = ? OR pipeline_status = ?').get('needs_review', 'queued').count;
  const openTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?').get('open').count;

  // Pipeline Metrics
  const pipelineMetrics = db.prepare('SELECT pipeline_status, COUNT(*) as count FROM leads GROUP BY pipeline_status').all();
  
  // Format pipeline data for display
  const pipelineMap = pipelineMetrics.reduce((acc, row) => {
    acc[row.pipeline_status] = row.count;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Link href="/campaigns/new" className="btn btn-primary">
          + New Campaign
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Active Campaigns</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeCampaigns}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Total Leads</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalLeads}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Pending Approvals</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>{pendingApprovals}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Open Tasks</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{openTasks}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Pipeline Overview</h2>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-neutral">Imported</span></td>
                    <td>{pipelineMap['imported'] || 0}</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">Enriched</span></td>
                    <td>{pipelineMap['enriched'] || 0}</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-warning">Queued</span></td>
                    <td>{pipelineMap['queued'] || 0}</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-success">Approved</span></td>
                    <td>{pipelineMap['approved'] || 0}</td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-primary">Contacted</span></td>
                    <td>{pipelineMap['contacted'] || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Quick Actions</h2>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Link href="/leads" className="btn" style={{ justifyContent: 'flex-start' }}>Review Pending Leads</Link>
            <Link href="/tasks" className="btn" style={{ justifyContent: 'flex-start' }}>Complete Open Tasks</Link>
            <Link href="/campaigns" className="btn" style={{ justifyContent: 'flex-start' }}>Manage Campaigns</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
