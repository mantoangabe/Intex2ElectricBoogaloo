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
  emotionalStateObserved: string;
  followUpActions: string;
}

export default function ProcessRecording() {
  const [recordings, setRecordings] = useState<ProcessRecording[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchRecordings = (skipVal: number) => {
    setLoading(true);
    apiClient.get<ProcessRecording[]>('/ProcessRecordings', { params: { skip: skipVal, take: 25 } })
      .then(res => {
        setHasMore(res.data.length === 25);
        if (skipVal === 0) {
          setRecordings(res.data);
        } else {
          setRecordings(prev => [...prev, ...res.data]);
        }
        setError(null);
      })
      .catch(() => setError('Failed to load process recordings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecordings(0);
  }, []);

  const handleShowMore = () => {
    const newSkip = skip + 25;
    setSkip(newSkip);
    fetchRecordings(newSkip);
  };

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
