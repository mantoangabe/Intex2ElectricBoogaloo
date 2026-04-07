import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: '#2d6a4f',
        color: '#fff',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>SafeHaven Admin Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Logout
        </button>
      </header>

      {/* Sidebar + Main */}
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px',
          background: '#fff',
          borderRight: '1px solid #ddd',
          padding: '1.5rem 0',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto'
        }}>
          <nav>
            {[
              'Dashboard',
              'Caseload Inventory',
              'Process Recording',
              'Home Visits',
              'Donors & Contributions',
              'Reports & Analytics',
              'Settings'
            ].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: 'block',
                  padding: '1rem 1.5rem',
                  color: item === 'Dashboard' ? '#2d6a4f' : '#666',
                  textDecoration: 'none',
                  borderLeft: item === 'Dashboard' ? '4px solid #2d6a4f' : 'none',
                  paddingLeft: item === 'Dashboard' ? '1.25rem' : '1.5rem',
                  fontWeight: item === 'Dashboard' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {/* Welcome */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#1a1a2e', marginBottom: '0.5rem' }}>Welcome back, Staff Member</h2>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>Here's an overview of your operations</p>
          </div>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            {[
              { label: 'Active Residents', value: '48', color: '#2d6a4f' },
              { label: 'Total Donors', value: '127', color: '#4a90e2' },
              { label: 'This Month Donations', value: '$12,450', color: '#f39c12' },
              { label: 'Pending Cases', value: '12', color: '#e74c3c' }
            ].map((metric) => (
              <div
                key={metric.label}
                style={{
                  background: '#fff',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderTop: `4px solid ${metric.color}`
                }}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: metric.color, marginBottom: '0.5rem' }}>
                  {metric.value}
                </div>
                <div style={{ color: '#666', fontWeight: 600, fontSize: '0.95rem' }}>{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#1a1a2e', marginTop: 0, marginBottom: '1rem' }}>Recent Activity</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#666', fontWeight: 700, fontSize: '0.9rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#666', fontWeight: 700, fontSize: '0.9rem' }}>Event</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0', color: '#666', fontWeight: 700, fontSize: '0.9rem' }}>User</th>
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
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem 0', color: '#666', fontSize: '0.9rem' }}>{row.date}</td>
                    <td style={{ padding: '1rem 0', color: '#1a1a2e', fontWeight: 500 }}>{row.event}</td>
                    <td style={{ padding: '1rem 0', color: '#666', fontSize: '0.9rem' }}>{row.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            padding: '1.5rem'
          }}>
            <h3 style={{ color: '#1a1a2e', marginTop: 0, marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                'New Resident Admission',
                'Record Donation',
                'Schedule Visit',
                'Add Process Note'
              ].map((action) => (
                <button
                  key={action}
                  style={{
                    background: '#40916c',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2d6a4f'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#40916c'}
                >
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
