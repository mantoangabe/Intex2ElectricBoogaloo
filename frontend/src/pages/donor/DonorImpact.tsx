import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import '../../styles/styles.css';
import apiClient from '../../api/apiClient';

interface Donation {
  donationId: number;
  supporterId: number;
  donationDate: string;
  amount?: number;
  estimatedValue?: number;
}

interface Supporter {
  supporterId: number;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export default function DonorImpact() {
  const [totalThisYear, setTotalThisYear] = useState<number | null>(null);
  const [topDonorName, setTopDonorName] = useState<string | null>(null);
  const [residentCount, setResidentCount] = useState<number | null>(null);
  const [safehouseCount, setSafehouseCount] = useState<number | null>(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();

    Promise.all([
      apiClient.get<Donation[]>('/Donations', { params: { take: 10000 } }),
      apiClient.get<Supporter[]>('/Supporters', { params: { take: 10000 } }),
    ]).then(([donRes, supRes]) => {
      const yearDonations = donRes.data.filter(
        d => new Date(d.donationDate).getFullYear() === currentYear
      );

      const total = yearDonations.reduce(
        (sum, d) => sum + (d.amount ?? d.estimatedValue ?? 0), 0
      );
      setTotalThisYear(total);

      const totals: Record<number, number> = {};
      yearDonations.forEach(d => {
        totals[d.supporterId] = (totals[d.supporterId] ?? 0) + (d.amount ?? d.estimatedValue ?? 0);
      });
      const topId = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topId) {
        const supporter = supRes.data.find(s => s.supporterId === Number(topId));
        if (supporter) {
          const name =
            supporter.displayName ||
            [supporter.firstName, supporter.lastName].filter(Boolean).join(' ');
          setTopDonorName(name || 'N/A');
        }
      } else {
        setTopDonorName('N/A');
      }
    }).catch(() => {
      setTotalThisYear(0);
      setTopDonorName('N/A');
    });

    apiClient.get('/Residents', { params: { take: 10000 } })
      .then(r => setResidentCount(r.data.length))
      .catch(() => setResidentCount(null));

    apiClient.get('/Safehouses', { params: { take: 10000 } })
      .then(r => setSafehouseCount(r.data.length))
      .catch(() => setSafehouseCount(null));
  }, []);

  const fmt = (val: number | null) => val === null ? '...' : val.toLocaleString();

  const cardStyle: React.CSSProperties = {
    background: 'var(--white)',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-sm)',
    padding: '2.5rem 3rem',
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--text)', marginBottom: '2rem' }}>
          Dashboard
        </h1>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <p style={{ color: 'var(--text)', fontWeight: 600, margin: 0, textAlign: 'center' }}>
              Total Donated This Year
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.75rem 0', color: 'var(--text)' }}>
              {totalThisYear === null
                ? '...'
                : `$${totalThisYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            </p>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0.25rem', fontWeight: 600, textAlign: 'center' }}>
              Top Donor
            </p>
            <p style={{ color: 'var(--text)', margin: 0, fontWeight: 500, textAlign: 'center' }}>
              {topDonorName ?? '...'}
            </p>
          </div>

          <div style={cardStyle}>
            <p style={{ color: 'var(--text)', fontWeight: 600, margin: 0, textAlign: 'center' }}>
              Active Residents
            </p>
            <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.75rem 0', color: 'var(--text)' }}>
              {fmt(residentCount)}
            </p>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0.25rem', fontWeight: 600, textAlign: 'center' }}>
              Safehouses
            </p>
            <p style={{ color: 'var(--text)', margin: 0, fontWeight: 500, textAlign: 'center' }}>
              {fmt(safehouseCount)}
            </p>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} River of Life. All rights reserved. | <a href="/privacy">Privacy Policy</a> |{' '}
          <a href="/cookies">Cookie Policy</a>
        </p>
      </footer>
    </div>
  );
}
