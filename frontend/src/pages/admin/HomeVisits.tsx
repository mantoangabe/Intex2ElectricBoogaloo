import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';

export default function HomeVisits() {
  return (
    <AdminLayout title="Home Visitation & Case Conferences">
      <div className="page-header">
        <div>
          <h2>Home Visitation & Case Conferences</h2>
          <p>Log field visits and track case conference history</p>
        </div>
        <button className="btn btn-primary">+ Log Visit</button>
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
              <th>Resident</th>
              <th>Visit Type</th>
              <th>Social Worker</th>
              <th>Home Environment</th>
              <th>Safety Concerns</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="placeholder-row">
                No visits recorded yet. Click "Log Visit" to create a new record.
              </td>
            </tr>
          </tbody>
        </table>
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
    </AdminLayout>
  );
}
