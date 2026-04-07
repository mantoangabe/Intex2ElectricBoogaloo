import { useNavigate } from 'react-router-dom';
import '../../styles/styles.css';

export default function DonorImpact() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav className="navbar">
        <span className="navbar-brand">SafeHaven PH</span>
        <div className="navbar-links">
          <a href="/donor" style={{ color: 'var(--primary)' }}>Impact</a>
          <a href="/">Home</a>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/login')}
            style={{ marginLeft: '1rem', padding: '0.5rem 1.25rem' }}
          >
            Staff Login
          </button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--text)', marginBottom: '0.5rem' }}>
          Our Impact
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Aggregated, anonymized data showing the organization's impact, outcomes, and resource use
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Residents Served Lifetime', value: '500+' },
            { label: 'Active Safehouses', value: '12' },
            { label: 'Successful Reintegrations', value: '435' },
            { label: 'Partner Organizations', value: '200+' },
            { label: 'Program Hours Delivered', value: '12,400+' },
            { label: 'Donors & Supporters', value: '1,200+' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--white)',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>Outcome Metrics</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Progress in education, health, and community integration
          </p>
          <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Chart placeholder</p>
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>Safehouse Performance</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700 }}>Safehouse</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700 }}>Current Residents</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700 }}>Reintegration Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                  Data coming soon
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} SafeHaven PH. All rights reserved. | <a href="/privacy">Privacy Policy</a></p>
      </footer>
    </div>
  );
}
