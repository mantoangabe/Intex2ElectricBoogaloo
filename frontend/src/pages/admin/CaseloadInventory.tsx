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
  const PAGE_SIZE = 25;
  const [residents, setResidents] = useState<Resident[]>([]);
  const [progressPredictions, setProgressPredictions] = useState<Record<number, ResidentProgressPrediction>>({});
  const [incidentPredictions, setIncidentPredictions] = useState<Record<number, IncidentRiskPrediction>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const progressMeta = usePredictionMeta('/ResidentProgressPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const incidentMeta = usePredictionMeta('/IncidentRiskPredictions/meta/latest', ENABLE_ML_PREDICTIONS);

  const [showModal, setShowModal] = useState(false);
  const [editResident, setEditResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState<Partial<Resident>>({});
  const [saving, setSaving] = useState(false);

  const fetchResidents = (pageVal: number) => {
    setLoading(true);
    apiClient.get<Resident[]>('/Residents', { params: { skip: (pageVal - 1) * PAGE_SIZE, take: PAGE_SIZE } })
      .then(res => {
        setHasMore(res.data.length === PAGE_SIZE);
        setResidents(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load residents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResidents(1);
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
      fetchResidents(0);
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
        fetchResidents(0);
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
      </div>

      <div className="admin-card">
        <h3>Resident Profiles</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Case Control No.</th>
              <th>Age</th>
              <th>Case Category</th>
              <th>Safehouse</th>
              <th>Status</th>
              {ENABLE_ML_PREDICTIONS && <th>Low Progress Risk</th>}
              {ENABLE_ML_PREDICTIONS && <th>Incident Risk</th>}
              <th>Assigned Social Worker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={ENABLE_ML_PREDICTIONS ? 10 : 8} className="placeholder-row">{error}</td></tr>
            )}
            {residents.length === 0 && !error && (
              <tr><td colSpan={ENABLE_ML_PREDICTIONS ? 10 : 8} className="placeholder-row">No residents found.</td></tr>
            )}
            {residents.map(r => (
              <tr key={r.residentId}>
                <td>{r.residentId}</td>
                <td>{r.caseControlNo}</td>
                <td>{r.presentAge}</td>
                <td>{r.caseCategory}</td>
                <td>{r.safehouseId}</td>
                <td>{r.caseStatus}</td>
                {ENABLE_ML_PREDICTIONS && (
                  <td>
                    {progressPredictions[r.residentId]
                      ? <PredictionBadge probability={progressPredictions[r.residentId].lowProgressRiskProbability} />
                      : '—'}
                  </td>
                )}
                {ENABLE_ML_PREDICTIONS && (
                  <td>
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
            const p = page - 1; setPage(p); fetchResidents(p);
          }}>Previous</button>
          <span>Page {page}</span>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchResidents(p);
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
