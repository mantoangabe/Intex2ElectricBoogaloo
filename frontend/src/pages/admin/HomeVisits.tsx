import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface HomeVisitation {
  visitationId: number;
  residentId: number;
  visitDate: string;
  socialWorker: string;
  visitType: string;
  observations: string;
  safetyConcernsNoted: boolean;
}

export default function HomeVisits() {
  const [visits, setVisits] = useState<HomeVisitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<HomeVisitation[]>('/HomeVisitations')
      .then(res => setVisits(res.data))
      .catch(() => setError('Failed to load home visitations.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Home Visitation & Case Conferences">
      <div className="page-header">
        <div>
          <h2>Home Visitation & Case Conferences</h2>
          <p>Log field visits and track case conference history</p>
        </div>
        <button className="btn btn-primary">+ Log Visit</button>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search resident..." className="filter-input" />
        <select className="filter-select">
          <option>All Visit Types</option>
          <option>Initial Assessment</option>
          <option>Routine Follow-up</option>
          <option>Reintegration Assessment</option>
          <option>Post-placement Monitoring</option>
          <option>Emergency</option>
        </select>
        <input type="date" className="filter-input" placeholder="From date" />
        <input type="date" className="filter-input" placeholder="To date" />
      </div>

      <div className="admin-card">
        <h3>Home Visits</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Resident ID</th>
              <th>Visit Type</th>
              <th>Social Worker</th>
              <th>Observations</th>
              <th>Safety Concerns</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="placeholder-row">Loading...</td></tr>
            )}
            {error && (
              <tr><td colSpan={7} className="placeholder-row">{error}</td></tr>
            )}
            {!loading && !error && visits.length === 0 && (
              <tr><td colSpan={7} className="placeholder-row">No visits recorded yet. Click "Log Visit" to create a new record.</td></tr>
            )}
            {!loading && !error && visits.map(v => (
              <tr key={v.visitationId}>
                <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                <td>{v.residentId}</td>
                <td>{v.visitType}</td>
                <td>{v.socialWorker}</td>
                <td>{v.observations}</td>
                <td>{v.safetyConcernsNoted ? 'Yes' : 'No'}</td>
                <td><button className="btn btn-sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>Case Conferences</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Upcoming and past case conferences for residents.
        </p>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Resident</th>
              <th>Status</th>
              <th>Attendees</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="placeholder-row">
                No conferences scheduled.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
