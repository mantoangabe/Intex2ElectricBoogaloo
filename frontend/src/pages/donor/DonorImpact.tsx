import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import '../../styles/styles.css';
import '../../styles/DonorImpact.css';
import apiClient from '../../api/apiClient';

interface PublicOkrs {
  totalThisYear: number;
  totalDonors: number;
  partners: number;
  residents: number;
  safehouses: number;
  healthCheckIns: number;
  educationEnrollments: number;
}

export default function DonorImpact() {
  const [totalThisYear, setTotalThisYear] = useState<number | null>(null);
  const [totalDonors, setTotalDonors] = useState<number | null>(null);
  const [partners, setPartners] = useState<number | null>(null);
  const [residentCount, setResidentCount] = useState<number | null>(null);
  const [safehouseCount, setSafehouseCount] = useState<number | null>(null);
  const [healthCheckIns, setHealthCheckIns] = useState<number | null>(null);
  const [educationEnrollments, setEducationEnrollments] = useState<number | null>(null);

  useEffect(() => {
    apiClient.get<PublicOkrs>('/PublicImpact/okrs')
      .then((res) => {
        setTotalThisYear(res.data.totalThisYear ?? 0);
        setTotalDonors(res.data.totalDonors ?? 0);
        setPartners(res.data.partners ?? 0);
        setResidentCount(res.data.residents ?? 0);
        setSafehouseCount(res.data.safehouses ?? 0);
        setHealthCheckIns(res.data.healthCheckIns ?? 0);
        setEducationEnrollments(res.data.educationEnrollments ?? 0);
      })
      .catch(() => {
        setTotalThisYear(0);
        setTotalDonors(0);
        setPartners(0);
        setResidentCount(0);
        setSafehouseCount(0);
        setHealthCheckIns(0);
        setEducationEnrollments(0);
      });
  }, []);

  const fmt = (val: number | null) => val === null ? '...' : val.toLocaleString();

  function StatCard({ label, value }: { label: string; value: string }) {
    return (
      <div style={{
        background: 'var(--white)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
        padding: '1.75rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: '1 1 150px',
        minWidth: '150px',
      }}>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 0.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          {label}
        </p>
        <p style={{ fontSize: '2.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
          {value}
        </p>
      </div>
    );
  }

  const sections = [
    {
      number: 1,
      heading: 'You donate',
      description:
        'Every contribution goes directly to supporting survivors of trafficking and abuse — providing safe shelter, healing programs, and hope for the future.',
      topCards: [
        {
          label: 'Donated This Year',
          value: totalThisYear === null
            ? '...'
            : `$${totalThisYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
      ],
      bottomCards: [
        { label: 'Total Donors', value: fmt(totalDonors) },
        { label: 'Partner Organizations', value: fmt(partners) },
      ],
    },
    {
      number: 2,
      heading: 'For those who need it most',
      description:
        'Your support reaches vulnerable women and children who have experienced exploitation and abuse — giving them a safe place and a second chance.',
      topCards: [
        { label: 'Residents in Our Care', value: fmt(residentCount) },
      ],
    },
    {
      number: 3,
      heading: 'We take care of the rest',
      description:
        'Our team provides comprehensive care — safe shelter, regular health check-ins, and education programs that equip survivors for long-term independence.',
      topCards: [
        { label: 'Safehouses', value: fmt(safehouseCount) },
      ],
      bottomCards: [
        { label: 'Health Check-ins', value: fmt(healthCheckIns) },
        { label: 'Education Enrollments', value: fmt(educationEnrollments) },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <div className="donor-impact-container">
          {sections.map((section, idx) => (
            <div
              key={section.number}
              className="donor-impact-row"
              style={{ paddingBottom: idx < sections.length - 1 ? '5rem' : 0 }}
            >
              {/* Timeline: number circle + connecting line */}
              <div className="donor-impact-timeline">
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}>
                  {section.number}
                </div>
                {idx < sections.length - 1 && (
                  <div className="donor-impact-timeline-line" />
                )}
              </div>

              {/* Left: heading + description */}
              <div className="donor-impact-content" style={{ paddingTop: '0.4rem' }}>
                <h2 style={{ color: 'var(--text)', marginBottom: '1rem' }}>
                  {section.heading}
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  {section.description}
                </p>
              </div>

              {/* Right: stat cards */}
              <div className="donor-impact-stats">
                {(section.number === 1 || section.number === 3) && section.bottomCards && section.bottomCards.length > 0 ? (
                  <>
                    <div className="donor-impact-stats-row">
                      {section.topCards.map(card => (
                        <StatCard key={card.label} label={card.label} value={card.value} />
                      ))}
                    </div>
                    <div className="donor-impact-stats-row">
                      {section.bottomCards.map(card => (
                        <StatCard key={card.label} label={card.label} value={card.value} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="donor-impact-stats-row">
                    {section.topCards.map(card => (
                      <StatCard key={card.label} label={card.label} value={card.value} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
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
