import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';
import LastRefreshChip from '../../components/LastRefreshChip';
import { ENABLE_ML_PREDICTIONS } from '../../config/features';
import { usePredictionMeta } from '../../hooks/usePredictionMeta';
import type {
  IncidentRiskPrediction,
  ResidentProgressPrediction,
  SocialDonationPrediction,
} from '../../types/predictions';

interface SafehouseMonthlyMetric {
  metricId: number;
  safehouseId: number;
  monthStart: string;
  monthEnd: string;
  activeResidents: number;
  avgEducationProgress: number | null;
  avgHealthScore: number | null;
  processRecordingCount: number;
  homeVisitationCount: number;
  incidentCount: number;
  notes: string;
}

interface Resident {
  residentId: number;
  reintegrationStatus: string | null;
}

export default function Reports() {
  const DEFAULT_PAGE_SIZE = 5;
  const TOP_SOCIAL_POST_COUNT = 25;
  const [metrics, setMetrics] = useState<SafehouseMonthlyMetric[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [jumpPage, setJumpPage] = useState('1');
  const [metricSortDir, setMetricSortDir] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [progressPredictions, setProgressPredictions] = useState<ResidentProgressPrediction[]>([]);
  const [incidentPredictions, setIncidentPredictions] = useState<IncidentRiskPrediction[]>([]);
  const [socialPredictions, setSocialPredictions] = useState<SocialDonationPrediction[]>([]);
  const progressMeta = usePredictionMeta('/ResidentProgressPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const incidentMeta = usePredictionMeta('/IncidentRiskPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const socialMeta = usePredictionMeta('/SocialDonationPredictions/meta/latest', ENABLE_ML_PREDICTIONS);

  const [showModal, setShowModal] = useState(false);
  const [editMetric, setEditMetric] = useState<SafehouseMonthlyMetric | null>(null);
  const [formData, setFormData] = useState<Partial<SafehouseMonthlyMetric>>({});
  const [saving, setSaving] = useState(false);

  const fetchMetrics = (pageVal: number, size: number) => {
    setLoading(true);
    apiClient.get<SafehouseMonthlyMetric[]>('/SafehouseMonthlyMetrics', {
      params: { skip: (pageVal - 1) * size, take: size },
    })
      .then(res => {
        setHasMore(res.data.length === size);
        setMetrics(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load metrics.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiClient.get<Resident[]>('/Residents', { params: { skip: 0, take: 1000 } })
      .then(res => setResidents(res.data))
      .catch(() => {});
    fetchMetrics(1, pageSize);
    apiClient.get<SafehouseMonthlyMetric[]>('/SafehouseMonthlyMetrics', { params: { skip: 0, take: 100000 } })
      .then(r => setTotalCount(r.data.length))
      .catch(() => {});
    if (ENABLE_ML_PREDICTIONS) {
      apiClient
        .get<ResidentProgressPrediction[]>('/ResidentProgressPredictions', { params: { take: 1000, latestOnly: true } })
        .then(res => setProgressPredictions(res.data))
        .catch(() => setProgressPredictions([]));
      apiClient
        .get<IncidentRiskPrediction[]>('/IncidentRiskPredictions', { params: { take: 1000, latestOnly: true } })
        .then(res => setIncidentPredictions(res.data))
        .catch(() => setIncidentPredictions([]));
      apiClient
        .get<SocialDonationPrediction[]>('/SocialDonationPredictions', {
          params: { take: TOP_SOCIAL_POST_COUNT, latestOnly: true, sort: 'value_desc' },
        })
        .then(res => setSocialPredictions(res.data))
        .catch(() => setSocialPredictions([]));
    }
  }, []);

  const fmtUsd = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const conversionCellStyle = (prob?: number | null) => {
    if (prob == null) return undefined;
    const pct = prob * 100;
    const clamped = Math.max(0, Math.min(100, pct));
    const hue = Math.round((clamped / 100) * 120);
    const light = Math.round(95 - (clamped / 100) * 18);
    return {
      backgroundColor: `hsl(${hue} 85% ${light}%)`,
      color: `hsl(${hue} 70% 20%)`,
      fontWeight: 700 as const,
      borderRadius: '6px',
      padding: '0.2rem 0.45rem',
      display: 'inline-block',
    };
  };

  const openModal = (metric: SafehouseMonthlyMetric | null) => {
    setEditMetric(metric);
    setFormData(metric ? { ...metric } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMetric(null);
    setFormData({});
  };

  const saveMetric = async () => {
    setSaving(true);
    try {
      if (editMetric?.metricId) {
        await apiClient.put(`/SafehouseMonthlyMetrics/${editMetric.metricId}`, formData);
      } else {
        await apiClient.post('/SafehouseMonthlyMetrics', formData);
      }
      fetchMetrics(1, pageSize);
      closeModal();
    } catch (err) {
      alert('Failed to save metric.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMetric = async (id: number) => {
    if (window.confirm('Delete this metric?')) {
      try {
        await apiClient.delete(`/SafehouseMonthlyMetrics/${id}`);
        fetchMetrics(page, pageSize);
      } catch (err) {
        alert('Failed to delete metric.');
      }
    }
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
  const highProgressRisk = progressPredictions.filter(p => p.lowProgressRiskProbability >= 0.66).length;
  const highIncidentRisk = incidentPredictions.filter(p => p.incidentRiskProbability >= 0.66).length;
  const topSocialAvg = socialPredictions.length
    ? socialPredictions.reduce((sum, p) => sum + p.predictedDonationValuePhp, 0) / socialPredictions.length
    : 0;
  const sortedMetrics = [...metrics].sort((a, b) =>
    metricSortDir === 'asc' ? a.safehouseId - b.safehouseId : b.safehouseId - a.safehouseId
  );

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Insights and trends to support decision-making</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>+ Add Metric</button>
      </div>

      <div className="filter-bar">
        <input type="date" className="filter-input" placeholder="From date" />
        <input type="date" className="filter-input" placeholder="To date" />
        <select className="filter-select">
          <option>All Safehouses</option>
        </select>
      </div>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Safehouse Monthly Metrics</h3>
          <small className="refresh-chip">Showing {sortedMetrics.length} of {totalCount} records</small>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th className="clickable-th" onClick={() => setMetricSortDir(prev => prev === 'asc' ? 'desc' : 'asc')}>Safehouse ID {metricSortDir === 'asc' ? '▲' : '▼'}</th>
              <th>Active Residents</th>
              <th>Avg Education Progress</th>
              <th>Avg Health Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={5} className="placeholder-row">{error}</td></tr>
            )}
            {metrics.length === 0 && !error && (
              <tr><td colSpan={5} className="placeholder-row">No metrics recorded yet.</td></tr>
            )}
            {sortedMetrics.map(m => (
              <tr key={m.metricId}>
                <td>{new Date(m.monthStart).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</td>
                <td>{m.safehouseId}</td>
                <td>{m.activeResidents}</td>
                <td>{m.avgEducationProgress != null ? m.avgEducationProgress : '—'}</td>
                <td>{m.avgHealthScore != null ? m.avgHealthScore : '—'}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openModal(m)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteMetric(m.metricId!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button className="btn btn-secondary btn-sm" disabled={page === 1 || loading} onClick={() => {
            const p = page - 1; setPage(p); fetchMetrics(p, pageSize);
          }}>Previous</button>
          <span>Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
          <input className="pagination-jump-input" type="number" min={1} max={Math.max(1, Math.ceil(totalCount / pageSize))} value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} />
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const max = Math.max(1, Math.ceil(totalCount / pageSize));
            const p = Math.min(max, Math.max(1, Number(jumpPage) || 1));
            setPage(p);
            fetchMetrics(p, pageSize);
          }}>Go</button>
          <select className="filter-select" style={{ marginLeft: 'auto' }} value={pageSize} onChange={(e) => {
            const size = Number(e.target.value);
            setPageSize(size);
            setPage(1);
            fetchMetrics(1, size);
          }}>
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchMetrics(p, pageSize);
          }}>Next</button>
        </div>
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
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Context: Avg Education Progress and Avg Health Score are internal 0-100 normalized indicators (higher is better).
        </p>
      </div>

      {ENABLE_ML_PREDICTIONS && (
        <>
          <div className="admin-card">
            <h3>Executive Prediction Snapshot</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Residents in High &quot;Low Progress&quot; risk band</td>
                  <td>{highProgressRisk}</td>
                </tr>
                <tr>
                  <td>Residents in High incident risk band</td>
                  <td>{highIncidentRisk}</td>
                </tr>
                <tr>
                  <td>Avg predicted donation value across top social posts (n={socialPredictions.length}, USD)</td>
                  <td>{fmtUsd(topSocialAvg)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem', flexDirection: 'column' }}>
              <LastRefreshChip meta={progressMeta} label="Progress" />
              <LastRefreshChip meta={incidentMeta} label="Incident" />
              <LastRefreshChip meta={socialMeta} label="Social donation" />
            </div>
          </div>

          <div className="admin-card">
            <h3>Top Predicted Social Donation Posts</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Post ID</th>
                  <th>Predicted Donation Value (USD)</th>
                  <th>High Conversion Probability</th>
                </tr>
              </thead>
              <tbody>
                {socialPredictions.slice(0, 10).map(post => (
                  <tr key={post.predictionId}>
                    <td>{post.postId}</td>
                    <td>{fmtUsd(post.predictedDonationValuePhp)}</td>
                    <td>
                      {post.pHighConversion != null
                        ? <span style={conversionCellStyle(post.pHighConversion)}>{`${(post.pHighConversion * 100).toFixed(1)}%`}</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
                {socialPredictions.length === 0 && (
                  <tr><td colSpan={3} className="placeholder-row">No scored social predictions available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Metric Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMetric ? 'Edit Metric' : 'Add Metric'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Safehouse ID</label>
                <input type="number" value={formData.safehouseId ?? ''} onChange={(e) => setFormData({ ...formData, safehouseId: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Month Start</label>
                <input type="date" value={formData.monthStart?.split('T')[0] ?? ''} onChange={(e) => setFormData({ ...formData, monthStart: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Month End</label>
                <input type="date" value={formData.monthEnd?.split('T')[0] ?? ''} onChange={(e) => setFormData({ ...formData, monthEnd: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Active Residents</label>
                <input type="number" value={formData.activeResidents ?? ''} onChange={(e) => setFormData({ ...formData, activeResidents: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Avg Education Progress</label>
                <input type="number" step="0.01" value={formData.avgEducationProgress ?? ''} onChange={(e) => setFormData({ ...formData, avgEducationProgress: parseFloat(e.target.value) || null })} />
              </div>
              <div className="form-group">
                <label>Avg Health Score</label>
                <input type="number" step="0.01" value={formData.avgHealthScore ?? ''} onChange={(e) => setFormData({ ...formData, avgHealthScore: parseFloat(e.target.value) || null })} />
              </div>
              <div className="form-group">
                <label>Process Recording Count</label>
                <input type="number" value={formData.processRecordingCount ?? ''} onChange={(e) => setFormData({ ...formData, processRecordingCount: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Home Visitation Count</label>
                <input type="number" value={formData.homeVisitationCount ?? ''} onChange={(e) => setFormData({ ...formData, homeVisitationCount: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Incident Count</label>
                <input type="number" value={formData.incidentCount ?? ''} onChange={(e) => setFormData({ ...formData, incidentCount: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={formData.notes ?? ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={saveMetric} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
