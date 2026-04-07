import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';

export default function Reports() {
  return (
    <AdminLayout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Insights and trends to support decision-making</p>
        </div>
      </div>

      <div className="filter-bar">
        <input type="date" className="filter-input" placeholder="From date" />
        <input type="date" className="filter-input" placeholder="To date" />
        <select className="filter-select">
          <option>All Safehouses</option>
          <option>Safehouse A</option>
          <option>Safehouse B</option>
        </select>
      </div>

      <div className="admin-card">
        <h3>Donation Trends</h3>
        <div style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Chart placeholder</p>
        </div>
      </div>

      <div className="admin-card">
        <h3>Resident Outcomes</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Education Progress</td>
              <td>Placeholder</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Health Improvements</td>
              <td>Placeholder</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Reintegration Success Rate</td>
              <td>Placeholder</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>Safehouse Performance</h3>
        <div style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Chart placeholder</p>
        </div>
      </div>

      <div className="admin-card">
        <h3>Annual Accomplishment Report</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Beneficiary Count</th>
              <th>Program Outcomes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Caring</td>
              <td>Placeholder</td>
              <td>Placeholder</td>
            </tr>
            <tr>
              <td>Healing</td>
              <td>Placeholder</td>
              <td>Placeholder</td>
            </tr>
            <tr>
              <td>Teaching</td>
              <td>Placeholder</td>
              <td>Placeholder</td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
