import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface ProcessRecording {
  recordingId: number;
  residentId: number;
  sessionDate: string;
  socialWorker: string;
  sessionType: string;
  sessionDurationMinutes: number;
  emotionalStateObserved: string;
  emotionalStateEnd: string;
  sessionNarrative: string;
  interventionsApplied: string;
  followUpActions: string;
  progressNoted: boolean;
  concernsFlagged: boolean;
  referralMade: boolean;
}

export default function ProcessRecording() {
  const PAGE_SIZE = 25;
  const [recordings, setRecordings] = useState<ProcessRecording[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editRecording, setEditRecording] = useState<ProcessRecording | null>(null);
  const [formData, setFormData] = useState<Partial<ProcessRecording>>({});
  const [saving, setSaving] = useState(false);

  const fetchRecordings = (pageVal: number) => {
    setLoading(true);
    apiClient.get<ProcessRecording[]>('/ProcessRecordings', { params: { skip: (pageVal - 1) * PAGE_SIZE, take: PAGE_SIZE } })
      .then(res => {
        setHasMore(res.data.length === PAGE_SIZE);
        setRecordings(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load process recordings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecordings(1);
  }, []);

  const openModal = (recording: ProcessRecording | null) => {
    setEditRecording(recording);
    setFormData(recording ? { ...recording } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditRecording(null);
    setFormData({});
  };

  const saveRecording = async () => {
    setSaving(true);
    try {
      if (editRecording?.recordingId) {
        await apiClient.put(`/ProcessRecordings/${editRecording.recordingId}`, formData);
      } else {
        await apiClient.post('/ProcessRecordings', formData);
      }
      fetchRecordings(0);
      closeModal();
    } catch (err) {
      alert('Failed to save recording.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecording = async (id: number) => {
    if (window.confirm('Delete this recording?')) {
      try {
        await apiClient.delete(`/ProcessRecordings/${id}`);
        fetchRecordings(0);
      } catch (err) {
        alert('Failed to delete recording.');
      }
    }
  };

  return (
    <AdminLayout title="Process Recording">
      <div className="page-header">
        <div>
          <h2>Process Recording</h2>
          <p>Document counseling sessions and emotional support interventions</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>+ New Session Note</button>
      </div>

      <div className="filter-bar">
        <select className="filter-select">
          <option>Select Resident...</option>
        </select>
        <input type="date" className="filter-input" placeholder="From date" />
        <input type="date" className="filter-input" placeholder="To date" />
      </div>

      <div className="admin-card">
        <h3>Session Records</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Resident ID</th>
              <th>Social Worker</th>
              <th>Session Type</th>
              <th>Emotional State</th>
              <th>Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={7} className="placeholder-row">{error}</td></tr>
            )}
            {recordings.length === 0 && !error && (
              <tr><td colSpan={7} className="placeholder-row">No session records found.</td></tr>
            )}
            {recordings.map(r => (
              <tr key={r.recordingId}>
                <td>{new Date(r.sessionDate).toLocaleDateString()}</td>
                <td>{r.residentId}</td>
                <td>{r.socialWorker}</td>
                <td>{r.sessionType}</td>
                <td>{r.emotionalStateObserved}</td>
                <td>{r.followUpActions}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openModal(r)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteRecording(r.recordingId!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button className="btn btn-secondary btn-sm" disabled={page === 1 || loading} onClick={() => {
            const p = page - 1; setPage(p); fetchRecordings(p);
          }}>Previous</button>
          <span>Page {page}</span>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchRecordings(p);
          }}>Next</button>
        </div>
      </div>

      <div className="admin-card">
        <h3>About This Page</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Maintain a chronological record of each resident's healing journey. Each session captures: date, social worker,
          session type (individual/group), emotional state observed, narrative summary, interventions, and follow-up actions.
        </p>
      </div>

      {/* Process Recording Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editRecording ? 'Edit Session Note' : 'New Session Note'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Resident ID</label>
                <input type="number" value={formData.residentId ?? ''} onChange={(e) => setFormData({ ...formData, residentId: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Session Date</label>
                <input type="date" value={formData.sessionDate?.split('T')[0] ?? ''} onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Social Worker</label>
                <input type="text" value={formData.socialWorker ?? ''} onChange={(e) => setFormData({ ...formData, socialWorker: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Session Type</label>
                <input type="text" value={formData.sessionType ?? ''} onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Session Duration (minutes)</label>
                <input type="number" value={formData.sessionDurationMinutes ?? ''} onChange={(e) => setFormData({ ...formData, sessionDurationMinutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Emotional State Observed</label>
                <input type="text" value={formData.emotionalStateObserved ?? ''} onChange={(e) => setFormData({ ...formData, emotionalStateObserved: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Emotional State (End)</label>
                <input type="text" value={formData.emotionalStateEnd ?? ''} onChange={(e) => setFormData({ ...formData, emotionalStateEnd: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Session Narrative</label>
                <textarea value={formData.sessionNarrative ?? ''} onChange={(e) => setFormData({ ...formData, sessionNarrative: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Interventions Applied</label>
                <textarea value={formData.interventionsApplied ?? ''} onChange={(e) => setFormData({ ...formData, interventionsApplied: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Follow-up Actions</label>
                <textarea value={formData.followUpActions ?? ''} onChange={(e) => setFormData({ ...formData, followUpActions: e.target.value })} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.progressNoted ?? false} onChange={(e) => setFormData({ ...formData, progressNoted: e.target.checked })} />
                  {' '}Progress Noted
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.concernsFlagged ?? false} onChange={(e) => setFormData({ ...formData, concernsFlagged: e.target.checked })} />
                  {' '}Concerns Flagged
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.referralMade ?? false} onChange={(e) => setFormData({ ...formData, referralMade: e.target.checked })} />
                  {' '}Referral Made
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={saveRecording} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
