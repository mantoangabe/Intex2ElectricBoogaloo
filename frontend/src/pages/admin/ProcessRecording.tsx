import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';

export default function ProcessRecording() {
  return (
    <AdminLayout title="Process Recording">
      <div className="page-header">
        <div>
          <h2>Process Recording</h2>
          <p>Document counseling sessions and emotional support interventions</p>
        </div>
        <button className="btn btn-primary">+ New Session Note</button>
      </div>

      <div className="filter-bar">
        <select className="filter-select">
          <option>Select Resident...</option>
          <option>Resident 1</option>
          <option>Resident 2</option>
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
              <th>Resident</th>
              <th>Social Worker</th>
              <th>Session Type</th>
              <th>Emotional State</th>
              <th>Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="placeholder-row">
                Select a resident to view session history.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h3>About This Page</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Maintain a chronological record of each resident's healing journey. Each session captures: date, social worker,
          session type (individual/group), emotional state observed, narrative summary, interventions, and follow-up actions.
        </p>
      </div>
    </AdminLayout>
  );
}
