import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface SafehouseMonthlyMetric {
  metricId: number;
  safehouseId: number;
  monthStart: string;
  activeResidents: number;
  avgEducationProgress: number | null;
  avgHealthScore: number | null;
}

interface Resident {
  residentId: number;
  reintegrationStatus: string | null;
}

export default function Reports() {
  const [metrics, setMetrics] = useState<SafehouseMonthlyMetric[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchMetrics = (skipVal: number) => {
    setLoading(true);
    apiClient.get<SafehouseMonthlyMetric[]>('/SafehouseMonthlyMetrics', { params: { skip: skipVal, take: 25 } })
      .then(res => {
        setHasMore(res.data.length === 25);
        if (skipVal === 0) {
          setMetrics(res.data);
        } else {
          setMetrics(prev => [...prev, ...res.data]);
        }
        setError(null);
      })
      .catch(() => setError('Failed to load metrics.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiClient.get<Resident[]>('/Residents', { params: { skip: 0, take: 1000 } })
      .then(res => setResidents(res.data))
      .catch(() => {});
    fetchMetrics(0);
  }, []);

  const handleShowMore = () => {
    const newSkip = skip + 25;
    setSkip(newSkip);
    fetchMetrics(newSkip);
  };

  const avgEducation = metrics.length
    ? (metrics.reduce((sum, m) => sum + (m.avgEducationProgress ?? 0), 0) / metrics.length).toFixed(1)
    : '—';

  const avgHealth = metrics.length
    ? (metrics.reduce((sum, m) => sum + (m.avgHealthScore ?? 0), 0) / metrics.length).toFixed(1)
    : '—';

  const reintegrationRate = residents.length
    ? ((residents.filter(r => r.reintegrationStatus === 'Completed').length / residents.length) * 100).toFixed(1) + '%'
    : '—';

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Insights and trends to support decision-making</p>
        </div>
      </div>

      <div className="filter-bar">
        <input type="date" className="filter-input" placeholder="From date" />
        <input type="date" className="filter-input" placeholder="To date" />
        <select className="filter-select">
          <option>All Safehouses</option>
        </select>
      </div>

      <div className="admin-card">
        <h3>Safehouse Monthly Metrics</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Safehouse ID</th>
              <th>Active Residents</th>
              <th>Avg Education Progress</th>
              <th>Avg Health Score</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={5} className="placeholder-row">{error}</td></tr>
            )}
            {metrics.length === 0 && !error && (
              <tr><td colSpan={5} className="placeholder-row">No metrics recorded yet.</td></tr>
            )}
            {metrics.map(m => (
              <tr key={m.metricId}>
                <td>{new Date(m.monthStart).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</td>
                <td>{m.safehouseId}</td>
                <td>{m.activeResidents}</td>
                <td>{m.avgEducationProgress != null ? m.avgEducationProgress : '—'}</td>
                <td>{m.avgHealthScore != null ? m.avgHealthScore : '—'}</td>
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
        <h3>Resident Outcomes</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Avg Education Progress</td>
              <td>{avgEducation}</td>
            </tr>
            <tr>
              <td>Avg Health Score</td>
              <td>{avgHealth}</td>
            </tr>
            <tr>
              <td>Reintegration Success Rate</td>
              <td>{reintegrationRate}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
