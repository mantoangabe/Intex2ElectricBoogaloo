import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';

export default function CaseloadInventory() {
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
              <th>Name</th>
              <th>Age</th>
              <th>Case Category</th>
              <th>Safehouse</th>
              <th>Status</th>
              <th>Assigned Social Worker</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="placeholder-row">
                No residents yet. Click "New Resident" to create a profile.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
