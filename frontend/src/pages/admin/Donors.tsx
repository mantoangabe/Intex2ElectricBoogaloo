import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';

export default function Donors() {
  return (
    <AdminLayout title="Donors & Contributions">
      <div className="page-header">
        <div>
          <h2>Donors & Contributions</h2>
          <p>Manage supporter profiles and track donations</p>
        </div>
        <button className="btn btn-primary">+ Add Donor</button>
      </div>

      <div className="filter-bar">
        <input type="text" placeholder="Search donors..." className="filter-input" />
        <select className="filter-select">
          <option>All Types</option>
          <option>Monetary</option>
          <option>In-Kind</option>
          <option>Time/Skills</option>
        </select>
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="admin-card">
        <h3>Donor List</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Total Contributed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="placeholder-row">
                No donors yet. Click "Add Donor" to create a new record.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>Donation Allocation</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          View donations distributed across safehouses and program areas.
        </p>
      </div>
    </AdminLayout>
  );
}
