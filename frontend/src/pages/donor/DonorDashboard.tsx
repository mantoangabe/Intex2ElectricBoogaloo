import { useState, type FormEvent } from 'react';
import Navbar from '../../components/Navbar';
import '../../styles/styles.css';

export default function DonorDashboard() {
  const [donationAmount, setDonationAmount] = useState('');
  const [donationType, setDonationType] = useState('Monetary');
  const [programArea, setProgramArea] = useState('General');
  const [note, setNote] = useState('');

  const handleDonate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDonationAmount('');
    setDonationType('Monetary');
    setProgramArea('General');
    setNote('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div className="page-header">
          <div>
            <h2 style={{ color: 'var(--text)', margin: 0 }}>My Donor Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
              Manage your contributions and view your impact
            </p>
          </div>
        </div>

        {/* Make a Donation Form */}
        <div className="admin-card">
          <h3>Make a Donation</h3>
          <form onSubmit={handleDonate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="$50.00"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Donation Type</label>
                <select value={donationType} onChange={(e) => setDonationType(e.target.value)}>
                  <option>Monetary</option>
                  <option>In-Kind</option>
                  <option>Skills</option>
                  <option>Time</option>
                </select>
              </div>

              <div className="form-group">
                <label>Program Area</label>
                <select value={programArea} onChange={(e) => setProgramArea(e.target.value)}>
                  <option>General</option>
                  <option>Safehouse A</option>
                  <option>Safehouse B</option>
                  <option>Education Program</option>
                  <option>Health Services</option>
                  <option>Reintegration</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Note (Optional)</label>
              <textarea
                placeholder="Special instructions or comments..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ fontFamily: 'var(--sans)', padding: '0.7rem 0.9rem', border: '1px solid var(--border)', borderRadius: '6px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Donate Now
            </button>
          </form>
        </div>

        {/* Donation History */}
        <div className="admin-card">
          <h3>Donation History</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Program Area</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="placeholder-row">
                  No donations yet. Make your first donation above!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} SafeHaven PH. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
