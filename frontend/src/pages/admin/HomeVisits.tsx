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
  const DEFAULT_PAGE_SIZE = 25;
  const [visits, setVisits] = useState<HomeVisitation[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [jumpPage, setJumpPage] = useState('1');
  const [sortConfig, setSortConfig] = useState<{ key: keyof HomeVisitation; dir: 'asc' | 'desc' }>({ key: 'visitDate', dir: 'desc' });
  const sortedVisits = [...visits].sort((a, b) => {
    const dir = sortConfig.dir === 'asc' ? 1 : -1;
    return String(a[sortConfig.key] ?? '').localeCompare(String(b[sortConfig.key] ?? '')) * dir;
  });
  const toggleSort = (key: keyof HomeVisitation) =>
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editVisit, setEditVisit] = useState<HomeVisitation | null>(null);
  const [formData, setFormData] = useState<Partial<HomeVisitation>>({});
  const [saving, setSaving] = useState(false);

  const fetchVisits = (pageVal: number, size: number) => {
    setLoading(true);
    apiClient.get<HomeVisitation[]>('/HomeVisitations', { params: { skip: (pageVal - 1) * size, take: size } })
      .then(res => {
        setHasMore(res.data.length === size);
        setVisits(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load home visitations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisits(1, pageSize);
    apiClient.get<HomeVisitation[]>('/HomeVisitations', { params: { skip: 0, take: 100000 } }).then(r => setTotalCount(r.data.length)).catch(() => {});
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
      fetchVisits(1, pageSize);
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
        fetchVisits(page, pageSize);
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
              <th className="clickable-th" onClick={() => toggleSort('visitDate')}>Date {sortConfig.key === 'visitDate' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>
              <th className="clickable-th" onClick={() => toggleSort('residentId')}>Resident ID {sortConfig.key === 'residentId' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>
              <th className="clickable-th" onClick={() => toggleSort('visitType')}>Visit Type {sortConfig.key === 'visitType' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>
              <th className="clickable-th" onClick={() => toggleSort('socialWorker')}>Social Worker {sortConfig.key === 'socialWorker' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '↕'}</th>
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
            {sortedVisits.map(v => (
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
            const p = page - 1; setPage(p); fetchVisits(p, pageSize);
          }}>Previous</button>
          <span>Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
          <input className="pagination-jump-input" type="number" min={1} max={Math.max(1, Math.ceil(totalCount / pageSize))} value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} />
          <button className="btn btn-secondary btn-sm" onClick={() => {
            const max = Math.max(1, Math.ceil(totalCount / pageSize));
            const p = Math.min(max, Math.max(1, Number(jumpPage) || 1));
            setPage(p);
            fetchVisits(p, pageSize);
          }}>Go</button>
          <select className="filter-select" style={{ marginLeft: 'auto' }} value={pageSize} onChange={(e) => {
            const size = Number(e.target.value);
            setPageSize(size);
            setPage(1);
            fetchVisits(1, size);
          }}>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button className="btn btn-secondary btn-sm" disabled={!hasMore || loading} onClick={() => {
            const p = page + 1; setPage(p); fetchVisits(p, pageSize);
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
