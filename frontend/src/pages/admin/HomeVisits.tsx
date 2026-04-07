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
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchVisits = (skipVal: number) => {
    setLoading(true);
    apiClient.get<HomeVisitation[]>('/HomeVisitations', { params: { skip: skipVal, take: 25 } })
      .then(res => {
        setHasMore(res.data.length === 25);
        if (skipVal === 0) {
          setVisits(res.data);
        } else {
          setVisits(prev => [...prev, ...res.data]);
        }
        setError(null);
      })
      .catch(() => setError('Failed to load home visitations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits(0);
  }, []);

  const handleShowMore = () => {
    const newSkip = skip + 25;
    setSkip(newSkip);
    fetchVisits(newSkip);
  };

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
            {error && (
              <tr><td colSpan={7} className="placeholder-row">{error}</td></tr>
            )}
            {visits.length === 0 && !error && (
              <tr><td colSpan={7} className="placeholder-row">No visits recorded yet. Click "Log Visit" to create a new record.</td></tr>
            )}
            {visits.map(v => (
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
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleShowMore} disabled={loading}>
              {loading ? 'Loading...' : 'Show More'}
            </button>
          </div>
        )}
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
