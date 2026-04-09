import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/styles.css";
import "../../styles/AdminDashboard.css";
import apiClient from "../../api/apiClient";
import { ENABLE_ML_PREDICTIONS } from "../../config/features";
import { OKR_DEFINITIONS } from "../../config/okrTargets";
import type {
  DonorRetentionPrediction,
  IncidentRiskPrediction,
  ResidentProgressPrediction,
  SocialDonationPrediction,
} from "../../types/predictions";

interface SafehouseMonthlyMetric {
  metricId: number;
  safehouseId: number;
  monthStart: string;
  monthEnd: string;
  activeResidents: number;
  avgEducationProgress: number | null;
  avgHealthScore: number | null;
  processRecordingCount: number;
  homeVisitationCount: number;
  incidentCount: number;
  notes: string;
}

interface SafehouseMonthSummary {
  safehouseId: number;
  safehouseName: string;
  monthStart: string;
  monthEnd: string;
  metricId: number | null;
  activeResidents: number;
  avgEducationProgress: number | null;
  avgHealthScore: number | null;
}

const PREDICTION_TAKE = 50000;
const TOP_SOCIAL_POST_COUNT = 25;

export default function Reports() {
  const [monthSummary, setMonthSummary] = useState<SafehouseMonthSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [yearMonthReady, setYearMonthReady] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [progressPredictions, setProgressPredictions] = useState<
    ResidentProgressPrediction[]
  >([]);
  const [incidentPredictions, setIncidentPredictions] = useState<
    IncidentRiskPrediction[]
  >([]);
  const [socialPredictions, setSocialPredictions] = useState<
    SocialDonationPrediction[]
  >([]);
  const [donorPredictions, setDonorPredictions] = useState<
    DonorRetentionPrediction[]
  >([]);

  const [showModal, setShowModal] = useState(false);
  const [editMetric, setEditMetric] = useState<SafehouseMonthlyMetric | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<SafehouseMonthlyMetric>>({});
  const [saving, setSaving] = useState(false);
  const [draftPlatform, setDraftPlatform] = useState("Facebook");
  const [draftPostType, setDraftPostType] = useState("FundraisingAppeal");
  const [draftHasCta, setDraftHasCta] = useState(true);
  const [draftUrgency, setDraftUrgency] = useState(false);
  const [draftImpactStory, setDraftImpactStory] = useState(true);
  const [draftWordCount, setDraftWordCount] = useState(120);

  const loadMonthSummary = useCallback(() => {
    setSummaryLoading(true);
    apiClient
      .get<SafehouseMonthSummary[]>("/SafehouseMonthlyMetrics/month-summary", {
        params: { year: selectedYear, month: selectedMonth },
      })
      .then((res) => {
        setMonthSummary(res.data);
        setSummaryError(null);
      })
      .catch(() => setSummaryError("Failed to load safehouse metrics for this month."))
      .finally(() => setSummaryLoading(false));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    apiClient
      .get<SafehouseMonthlyMetric[]>("/SafehouseMonthlyMetrics", {
        params: { skip: 0, take: 1 },
      })
      .then((r) => {
        if (r.data[0]?.monthStart) {
          const d = new Date(r.data[0].monthStart);
          setSelectedYear(d.getFullYear());
          setSelectedMonth(d.getMonth() + 1);
        }
      })
      .catch(() => {})
      .finally(() => setYearMonthReady(true));
  }, []);

  useEffect(() => {
    if (!yearMonthReady) return;
    loadMonthSummary();
  }, [yearMonthReady, loadMonthSummary]);

  useEffect(() => {
    if (!ENABLE_ML_PREDICTIONS) return;
    apiClient
      .get<ResidentProgressPrediction[]>("/ResidentProgressPredictions", {
        params: { take: PREDICTION_TAKE, latestOnly: true },
      })
      .then((res) => setProgressPredictions(res.data))
      .catch(() => setProgressPredictions([]));
    apiClient
      .get<IncidentRiskPrediction[]>("/IncidentRiskPredictions", {
        params: { take: PREDICTION_TAKE, latestOnly: true },
      })
      .then((res) => setIncidentPredictions(res.data))
      .catch(() => setIncidentPredictions([]));
    apiClient
      .get<SocialDonationPrediction[]>("/SocialDonationPredictions", {
        params: {
          take: TOP_SOCIAL_POST_COUNT,
          latestOnly: true,
          sort: "value_desc",
        },
      })
      .then((res) => setSocialPredictions(res.data))
      .catch(() => setSocialPredictions([]));
    apiClient
      .get<DonorRetentionPrediction[]>("/DonorRetentionPredictions", {
        params: { take: PREDICTION_TAKE, latestOnly: true },
      })
      .then((res) => setDonorPredictions(res.data))
      .catch(() => setDonorPredictions([]));
  }, []);

  const fmtUsd = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmtPhp = (value: number) =>
    `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const openModal = (metric: SafehouseMonthlyMetric | null) => {
    setEditMetric(metric);
    setFormData(metric ? { ...metric } : {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMetric(null);
    setFormData({});
  };

  const openEditByMetricId = async (metricId: number) => {
    try {
      const res = await apiClient.get<SafehouseMonthlyMetric>(
        `/SafehouseMonthlyMetrics/${metricId}`,
      );
      openModal(res.data);
    } catch {
      alert("Failed to load metric.");
    }
  };

  const openCreateForSafehouse = (safehouseId: number) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const monthStart = `${selectedYear}-${pad(selectedMonth)}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthEnd = `${selectedYear}-${pad(selectedMonth)}-${pad(lastDay)}`;
    setEditMetric(null);
    setFormData({
      safehouseId,
      monthStart,
      monthEnd,
      activeResidents: 0,
      processRecordingCount: 0,
      homeVisitationCount: 0,
      incidentCount: 0,
      notes: "",
    });
    setShowModal(true);
  };

  const saveMetric = async () => {
    setSaving(true);
    try {
      if (editMetric?.metricId) {
        await apiClient.put(
          `/SafehouseMonthlyMetrics/${editMetric.metricId}`,
          formData,
        );
      } else {
        await apiClient.post("/SafehouseMonthlyMetrics", formData);
      }
      loadMonthSummary();
      closeModal();
    } catch {
      alert("Failed to save metric.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMetric = async (id: number) => {
    if (window.confirm("Delete this metric?")) {
      try {
        await apiClient.delete(`/SafehouseMonthlyMetrics/${id}`);
        loadMonthSummary();
      } catch {
        alert("Failed to delete metric.");
      }
    }
  };

  const highProgressRisk = progressPredictions.filter(
    (p) => p.lowProgressRiskProbability >= 0.66,
  ).length;
  const highIncidentRisk = incidentPredictions.filter(
    (p) => p.incidentRiskProbability >= 0.66,
  ).length;
  const topSocialAvg = socialPredictions.length
    ? socialPredictions.reduce(
        (sum, p) => sum + p.predictedDonationValuePhp,
        0,
      ) / socialPredictions.length
    : 0;
  const highLapseCount = donorPredictions.filter(
    (p) => p.lapseRiskProbability >= 0.66,
  ).length;
  const okrActuals = {
    highLapseCount,
    highLowProgressCount: highProgressRisk,
    highIncidentCount: highIncidentRisk,
    avgPredictedDonationPhp: topSocialAvg,
  };
  const fmtMetric = (value: number, unit: "count" | "php") =>
    unit === "php" ? fmtPhp(value) : value.toLocaleString();
  const fmtVariance = (value: number, unit: "count" | "php") =>
    unit === "php" ? fmtPhp(value) : value.toLocaleString();

  const okrRows = OKR_DEFINITIONS.map((def) => {
    const actual = okrActuals[def.metricKey];
    const ratio =
      def.direction === "higher"
        ? actual / Math.max(def.target, 1e-9)
        : def.target / Math.max(actual, 1e-9);
    const progress = Math.max(0, Math.min(1.2, ratio));
    const variance =
      def.direction === "higher" ? actual - def.target : def.target - actual;
    const status =
      progress >= 1 ? "On Track" : progress >= 0.85 ? "Watch" : "At Risk";
    return { ...def, actual, progress, variance, status };
  });

  const draftScore = (() => {
    let score = 45;
    if (draftPlatform === "Facebook") score += 6;
    if (draftPlatform === "Instagram") score += 8;
    if (draftPostType === "FundraisingAppeal") score += 12;
    if (draftHasCta) score += 10;
    if (draftUrgency) score += 8;
    if (draftImpactStory) score += 10;
    if (draftWordCount >= 80 && draftWordCount <= 220) score += 8;
    if (draftWordCount < 40 || draftWordCount > 320) score -= 7;
    return Math.max(0, Math.min(100, score));
  })();
  const draftTier =
    draftScore >= 80
      ? "High potential"
      : draftScore >= 60
        ? "Moderate potential"
        : "Needs revision";
  const draftActions = [
    !draftHasCta
      ? "Add a direct donation CTA with a clear next step."
      : "Keep CTA prominent in the first 2 lines.",
    !draftImpactStory
      ? "Include a concise resident impact story to increase emotional resonance."
      : "Keep the impact story concrete with one measurable outcome.",
    draftWordCount < 80 || draftWordCount > 220
      ? "Aim for approximately 80-220 words for best readability and donation intent."
      : "Current length is within a strong range for donation posts.",
  ];
  const draftPredictedDonation = (() => {
    let estimate = 180;
    if (draftPlatform === "Instagram") estimate += 45;
    if (draftPlatform === "Facebook") estimate += 25;
    if (draftPostType === "FundraisingAppeal") estimate += 95;
    if (draftPostType === "Awareness") estimate += 35;
    if (draftHasCta) estimate += 60;
    if (draftUrgency) estimate += 35;
    if (draftImpactStory) estimate += 55;
    const idealWordCount = 150;
    const wordDistance = Math.abs(draftWordCount - idealWordCount);
    const wordEffect = Math.max(-120, 65 - wordDistance * 0.55);
    estimate += wordEffect;
    const scoreAdjustment = (draftScore - 50) * 2.1;
    return Math.max(25, estimate + scoreAdjustment);
  })();

  const monthLabel = new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long" },
  );

  const yearOptions = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - 3 + i);

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Insights and trends to support decision-making</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal(null)}>
          + Add Metric
        </button>
      </div>

      {ENABLE_ML_PREDICTIONS && (
        <div className="admin-card">
          <h3>OKR Tracker (Target vs Actual)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 0 }}>
            Current actuals use the latest scored prediction batch (same logic as the admin dashboard).
          </p>
          <div className="metrics-grid" style={{ marginTop: "1rem" }}>
            {okrRows.map((row) => (
              <div key={row.id} className="metric-card">
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.35rem",
                  }}
                >
                  {row.objective}
                </div>
                <div style={{ fontWeight: 700, marginBottom: "0.75rem", lineHeight: 1.35 }}>
                  {row.keyResult}
                </div>
                <dl
                  style={{
                    margin: 0,
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "0.25rem 0.75rem",
                    fontSize: "0.88rem",
                    alignItems: "baseline",
                  }}
                >
                  <dt style={{ color: "var(--text-muted)" }}>Owner</dt>
                  <dd style={{ margin: 0 }}>{row.owner}</dd>
                  <dt style={{ color: "var(--text-muted)" }}>Period</dt>
                  <dd style={{ margin: 0 }}>{row.period}</dd>
                  <dt style={{ color: "var(--text-muted)" }}>Baseline</dt>
                  <dd style={{ margin: 0 }}>{fmtMetric(row.baseline, row.unit)}</dd>
                  <dt style={{ color: "var(--text-muted)" }}>Target</dt>
                  <dd style={{ margin: 0 }}>{fmtMetric(row.target, row.unit)}</dd>
                </dl>
                <div
                  className="metric-value"
                  style={{ fontSize: "1.85rem", marginTop: "0.75rem" }}
                >
                  {fmtMetric(row.actual, row.unit)}
                </div>
                <div className="metric-label">Actual</div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.88rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Variance: </span>
                  <strong>{fmtVariance(row.variance, row.unit)}</strong>
                </div>
                <div style={{ marginTop: "0.65rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      minWidth: 72,
                      textAlign: "center",
                      borderRadius: 999,
                      padding: "0.2rem 0.55rem",
                      background:
                        row.status === "On Track"
                          ? "#dcfce7"
                          : row.status === "Watch"
                            ? "#fef9c3"
                            : "#fee2e2",
                      color:
                        row.status === "On Track"
                          ? "#166534"
                          : row.status === "Watch"
                            ? "#713f12"
                            : "#7f1d1d",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "0.75rem",
              color: "var(--text-muted)",
              fontSize: "0.8rem",
            }}
          >
            OKR note: targets and baselines are planning numbers; adjust in code config as leadership
            refines goals.
          </div>
        </div>
      )}

      {ENABLE_ML_PREDICTIONS && (
        <div className="admin-card">
          <h3>Post Draft Scorer</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Planning aid for social media campaign drafting.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reports-draft-platform">Platform</label>
              <select
                id="reports-draft-platform"
                value={draftPlatform}
                onChange={(e) => setDraftPlatform(e.target.value)}
              >
                <option>Facebook</option>
                <option>Instagram</option>
                <option>WhatsApp</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reports-draft-post-type">Post Type</label>
              <select
                id="reports-draft-post-type"
                value={draftPostType}
                onChange={(e) => setDraftPostType(e.target.value)}
              >
                <option>FundraisingAppeal</option>
                <option>Awareness</option>
                <option>Update</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="reports-draft-word-count">
                Caption Word Count
              </label>
              <input
                id="reports-draft-word-count"
                type="number"
                value={draftWordCount}
                onChange={(e) => setDraftWordCount(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={draftHasCta}
                onChange={(e) => setDraftHasCta(e.target.checked)}
              />{" "}
              Has donation CTA
            </label>
            <label>
              <input
                type="checkbox"
                checked={draftUrgency}
                onChange={(e) => setDraftUrgency(e.target.checked)}
              />{" "}
              Uses urgency language
            </label>
            <label>
              <input
                type="checkbox"
                checked={draftImpactStory}
                onChange={(e) => setDraftImpactStory(e.target.checked)}
              />{" "}
              Includes impact story
            </label>
          </div>
          <div style={{ marginTop: "0.9rem" }}>
            <strong>Estimated Donation Potential:</strong> {draftTier} (
            {draftScore}/100)
            <div style={{ marginTop: "0.35rem" }}>
              <strong>Estimated Donation Amount:</strong> {fmtUsd(draftPredictedDonation)}
            </div>
            <ul style={{ marginTop: "0.5rem" }}>
              {draftActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3>Safehouse Monthly Metrics</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 0 }}>
          One row per safehouse for the month you select. Education and health averages use stored
          monthly values when present; otherwise they are computed from education and health records
          dated in that month. Active residents use the stored count when a row exists, otherwise an
          estimate from admission and closure dates.
        </p>
        <div
          className="filter-bar"
          style={{ marginTop: "0.75rem", flexWrap: "wrap" }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Year</span>
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Year"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Month</span>
            <select
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Month"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleDateString("en-US", { month: "long" })}
                </option>
              ))}
            </select>
          </label>
          <span className="refresh-chip" style={{ marginLeft: "auto" }}>
            {summaryLoading ? "Loading…" : monthLabel}
          </span>
        </div>

        <table className="admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Safehouse</th>
              <th>Active residents</th>
              <th>Avg education progress (%)</th>
              <th>Avg health score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {summaryError && (
              <tr>
                <td colSpan={5} className="placeholder-row">
                  {summaryError}
                </td>
              </tr>
            )}
            {!summaryError && monthSummary.length === 0 && !summaryLoading && (
              <tr>
                <td colSpan={5} className="placeholder-row">
                  No safehouses found.
                </td>
              </tr>
            )}
            {monthSummary.map((row) => (
              <tr key={row.safehouseId}>
                <td>
                  <strong>{row.safehouseName}</strong>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    ID {row.safehouseId}
                  </div>
                </td>
                <td>{row.activeResidents}</td>
                <td>
                  {row.avgEducationProgress != null
                    ? Number(row.avgEducationProgress).toFixed(1)
                    : "—"}
                </td>
                <td>
                  {row.avgHealthScore != null
                    ? Number(row.avgHealthScore).toFixed(2)
                    : "—"}
                </td>
                <td style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {row.metricId != null ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={() => openEditByMetricId(row.metricId!)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteMetric(row.metricId!)}
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => openCreateForSafehouse(row.safehouseId)}
                    >
                      Add record
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMetric ? "Edit Metric" : "Add Metric"}</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div>
              <div className="form-group">
                <label htmlFor="reports-safehouse-id">Safehouse ID</label>
                <input
                  id="reports-safehouse-id"
                  type="number"
                  value={formData.safehouseId ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      safehouseId: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-month-start">Month Start</label>
                <input
                  id="reports-month-start"
                  type="date"
                  value={formData.monthStart?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, monthStart: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-month-end">Month End</label>
                <input
                  id="reports-month-end"
                  type="date"
                  value={formData.monthEnd?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, monthEnd: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-active-residents">
                  Active Residents
                </label>
                <input
                  id="reports-active-residents"
                  type="number"
                  value={formData.activeResidents ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activeResidents: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-avg-education-progress">
                  Avg Education Progress
                </label>
                <input
                  id="reports-avg-education-progress"
                  type="number"
                  step="0.01"
                  value={formData.avgEducationProgress ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avgEducationProgress: parseFloat(e.target.value) || null,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-avg-health-score">
                  Avg Health Score
                </label>
                <input
                  id="reports-avg-health-score"
                  type="number"
                  step="0.01"
                  value={formData.avgHealthScore ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avgHealthScore: parseFloat(e.target.value) || null,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-process-recording-count">
                  Process Recording Count
                </label>
                <input
                  id="reports-process-recording-count"
                  type="number"
                  value={formData.processRecordingCount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      processRecordingCount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-home-visitation-count">
                  Home Visitation Count
                </label>
                <input
                  id="reports-home-visitation-count"
                  type="number"
                  value={formData.homeVisitationCount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homeVisitationCount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-incident-count">Incident Count</label>
                <input
                  id="reports-incident-count"
                  type="number"
                  value={formData.incidentCount ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      incidentCount: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="reports-notes">Notes</label>
                <textarea
                  id="reports-notes"
                  value={formData.notes ?? ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveMetric}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
