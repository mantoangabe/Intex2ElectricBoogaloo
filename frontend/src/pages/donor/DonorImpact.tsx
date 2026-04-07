import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface Safehouse {
  safehouseId: number;
  name: string;
  currentOccupancy: number;
  status: string;
}

export default function DonorImpact() {
  const navigate = useNavigate();
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<Safehouse[]>('/Safehouses')
      .then(res => setSafehouses(res.data))
      .catch(() => setError('Failed to load safehouse data.'))
      .finally(() => setLoading(false));
  }, []);

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

        <div style={{ background: 'var(--white)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ color: 'var(--text)', marginTop: 0 }}>Safehouse Performance</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700 }}>Safehouse</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700 }}>Current Residents</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Loading...</td></tr>
              )}
              {error && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>{error}</td></tr>
              )}
              {!loading && !error && safehouses.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>No safehouses found.</td></tr>
              )}
              {!loading && !error && safehouses.map(s => (
                <tr key={s.safehouseId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{s.name}</td>
                  <td style={{ padding: '0.75rem 0' }}>{s.currentOccupancy}</td>
                  <td style={{ padding: '0.75rem 0' }}>{s.status}</td>
                </tr>
              ))}
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
