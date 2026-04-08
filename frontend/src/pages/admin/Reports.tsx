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
  const PAGE_SIZE = 5;
  const TOP_SOCIAL_POST_COUNT = 25;
  const [metrics, setMetrics] = useState<SafehouseMonthlyMetric[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [page, setPage] = useState(1);
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

  const fetchMetrics = (pageVal: number) => {
    setLoading(true);
    apiClient.get<SafehouseMonthlyMetric[]>('/SafehouseMonthlyMetrics', {
      params: { skip: (pageVal - 1) * PAGE_SIZE, take: PAGE_SIZE },
    })
      .then(res => {
        setHasMore(res.data.length === PAGE_SIZE);
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
    fetchMetrics(1);
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
    const hue = Math.round(Math.max(0, Math.min(120, prob * 120)));
    return {
      backgroundColor: `hsl(${hue} 75% 92%)`,
      color: `hsl(${hue} 60% 25%)`,
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
      fetchMetrics(0);
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
        fetchMetrics(0);
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
        <h3>Safehouse Monthly Metrics</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Safehouse ID</th>
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
            {metrics.map(m => (
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
            const p = page - 1; setPage(p); fetchMetrics(p);
          }}>Previous</button>
          <span>Page {page}</span>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchMetrics(p);
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
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
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
