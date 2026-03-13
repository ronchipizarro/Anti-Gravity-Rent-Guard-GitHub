'use client';

import { useState, useEffect } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMockTask() {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Review imported lead: Orlando Property Pros',
          type: 'review_lead'
        })
      });
      fetchTasks();
    } catch (e) {
      alert('Error creating task');
    }
  }

  async function toggleStatus(id, currentStatus) {
    const newStatus = currentStatus === 'open' ? 'completed' : 'open';
    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchTasks();
    } catch (e) {
      alert('Error updating task');
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <h1 className="page-title">Tasks & Reminders</h1>
        <button className="btn btn-primary" onClick={handleCreateMockTask}>
          + Create Sample Task
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks assigned. You are all caught up!</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Task Title</th>
                  <th>Related Lead</th>
                  <th>Campaign</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ opacity: task.status === 'completed' ? 0.6 : 1 }}>
                    <td>
                      <span className={\`badge badge-\${task.status === 'open' ? 'warning' : 'neutral'}\`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                      {task.title}
                    </td>
                    <td>{task.lead_company || '-'}</td>
                    <td>{task.campaign_name || '-'}</td>
                    <td>
                      <button 
                        className="btn" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => toggleStatus(task.id, task.status)}
                      >
                        {task.status === 'open' ? 'Mark Done' : 'Reopen'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
