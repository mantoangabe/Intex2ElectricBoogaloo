import AdminLayout from '../components/AdminLayout';
import '../styles/AdminDashboard.css';

export default function AdminDashboard() {
  return (
    <AdminLayout title="SafeHaven Admin Dashboard">
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
            <button key={action} className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
