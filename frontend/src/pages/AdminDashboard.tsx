import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminDashboard.css';
import apiClient from '../api/apiClient';

export default function AdminDashboard() {
  const [residentCount, setResidentCount] = useState<number | null>(null);
  const [supporterCount, setSupporterCount] = useState<number | null>(null);
  const [donationTotal, setDonationTotal] = useState<number | null>(null);
  const [safehouseCount, setSafehouseCount] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get('/Residents').then(r => setResidentCount(r.data.length));
    apiClient.get('/Supporters').then(r => setSupporterCount(r.data.length));
    apiClient.get('/Donations').then(r => {
      const total = r.data.reduce((sum: number, d: { amount?: number; estimatedValue?: number }) =>
        sum + (d.amount ?? d.estimatedValue ?? 0), 0);
      setDonationTotal(total);
    });
    apiClient.get('/Safehouses').then(r => setSafehouseCount(r.data.length));
  }, []);

  const fmt = (val: number | null) => val === null ? '...' : val.toLocaleString();

  return (
    <AdminLayout title="SafeHaven Admin Dashboard">
      <div className="admin-welcome">
        <h2>Welcome back, Staff Member</h2>
        <p>Here's an overview of your operations</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{fmt(residentCount)}</div>
          <div className="metric-label">Total Residents</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{fmt(supporterCount)}</div>
          <div className="metric-label">Total Supporters</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{donationTotal === null ? '...' : `$${donationTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
          <div className="metric-label">Total Donations</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{fmt(safehouseCount)}</div>
          <div className="metric-label">Active Safehouses</div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Quick Actions</h3>
        <div className="quick-actions">
          {[
            'New Resident Admission',
            'Record Donation',
            'Schedule Visit',
            'Add Process Note'
          ].map((action) => (
            <button key={action} className="btn btn-primary btn-sm" style={{ marginRight: '0.5rem' }}>
              {action}
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
