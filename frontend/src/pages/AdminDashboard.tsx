import { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import '../styles/AdminDashboard.css';
import apiClient from '../api/apiClient';
import LastRefreshChip from '../components/LastRefreshChip';
import { ENABLE_ML_PREDICTIONS } from '../config/features';
import { predictedDonationPhpToDisplayUsd } from '../config/socialDonationDisplay';
import { usePredictionMeta } from '../hooks/usePredictionMeta';
import type {
  DonorRetentionPrediction,
  IncidentRiskPrediction,
  ResidentProgressPrediction,
  SocialDonationPrediction,
} from '../types/predictions';

const PREDICTION_TAKE = 50000;
const SOCIAL_TOP_COUNT = 50;
/** Posts in the top-N-by-predicted-value slice with strong conversion probability (model output). */
const HIGH_CONVERSION_THRESHOLD = 0.5;

interface AdminOverviewMetrics {
  residentCount: number;
  supporterCount: number;
  donationTotal: number;
  safehouseCount: number;
}

export default function AdminDashboard() {
  const [residentCount, setResidentCount] = useState<number | null>(null);
  const [supporterCount, setSupporterCount] = useState<number | null>(null);
  const [donationTotal, setDonationTotal] = useState<number | null>(null);
  const [safehouseCount, setSafehouseCount] = useState<number | null>(null);
  const [highLapseCount, setHighLapseCount] = useState<number | null>(null);
  const [highResidentRiskCount, setHighResidentRiskCount] = useState<number | null>(null);
  const [highIncidentRiskCount, setHighIncidentRiskCount] = useState<number | null>(null);
  const [topSocialAvgUsd, setTopSocialAvgUsd] = useState<number | null>(null);
  const [highConversionInTopSlice, setHighConversionInTopSlice] = useState<number | null>(null);
  const donorMeta = usePredictionMeta('/DonorRetentionPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const residentMeta = usePredictionMeta('/ResidentProgressPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const incidentMeta = usePredictionMeta('/IncidentRiskPredictions/meta/latest', ENABLE_ML_PREDICTIONS);
  const socialMeta = usePredictionMeta('/SocialDonationPredictions/meta/latest', ENABLE_ML_PREDICTIONS);

  useEffect(() => {
    apiClient.get<AdminOverviewMetrics>('/AdminMetrics/overview')
      .then(r => {
        setResidentCount(r.data.residentCount);
        setSupporterCount(r.data.supporterCount);
        setDonationTotal(r.data.donationTotal);
        setSafehouseCount(r.data.safehouseCount);
      })
      .catch(() => {
        setResidentCount(null);
        setSupporterCount(null);
        setDonationTotal(null);
        setSafehouseCount(null);
      });

    if (ENABLE_ML_PREDICTIONS) {
      apiClient.get<DonorRetentionPrediction[]>('/DonorRetentionPredictions', { params: { take: PREDICTION_TAKE, latestOnly: true } })
        .then(r => setHighLapseCount(r.data.filter(x => x.lapseRiskProbability >= 0.66).length))
        .catch(() => setHighLapseCount(null));
      apiClient.get<ResidentProgressPrediction[]>('/ResidentProgressPredictions', { params: { take: PREDICTION_TAKE, latestOnly: true } })
        .then(r => setHighResidentRiskCount(r.data.filter(x => x.lowProgressRiskProbability >= 0.66).length))
        .catch(() => setHighResidentRiskCount(null));
      apiClient.get<IncidentRiskPrediction[]>('/IncidentRiskPredictions', { params: { take: PREDICTION_TAKE, latestOnly: true } })
        .then(r => setHighIncidentRiskCount(r.data.filter(x => x.incidentRiskProbability >= 0.66).length))
        .catch(() => setHighIncidentRiskCount(null));
      apiClient.get<SocialDonationPrediction[]>('/SocialDonationPredictions', { params: { take: SOCIAL_TOP_COUNT, latestOnly: true, sort: 'value_desc' } })
        .then(r => {
          if (!r.data.length) {
            setTopSocialAvgUsd(0);
            setHighConversionInTopSlice(0);
            return;
          }
          const avgPhp =
            r.data.reduce((sum, p) => sum + p.predictedDonationValuePhp, 0) /
            r.data.length;
          setTopSocialAvgUsd(predictedDonationPhpToDisplayUsd(avgPhp));
          const hi = r.data.filter(p => (p.pHighConversion ?? 0) >= HIGH_CONVERSION_THRESHOLD).length;
          setHighConversionInTopSlice(hi);
        })
        .catch(() => {
          setTopSocialAvgUsd(null);
          setHighConversionInTopSlice(null);
        });
    }
  }, []);

  const fmt = (val: number | null) => val === null ? '...' : val.toLocaleString();

  const fmtUsdMoney = (val: number | null) =>
    val === null
      ? '...'
      : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <AdminLayout title="River of Life Admin Dashboard">
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
        {ENABLE_ML_PREDICTIONS && (
          <>
            <div className="metric-card">
              <div className="metric-value">{fmt(highLapseCount)}</div>
              <div className="metric-label">Donors at High Lapse Risk (105-day)</div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Count of supporters in the latest donor-retention batch with lapse risk probability ≥ 0.66 (prioritization queue for stewardship).
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{fmt(highResidentRiskCount)}</div>
              <div className="metric-label">Residents at High &quot;Low Progress&quot; Risk</div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Latest resident-progress scores: count with low-progress risk probability ≥ 0.66 (case management follow-up).
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{fmt(highIncidentRiskCount)}</div>
              <div className="metric-label">Residents at High Incident Risk (60-day)</div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Latest incident-risk model: count with 60-day incident risk probability ≥ 0.66 (safety and staffing focus).
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{fmtUsdMoney(topSocialAvgUsd)}</div>
              <div className="metric-label">Social: mean predicted donation (USD)</div>
              <div style={{ marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                <strong>High conversion (top slice):</strong>{' '}
                {highConversionInTopSlice === null ? '...' : `${highConversionInTopSlice} posts with p(high conversion) ≥ ${HIGH_CONVERSION_THRESHOLD}`}
              </div>
            </div>
          </>
        )}
      </div>

      {ENABLE_ML_PREDICTIONS && (
        <div className="admin-card">
          <h3>Prediction Refresh Status</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              alignItems: 'flex-start',
            }}
          >
            <LastRefreshChip meta={donorMeta} label="Donor retention" />
            <LastRefreshChip meta={residentMeta} label="Resident progress" />
            <LastRefreshChip meta={incidentMeta} label="Incident risk" />
            <LastRefreshChip meta={socialMeta} label="Social donation" />
          </div>
        </div>
      )}

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
