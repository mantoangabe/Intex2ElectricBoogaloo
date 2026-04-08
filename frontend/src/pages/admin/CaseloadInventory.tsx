import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';
import PredictionBadge from '../../components/PredictionBadge';
import LastRefreshChip from '../../components/LastRefreshChip';
import { ENABLE_ML_PREDICTIONS } from '../../config/features';
import { usePredictionMeta } from '../../hooks/usePredictionMeta';
import type { IncidentRiskPrediction, ResidentProgressPrediction } from '../../types/predictions';

interface Resident {
  residentId: number;
  caseControlNo: string;
  internalCode: string;
  presentAge: string;
  caseCategory: string;
  safehouseId: number;
  caseStatus: string;
  assignedSocialWorker: string;
  sex: string;
  dateOfBirth: string;
  referralSource: string;
  initialRiskLevel: string;
  currentRiskLevel: string;
  dateOfAdmission: string;
}

export default function CaseloadInventory() {
  const DEFAULT_PAGE_SIZE = 25;
  const [residents, setResidents] = useState<Resident[]>([]);
  const [progressPredictions, setProgressPredictions] = useState<Record<number, ResidentProgressPrediction>>({});
  const [incidentPredictions, setIncidentPredictions] = useState<Record<number, IncidentRiskPrediction>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [jumpPage, setJumpPage] = useState('1');
  const [sortConfig, setSortConfig] = useState<{ key: string; dir: 'asc' | 'desc' }>({ key: 'residentId', dir: 'asc' });
  const [progressStageFilter, setProgressStageFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [incidentStageFilter, setIncidentStageFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const filteredResidents = residents.filter(r => {
    const p = progressPredictions[r.residentId]?.lowProgressRiskProbability;
    const i = incidentPredictions[r.residentId]?.incidentRiskProbability;
    const pTier = p == null ? '' : p >= 0.66 ? 'high' : p >= 0.33 ? 'medium' : 'low';
    const iTier = i == null ? '' : i >= 0.66 ? 'high' : i >= 0.33 ? 'medium' : 'low';
    return (progressStageFilter === 'all' || pTier === progressStageFilter) &&
           (incidentStageFilter === 'all' || iTier === incidentStageFilter);
  }).sort((a, b) => {
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    if (sortConfig.key === 'lowProgressRiskProbability') {
      const av = progressPredictions[a.residentId]?.lowProgressRiskProbability ?? -1;
      const bv = progressPredictions[b.residentId]?.lowProgressRiskProbability ?? -1;
      return (av - bv) * dir;
    }
    if (sortConfig.key === 'incidentRiskProbability') {
      const av = incidentPredictions[a.residentId]?.incidentRiskProbability ?? -1;
      const bv = incidentPredictions[b.residentId]?.incidentRiskProbability ?? -1;
      return (av - bv) * dir;
    }
    return String((a as any)[sortConfig.key] ?? '').localeCompare(String((b as any)[sortConfig.key] ?? '')) * dir;
  });
  const toggleSort = (key: string) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const progressMeta = usePredictionMeta('/ResidentProgressPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const incidentMeta = usePredictionMeta('/IncidentRiskPredictions/meta/latest', ENABLE_ML_PREDICTIONS);

  const [showModal, setShowModal] = useState(false);
  const [editResident, setEditResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState<Partial<Resident>>({});
  const [saving, setSaving] = useState(false);

  const fetchResidents = (pageVal: number, size: number) => {
    setLoading(true);
    apiClient.get<Resident[]>('/Residents', { params: { skip: (pageVal - 1) * size, take: size } })
      .then(res => {
        setHasMore(res.data.length === size);
        setResidents(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load residents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResidents(1, pageSize);
    apiClient.get<Resident[]>('/Residents', { params: { skip: 0, take: 100000 } }).then(r => setTotalCount(r.data.length)).catch(() => {});
    if (ENABLE_ML_PREDICTIONS) {
      apiClient
        .get<ResidentProgressPrediction[]>('/ResidentProgressPredictions', {
          params: { take: 2000, latestOnly: true, sort: 'score_desc' },
        })
        .then(res => {
          const map = res.data.reduce<Record<number, ResidentProgressPrediction>>((acc, row) => {
            acc[row.residentId] = row;
            return acc;
          }, {});
          setProgressPredictions(map);
        })
        .catch(() => setProgressPredictions({}));

      apiClient
        .get<IncidentRiskPrediction[]>('/IncidentRiskPredictions', {
          params: { take: 2000, latestOnly: true, sort: 'score_desc' },
        })
        .then(res => {
          const map = res.data.reduce<Record<number, IncidentRiskPrediction>>((acc, row) => {
            acc[row.residentId] = row;
            return acc;
          }, {});
          setIncidentPredictions(map);
        })
        .catch(() => setIncidentPredictions({}));
    }
  }, []);

  const openModal = (resident: Resident | null) => {
    setEditResident(resident);
    setFormData(resident ? { ...resident } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditResident(null);
    setFormData({});
  };

  const saveResident = async () => {
    setSaving(true);
    try {
      if (editResident?.residentId) {
        await apiClient.put(`/Residents/${editResident.residentId}`, formData);
      } else {
        await apiClient.post('/Residents', formData);
      }
      fetchResidents(1, pageSize);
      closeModal();
    } catch (err) {
      alert('Failed to save resident.');
    } finally {
      setSaving(false);
    }
  };

  const deleteResident = async (id: number) => {
    if (window.confirm('Delete this resident?')) {
      try {
        await apiClient.delete(`/Residents/${id}`);
        fetchResidents(page, pageSize);
      } catch (err) {
        alert('Failed to delete resident.');
      }
    }
  };

  return (
    <AdminLayout title="Caseload Inventory">
      <div className="page-header">
        <div>
          <h2>Caseload Inventory</h2>
          <p>Core case management — residents, demographics, case categories, and reintegration tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>+ New Resident</button>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search by name or ID..." className="filter-input" />
        <select className="filter-select">
          <option>All Safehouses</option>
          <option>Safehouse A</option>
          <option>Safehouse B</option>
        </select>
        <select className="filter-select">
          <option>All Case Categories</option>
          <option>Trafficked</option>
          <option>Physical Abuse</option>
          <option>Neglected</option>
        </select>
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Reintegrated</option>
          <option>Discharged</option>
        </select>
        {ENABLE_ML_PREDICTIONS && (
          <select className="filter-select" value={progressStageFilter} onChange={(e) => setProgressStageFilter(e.target.value as any)}>
            <option value="all">All "Low Progress" Stages</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        )}
        {ENABLE_ML_PREDICTIONS && (
          <select className="filter-select" value={incidentStageFilter} onChange={(e) => setIncidentStageFilter(e.target.value as any)}>
            <option value="all">All Incident Stages</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        )}
      </div>

      <div className="admin-card">
        <h3>Resident Profiles</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th className="clickable-th" onClick={() => toggleSort('residentId')}>ID {sortConfig.key === 'residentId' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>
              <th className="clickable-th" onClick={() => toggleSort('caseControlNo')}>Case Control No. {sortConfig.key === 'caseControlNo' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>
              <th>Age</th>
              <th>Case Category</th>
              <th>Safehouse</th>
              <th>Status</th>
              {ENABLE_ML_PREDICTIONS && <th className="table-center clickable-th" onClick={() => toggleSort('lowProgressRiskProbability')}>Low Progress Risk {sortConfig.key === 'lowProgressRiskProbability' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>}
              {ENABLE_ML_PREDICTIONS && <th className="table-center clickable-th" onClick={() => toggleSort('incidentRiskProbability')}>Incident Risk {sortConfig.key === 'incidentRiskProbability' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>}
              <th>Assigned Social Worker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={ENABLE_ML_PREDICTIONS ? 10 : 8} className="placeholder-row">{error}</td></tr>
            )}
            {filteredResidents.length === 0 && !error && (
              <tr><td colSpan={ENABLE_ML_PREDICTIONS ? 10 : 8} className="placeholder-row">No residents found.</td></tr>
            )}
            {filteredResidents.map(r => (
              <tr key={r.residentId}>
                <td>{r.residentId}</td>
                <td>{r.caseControlNo}</td>
                <td>{r.presentAge}</td>
                <td>{r.caseCategory}</td>
                <td>{r.safehouseId}</td>
                <td>{r.caseStatus}</td>
                {ENABLE_ML_PREDICTIONS && (
                  <td className="table-center">
                    {progressPredictions[r.residentId]
                      ? <PredictionBadge probability={progressPredictions[r.residentId].lowProgressRiskProbability} />
                      : '—'}
                  </td>
                )}
                {ENABLE_ML_PREDICTIONS && (
                  <td className="table-center">
                    {incidentPredictions[r.residentId]
                      ? <PredictionBadge probability={incidentPredictions[r.residentId].incidentRiskProbability} />
                      : '—'}
                  </td>
                )}
                <td>{r.assignedSocialWorker}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openModal(r)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteResident(r.residentId!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button className="btn btn-secondary btn-sm" disabled={page === 1 || loading} onClick={() => {
            const p = page - 1; setPage(p); fetchResidents(p, pageSize);
          }}>Previous</button>
          <span>Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
          <input className="pagination-jump-input" type="number" min={1} max={Math.max(1, Math.ceil(totalCount / pageSize))} value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} />
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const max = Math.max(1, Math.ceil(totalCount / pageSize));
            const p = Math.min(max, Math.max(1, Number(jumpPage) || 1));
            setPage(p);
            fetchResidents(p, pageSize);
          }}>Go</button>
          <select className="filter-select" style={{ marginLeft: 'auto' }} value={pageSize} onChange={(e) => {
            const size = Number(e.target.value);
            setPageSize(size);
            setPage(1);
            fetchResidents(1, size);
          }}>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchResidents(p, pageSize);
          }}>Next</button>
        </div>
        {ENABLE_ML_PREDICTIONS && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <LastRefreshChip meta={progressMeta} label="Progress model" />
            <LastRefreshChip meta={incidentMeta} label="Incident model" />
          </div>
        )}
      </div>

      {/* Resident Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editResident ? 'Edit Resident' : 'Add Resident'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Case Control Number</label>
                <input type="text" value={formData.caseControlNo ?? ''} onChange={(e) => setFormData({ ...formData, caseControlNo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Internal Code</label>
                <input type="text" value={formData.internalCode ?? ''} onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Safehouse ID</label>
                <input type="number" value={formData.safehouseId ?? ''} onChange={(e) => setFormData({ ...formData, safehouseId: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Case Status</label>
                <input type="text" value={formData.caseStatus ?? ''} onChange={(e) => setFormData({ ...formData, caseStatus: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Sex</label>
                <input type="text" value={formData.sex ?? ''} onChange={(e) => setFormData({ ...formData, sex: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={formData.dateOfBirth?.split('T')[0] ?? ''} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Case Category</label>
                <input type="text" value={formData.caseCategory ?? ''} onChange={(e) => setFormData({ ...formData, caseCategory: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assigned Social Worker</label>
                <input type="text" value={formData.assignedSocialWorker ?? ''} onChange={(e) => setFormData({ ...formData, assignedSocialWorker: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Referral Source</label>
                <input type="text" value={formData.referralSource ?? ''} onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Initial Risk Level</label>
                <input type="text" value={formData.initialRiskLevel ?? ''} onChange={(e) => setFormData({ ...formData, initialRiskLevel: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Current Risk Level</label>
                <input type="text" value={formData.currentRiskLevel ?? ''} onChange={(e) => setFormData({ ...formData, currentRiskLevel: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date of Admission</label>
                <input type="date" value={formData.dateOfAdmission?.split('T')[0] ?? ''} onChange={(e) => setFormData({ ...formData, dateOfAdmission: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Present Age</label>
                <input type="text" value={formData.presentAge ?? ''} onChange={(e) => setFormData({ ...formData, presentAge: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={saveResident} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
