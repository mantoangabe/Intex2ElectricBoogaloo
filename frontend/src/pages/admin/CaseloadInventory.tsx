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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<Resident[]>('/Residents')
      .then(res => setResidents(res.data))
      .catch(() => setError('Failed to load residents.'))
      .finally(() => setLoading(false));
  }, []);

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
            {loading && (
              <tr><td colSpan={8} className="placeholder-row">Loading...</td></tr>
            )}
            {error && (
              <tr><td colSpan={8} className="placeholder-row">{error}</td></tr>
            )}
            {!loading && !error && residents.length === 0 && (
              <tr><td colSpan={8} className="placeholder-row">No residents found.</td></tr>
            )}
            {!loading && !error && residents.map(r => (
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
      </div>
    </AdminLayout>
  );
}
