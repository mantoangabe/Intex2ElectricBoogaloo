import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface Supporter {
  supporterId: number;
  displayName: string;
  supporterType: string;
  status: string;
}

interface Donation {
  donationId: number;
  supporterId: number;
  donationType: string;
  donationDate: string;
  amount: number | null;
  estimatedValue: number | null;
  currencyCode: string | null;
}

export default function Donors() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [supporterSkip, setSupporterSkip] = useState(0);
  const [donationSkip, setDonationSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supporterHasMore, setSupporterHasMore] = useState(false);
  const [donationHasMore, setDonationHasMore] = useState(false);

  const fetchSupporters = (skip: number) => {
    setLoading(true);
    apiClient.get<Supporter[]>('/Supporters', { params: { skip, take: 25 } })
      .then(res => {
        setSupporterHasMore(res.data.length === 25);
        if (skip === 0) {
          setSupporters(res.data);
        } else {
          setSupporters(prev => [...prev, ...res.data]);
        }
        setError(null);
      })
      .catch(() => setError('Failed to load donors.'))
      .finally(() => setLoading(false));
  };

  const fetchDonations = (skip: number) => {
    setLoading(true);
    apiClient.get<Donation[]>('/Donations', { params: { skip, take: 25 } })
      .then(res => {
        setDonationHasMore(res.data.length === 25);
        if (skip === 0) {
          setDonations(res.data);
        } else {
          setDonations(prev => [...prev, ...res.data]);
        }
        setError(null);
      })
      .catch(() => setError('Failed to load donations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSupporters(0);
    fetchDonations(0);
  }, []);

  const handleShowMoreSupporters = () => {
    const newSkip = supporterSkip + 25;
    setSupporterSkip(newSkip);
    fetchSupporters(newSkip);
  };

  const handleShowMoreDonations = () => {
    const newSkip = donationSkip + 25;
    setDonationSkip(newSkip);
    fetchDonations(newSkip);
  };

  const totalBySupporterId = donations.reduce<Record<number, number>>((acc, d) => {
    const val = d.amount ?? d.estimatedValue ?? 0;
    acc[d.supporterId] = (acc[d.supporterId] ?? 0) + val;
    return acc;
  }, {});

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
            {error && (
              <tr><td colSpan={5} className="placeholder-row">{error}</td></tr>
            )}
            {supporters.length === 0 && !error && (
              <tr><td colSpan={5} className="placeholder-row">No donors found.</td></tr>
            )}
            {supporters.map(s => (
              <tr key={s.supporterId}>
                <td>{s.displayName}</td>
                <td>{s.supporterType}</td>
                <td>{s.status}</td>
                <td>{totalBySupporterId[s.supporterId] ? `$${totalBySupporterId[s.supporterId].toFixed(2)}` : '—'}</td>
                <td><button className="btn btn-sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {supporterHasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleShowMoreSupporters} disabled={loading}>
              {loading ? 'Loading...' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h3>Donation Allocation</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Supporter ID</th>
              <th>Type</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 && !error && (
              <tr><td colSpan={5} className="placeholder-row">No donations recorded.</td></tr>
            )}
            {donations.map(d => (
              <tr key={d.donationId}>
                <td>{d.donationId}</td>
                <td>{d.supporterId}</td>
                <td>{d.donationType}</td>
                <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                <td>{d.amount != null ? `${d.currencyCode ?? '$'}${d.amount.toFixed(2)}` : d.estimatedValue != null ? `~$${d.estimatedValue.toFixed(2)}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {donationHasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn btn-secondary" onClick={handleShowMoreDonations} disabled={loading}>
              {loading ? 'Loading...' : 'Show More'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
