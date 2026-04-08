import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';
import PredictionBadge from '../../components/PredictionBadge';
import LastRefreshChip from '../../components/LastRefreshChip';
import { ENABLE_ML_PREDICTIONS } from '../../config/features';
import { usePredictionMeta } from '../../hooks/usePredictionMeta';
import type { DonorRetentionPrediction } from '../../types/predictions';

interface Supporter {
  supporterId: number;
  displayName: string;
  supporterType: string;
  status: string;
  relationshipType: string;
  region: string;
  country: string;
  email: string;
  phone: string;
  acquisitionChannel: string;
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
  const PAGE_SIZE = 25;
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [predictions, setPredictions] = useState<Record<number, DonorRetentionPrediction>>({});
  const [supporterPage, setSupporterPage] = useState(1);
  const [donationPage, setDonationPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supporterHasMore, setSupporterHasMore] = useState(false);
  const [donationHasMore, setDonationHasMore] = useState(false);
  const [activeSection, setActiveSection] = useState<'donors' | 'donations'>('donors');
  const predictionMeta = usePredictionMeta('/DonorRetentionPredictions/meta/latest', ENABLE_ML_PREDICTIONS);

  // Supporter modal state
  const [showSupporterModal, setShowSupporterModal] = useState(false);
  const [editSupporter, setEditSupporter] = useState<Supporter | null>(null);
  const [supporterFormData, setSupporterFormData] = useState<Partial<Supporter>>({});
  const [savingSupporter, setSavingSupporter] = useState(false);

  // Donation modal state
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [editDonation, setEditDonation] = useState<Donation | null>(null);
  const [donationFormData, setDonationFormData] = useState<Partial<Donation>>({});
  const [savingDonation, setSavingDonation] = useState(false);

  const fetchSupporters = (page: number) => {
    setLoading(true);
    apiClient.get<Supporter[]>('/Supporters', { params: { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE } })
      .then(res => {
        setSupporterHasMore(res.data.length === PAGE_SIZE);
        setSupporters(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load donors.'))
      .finally(() => setLoading(false));
  };

  const fetchDonations = (page: number) => {
    setLoading(true);
    apiClient.get<Donation[]>('/Donations', { params: { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE } })
      .then(res => {
        setDonationHasMore(res.data.length === PAGE_SIZE);
        setDonations(res.data);
        setError(null);
      })
      .catch(() => setError('Failed to load donations.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSupporters(1);
    fetchDonations(1);
    if (ENABLE_ML_PREDICTIONS) {
      apiClient
        .get<DonorRetentionPrediction[]>('/DonorRetentionPredictions', {
          params: { skip: 0, take: 2000, latestOnly: true, sort: 'score_desc' },
        })
        .then(res => {
          const map = res.data.reduce<Record<number, DonorRetentionPrediction>>((acc, row) => {
            acc[row.supporterId] = row;
            return acc;
          }, {});
          setPredictions(map);
        })
        .catch(() => setPredictions({}));
    }
  }, []);

  const fmtUsd = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const openSupporterModal = (supporter: Supporter | null) => {
    setEditSupporter(supporter);
    setSupporterFormData(supporter ? { ...supporter } : {});
    setShowSupporterModal(true);
  };

  const closeSupporterModal = () => {
    setShowSupporterModal(false);
    setEditSupporter(null);
    setSupporterFormData({});
  };

  const saveSupporter = async () => {
    setSavingSupporter(true);
    try {
      if (editSupporter?.supporterId) {
        await apiClient.put(`/Supporters/${editSupporter.supporterId}`, supporterFormData);
      } else {
        await apiClient.post('/Supporters', supporterFormData);
      }
      fetchSupporters(0);
      closeSupporterModal();
    } catch (err) {
      alert('Failed to save supporter.');
    } finally {
      setSavingSupporter(false);
    }
  };

  const deleteSupporter = async (id: number) => {
    if (window.confirm('Delete this supporter?')) {
      try {
        await apiClient.delete(`/Supporters/${id}`);
        fetchSupporters(0);
      } catch (err) {
        alert('Failed to delete supporter.');
      }
    }
  };

  const openDonationModal = (donation: Donation | null) => {
    setEditDonation(donation);
    setDonationFormData(donation ? { ...donation } : {});
    setShowDonationModal(true);
  };

  const closeDonationModal = () => {
    setShowDonationModal(false);
    setEditDonation(null);
    setDonationFormData({});
  };

  const saveDonation = async () => {
    setSavingDonation(true);
    try {
      if (editDonation?.donationId) {
        await apiClient.put(`/Donations/${editDonation.donationId}`, donationFormData);
      } else {
        await apiClient.post('/Donations', donationFormData);
      }
      fetchDonations(0);
      closeDonationModal();
    } catch (err) {
      alert('Failed to save donation.');
    } finally {
      setSavingDonation(false);
    }
  };

  const deleteDonation = async (id: number) => {
    if (window.confirm('Delete this donation?')) {
      try {
        await apiClient.delete(`/Donations/${id}`);
        fetchDonations(0);
      } catch (err) {
        alert('Failed to delete donation.');
      }
    }
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
        <button className="btn btn-primary" onClick={() => openSupporterModal(null)}>+ Add Donor</button>
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

      <div className="toggle-group">
        <button
          className={`btn btn-sm ${activeSection === 'donors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('donors')}
        >
          Donor List
        </button>
        <button
          className={`btn btn-sm ${activeSection === 'donations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSection('donations')}
        >
          Donation Allocation
        </button>
      </div>

      {activeSection === 'donors' && <div className="admin-card">
        <h3>Donor List</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              {ENABLE_ML_PREDICTIONS && <th>Lapse Risk</th>}
              {ENABLE_ML_PREDICTIONS && <th>Lapse Probability</th>}
              {ENABLE_ML_PREDICTIONS && <th>Reach Out</th>}
              <th>Total Contributed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={ENABLE_ML_PREDICTIONS ? 8 : 5} className="placeholder-row">{error}</td></tr>
            )}
            {supporters.length === 0 && !error && (
              <tr><td colSpan={ENABLE_ML_PREDICTIONS ? 8 : 5} className="placeholder-row">No donors found.</td></tr>
            )}
            {supporters.map(s => (
              <tr key={s.supporterId}>
                <td>{s.displayName}</td>
                <td>{s.supporterType}</td>
                <td>{s.status}</td>
                {ENABLE_ML_PREDICTIONS && (
                  <td>{predictions[s.supporterId] ? <PredictionBadge probability={predictions[s.supporterId].lapseRiskProbability} /> : '—'}</td>
                )}
                {ENABLE_ML_PREDICTIONS && (
                  <td>{predictions[s.supporterId] ? `${(predictions[s.supporterId].lapseRiskProbability * 100).toFixed(1)}%` : '—'}</td>
                )}
                {ENABLE_ML_PREDICTIONS && (
                  <td>{predictions[s.supporterId] ? (predictions[s.supporterId].lapseRiskProbability >= 0.5 ? 'Yes' : 'No') : '—'}</td>
                )}
                <td>{totalBySupporterId[s.supporterId] ? `$${totalBySupporterId[s.supporterId].toFixed(2)}` : '—'}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openSupporterModal(s)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteSupporter(s.supporterId!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button className="btn btn-secondary btn-sm" disabled={supporterPage === 1 || loading} onClick={() => {
            const p = supporterPage - 1; setSupporterPage(p); fetchSupporters(p);
          }}>Previous</button>
          <span>Page {supporterPage}</span>
          <button className="btn btn-secondary btn-sm" disabled={!supporterHasMore || loading} onClick={() => {
            const p = supporterPage + 1; setSupporterPage(p); fetchSupporters(p);
          }}>Next</button>
        </div>
        {ENABLE_ML_PREDICTIONS && (
          <div style={{ marginTop: '0.75rem' }}>
            <LastRefreshChip meta={predictionMeta} label="Donor lapse model" />
          </div>
        )}
      </div>}

      {activeSection === 'donations' && <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Donation Allocation</h3>
          <button className="btn btn-primary btn-sm" onClick={() => openDonationModal(null)}>+ Add Donation</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Supporter ID</th>
              <th>Type</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Actions</th>
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
                <td>{d.amount != null ? fmtUsd(d.amount) : d.estimatedValue != null ? `~${fmtUsd(d.estimatedValue)}` : '—'}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openDonationModal(d)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteDonation(d.donationId!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button className="btn btn-secondary btn-sm" disabled={donationPage === 1 || loading} onClick={() => {
            const p = donationPage - 1; setDonationPage(p); fetchDonations(p);
          }}>Previous</button>
          <span>Page {donationPage}</span>
          <button className="btn btn-secondary btn-sm" disabled={!donationHasMore || loading} onClick={() => {
            const p = donationPage + 1; setDonationPage(p); fetchDonations(p);
          }}>Next</button>
        </div>
      </div>}

      {/* Supporter Modal */}
      {showSupporterModal && (
        <div className="modal-overlay" onClick={closeSupporterModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editSupporter ? 'Edit Donor' : 'Add Donor'}</h3>
              <button className="modal-close" onClick={closeSupporterModal}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" value={supporterFormData.displayName ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, displayName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Supporter Type</label>
                <input type="text" value={supporterFormData.supporterType ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, supporterType: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <input type="text" value={supporterFormData.status ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, status: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Relationship Type</label>
                <input type="text" value={supporterFormData.relationshipType ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, relationshipType: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Region</label>
                <input type="text" value={supporterFormData.region ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, region: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input type="text" value={supporterFormData.country ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, country: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={supporterFormData.email ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={supporterFormData.phone ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Acquisition Channel</label>
                <input type="text" value={supporterFormData.acquisitionChannel ?? ''} onChange={(e) => setSupporterFormData({ ...supporterFormData, acquisitionChannel: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeSupporterModal} disabled={savingSupporter}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSupporter} disabled={savingSupporter}>{savingSupporter ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="modal-overlay" onClick={closeDonationModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editDonation ? 'Edit Donation' : 'Add Donation'}</h3>
              <button className="modal-close" onClick={closeDonationModal}>×</button>
            </div>
            <div>
              <div className="form-group">
                <label>Supporter ID</label>
                <input type="number" value={donationFormData.supporterId ?? ''} onChange={(e) => setDonationFormData({ ...donationFormData, supporterId: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Donation Type</label>
                <input type="text" value={donationFormData.donationType ?? ''} onChange={(e) => setDonationFormData({ ...donationFormData, donationType: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Donation Date</label>
                <input type="date" value={donationFormData.donationDate?.split('T')[0] ?? ''} onChange={(e) => setDonationFormData({ ...donationFormData, donationDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" step="0.01" value={donationFormData.amount ?? ''} onChange={(e) => setDonationFormData({ ...donationFormData, amount: parseFloat(e.target.value) || null })} />
              </div>
              <div className="form-group">
                <label>Estimated Value</label>
                <input type="number" step="0.01" value={donationFormData.estimatedValue ?? ''} onChange={(e) => setDonationFormData({ ...donationFormData, estimatedValue: parseFloat(e.target.value) || null })} />
              </div>
              <div className="form-group">
                <label>Currency Code</label>
                <input type="text" value={donationFormData.currencyCode ?? ''} onChange={(e) => setDonationFormData({ ...donationFormData, currencyCode: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDonationModal} disabled={savingDonation}>Cancel</button>
              <button className="btn btn-primary" onClick={saveDonation} disabled={savingDonation}>{savingDonation ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
