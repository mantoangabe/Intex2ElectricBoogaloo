import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface Resident {
  residentId: number;
  caseControlNo: string;
  presentAge: string;
  caseCategory: string;
  safehouseId: number;
  caseStatus: string;
  assignedSocialWorker: string;
}

export default function CaseloadInventory() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchResidents = (skipVal: number) => {
    setLoading(true);
    apiClient.get<Resident[]>('/Residents', { params: { skip: skipVal, take: 25 } })
      .then(res => {
        setHasMore(res.data.length === 25);
        if (skipVal === 0) {
          setResidents(res.data);
        } else {
          setResidents(prev => [...prev, ...res.data]);
        }
        setError(null);
      })
      .catch(() => setError('Failed to load residents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResidents(0);
  }, []);

  const handleShowMore = () => {
    const newSkip = skip + 25;
    setSkip(newSkip);
    fetchResidents(newSkip);
  };

  return (
    <AdminLayout title="Caseload Inventory">
      <div className="page-header">
        <div>
          <h2>Caseload Inventory</h2>
          <p>Core case management — residents, demographics, case categories, and reintegration tracking</p>
        </div>
        <button className="btn btn-primary">+ New Resident</button>
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
              <th>Assigned Social Worker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={8} className="placeholder-row">{error}</td></tr>
            )}
            {residents.length === 0 && !error && (
              <tr><td colSpan={8} className="placeholder-row">No residents found.</td></tr>
            )}
            {residents.map(r => (
              <tr key={r.residentId}>
                <td>{r.residentId}</td>
                <td>{r.caseControlNo}</td>
                <td>{r.presentAge}</td>
                <td>{r.caseCategory}</td>
                <td>{r.safehouseId}</td>
                <td>{r.caseStatus}</td>
                <td>{r.assignedSocialWorker}</td>
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
    </AdminLayout>
  );
}
