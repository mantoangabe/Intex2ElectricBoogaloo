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
  locationVisited: string;
  familyMembersPresent: string;
  purpose: string;
  observations: string;
  familyCooperationLevel: string;
  safetyConcernsNoted: boolean;
  followUpNeeded: boolean;
  followUpNotes: string;
  visitOutcome: string;
}

export default function HomeVisits() {
  const PAGE_SIZE = 25;
  const [visits, setVisits] = useState<HomeVisitation[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editVisit, setEditVisit] = useState<HomeVisitation | null>(null);
  const [formData, setFormData] = useState<Partial<HomeVisitation>>({});
  const [saving, setSaving] = useState(false);

  const fetchVisits = (pageVal: number) => {
    setLoading(true);
    apiClient.get<HomeVisitation[]>('/HomeVisitations', { params: { skip: (pageVal - 1) * PAGE_SIZE, take: PAGE_SIZE } })
      .then(res => {
        setHasMore(res.data.length === PAGE_SIZE);
        setVisits(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load home visitations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits(1);
  }, []);

  const openModal = (visit: HomeVisitation | null) => {
    setEditVisit(visit);
    setFormData(visit ? { ...visit } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditVisit(null);
    setFormData({});
  };

  const saveVisit = async () => {
    setSaving(true);
    try {
      if (editVisit?.visitationId) {
        await apiClient.put(`/HomeVisitations/${editVisit.visitationId}`, formData);
      } else {
        await apiClient.post('/HomeVisitations', formData);
      }
      fetchVisits(0);
      closeModal();
    } catch (err) {
      alert('Failed to save visit.');
    } finally {
      setSaving(false);
    }
  };

  const deleteVisit = async (id: number) => {
    if (window.confirm('Delete this visit?')) {
      try {
        await apiClient.delete(`/HomeVisitations/${id}`);
        fetchVisits(0);
      } catch (err) {
        alert('Failed to delete visit.');
      }
    }
  };

  return (
    <AdminLayout title="Home Visitation & Case Conferences">
      <div className="page-header">
        <div>
          <h2>Home Visitation & Case Conferences</h2>
          <p>Log field visits and track case conference history</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>+ Log Visit</button>
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
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openModal(v)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteVisit(v.visitationId!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button className="btn btn-secondary btn-sm" disabled={page === 1 || loading} onClick={() => {
            const p = page - 1; setPage(p); fetchVisits(p);
          }}>Previous</button>
          <span>Page {page}</span>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchVisits(p);
          }}>Next</button>
        </div>
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

      {/* Home Visit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editVisit ? 'Edit Visit' : 'Log Visit'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Resident ID</label>
                <input type="number" value={formData.residentId ?? ''} onChange={(e) => setFormData({ ...formData, residentId: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Visit Date</label>
                <input type="date" value={formData.visitDate?.split('T')[0] ?? ''} onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Social Worker</label>
                <input type="text" value={formData.socialWorker ?? ''} onChange={(e) => setFormData({ ...formData, socialWorker: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Visit Type</label>
                <input type="text" value={formData.visitType ?? ''} onChange={(e) => setFormData({ ...formData, visitType: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location Visited</label>
                <input type="text" value={formData.locationVisited ?? ''} onChange={(e) => setFormData({ ...formData, locationVisited: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Family Members Present</label>
                <input type="text" value={formData.familyMembersPresent ?? ''} onChange={(e) => setFormData({ ...formData, familyMembersPresent: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <textarea value={formData.purpose ?? ''} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Observations</label>
                <textarea value={formData.observations ?? ''} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Family Cooperation Level</label>
                <input type="text" value={formData.familyCooperationLevel ?? ''} onChange={(e) => setFormData({ ...formData, familyCooperationLevel: e.target.value })} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.safetyConcernsNoted ?? false} onChange={(e) => setFormData({ ...formData, safetyConcernsNoted: e.target.checked })} />
                  {' '}Safety Concerns Noted
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={formData.followUpNeeded ?? false} onChange={(e) => setFormData({ ...formData, followUpNeeded: e.target.checked })} />
                  {' '}Follow-up Needed
                </label>
              </div>
              <div className="form-group">
                <label>Follow-up Notes</label>
                <textarea value={formData.followUpNotes ?? ''} onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Visit Outcome</label>
                <input type="text" value={formData.visitOutcome ?? ''} onChange={(e) => setFormData({ ...formData, visitOutcome: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={saveVisit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
