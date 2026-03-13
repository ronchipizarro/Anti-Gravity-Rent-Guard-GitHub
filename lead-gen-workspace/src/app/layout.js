import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Lead Gen Workspace',
  description: 'Local lead generation and campaign management workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <aside className="sidebar">
            <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--sidebar-hover)' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Lead Gen</h1>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Workspace</p>
            </div>
            <nav style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link href="/" style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', transition: 'background-color 150ms', textDecoration: 'none', color: 'inherit', display: 'block' }}>Dashboard</Link>
              <Link href="/campaigns/new" style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', transition: 'background-color 150ms', textDecoration: 'none', color: 'inherit', display: 'block' }}>New Campaign</Link>
              <Link href="/leads" style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', transition: 'background-color 150ms', textDecoration: 'none', color: 'inherit', display: 'block' }}>Leads</Link>
              <Link href="/tasks" style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', transition: 'background-color 150ms', textDecoration: 'none', color: 'inherit', display: 'block' }}>Tasks</Link>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
