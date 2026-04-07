import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const navigate = useNavigate();

  const navItems = [
    'Dashboard',
    'Caseload Inventory',
    'Process Recording',
    'Home Visits',
    'Donors & Contributions',
    'Reports & Analytics',
    'Settings'
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>SafeHaven Admin Dashboard</h1>
        <button className="logout-btn" onClick={() => navigate('/')}>
          Logout
        </button>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            {navItems.map((item) => (
              <li key={item} className="admin-nav-item">
                <a
                  className={`admin-nav-link ${activeNav === item ? 'active' : ''}`}
                  onClick={() => setActiveNav(item)}
                >
                  {item}
                </a>
              </li>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-welcome">
            <h2>Welcome back, Staff Member</h2>
            <p>Here's an overview of your operations</p>
          </div>

          <div className="metrics-grid">
            {[
              { label: 'Active Residents', value: '48' },
              { label: 'Total Donors', value: '127' },
              { label: 'This Month Donations', value: '$12,450' },
              { label: 'Pending Cases', value: '12' }
            ].map((metric) => (
              <div key={metric.label} className="metric-card">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="admin-card">
            <h3>Recent Activity</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '2026-04-06', event: 'New resident admission', user: 'Ma. Santos' },
                  { date: '2026-04-05', event: 'Donation recorded', user: 'J. Dela Cruz' },
                  { date: '2026-04-04', event: 'Case conference scheduled', user: 'R. Aquino' },
                  { date: '2026-04-03', event: 'Process recording submitted', user: 'Ma. Santos' },
                  { date: '2026-04-02', event: 'Home visit completed', user: 'L. Reyes' }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td>{row.event}</td>
                    <td>{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              {[
                'New Resident Admission',
                'Record Donation',
                'Schedule Visit',
                'Add Process Note'
              ].map((action) => (
                <button key={action} className="quick-action-btn">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
