import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/styles.css";
import apiClient from "../../api/apiClient";
import LastRefreshChip from "../../components/LastRefreshChip";
import { ENABLE_ML_PREDICTIONS } from "../../config/features";
import { OKR_DEFINITIONS } from "../../config/okrTargets";
import { usePredictionMeta } from "../../hooks/usePredictionMeta";
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

export default function Reports() {
  const DEFAULT_PAGE_SIZE = 5;
  const TOP_SOCIAL_POST_COUNT = 25;
  const parsePageSize = (value: string, total: number) =>
    value === "all" ? Math.max(total, 1) : Number(value);
  const [metrics, setMetrics] = useState<SafehouseMonthlyMetric[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [jumpPage, setJumpPage] = useState("1");
  const [metricSortDir, setMetricSortDir] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
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
  const progressMeta = usePredictionMeta(
    "/ResidentProgressPredictions/meta/latest",
    ENABLE_ML_PREDICTIONS,
  );
  const incidentMeta = usePredictionMeta(
    "/IncidentRiskPredictions/meta/latest",
    ENABLE_ML_PREDICTIONS,
  );
  const socialMeta = usePredictionMeta(
    "/SocialDonationPredictions/meta/latest",
    ENABLE_ML_PREDICTIONS,
  );

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
  const [refreshingSocial, setRefreshingSocial] = useState(false);

  const fetchMetrics = (pageVal: number, size: number) => {
    setLoading(true);
    apiClient
      .get<SafehouseMonthlyMetric[]>("/SafehouseMonthlyMetrics", {
        params: { skip: (pageVal - 1) * size, take: size },
      })
      .then((res) => {
        setHasMore(res.data.length === size);
        setMetrics(res.data);
        setError(null);
      })
      .catch(() => setError("Failed to load metrics."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics(1, pageSize);
    apiClient
      .get<SafehouseMonthlyMetric[]>("/SafehouseMonthlyMetrics", {
        params: { skip: 0, take: 100000 },
      })
      .then((r) => setTotalCount(r.data.length))
      .catch(() => {});
    if (ENABLE_ML_PREDICTIONS) {
      apiClient
        .get<ResidentProgressPrediction[]>("/ResidentProgressPredictions", {
          params: { take: 1000, latestOnly: true },
        })
        .then((res) => setProgressPredictions(res.data))
        .catch(() => setProgressPredictions([]));
      apiClient
        .get<IncidentRiskPrediction[]>("/IncidentRiskPredictions", {
          params: { take: 1000, latestOnly: true },
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
          params: { take: 1000, latestOnly: true },
        })
        .then((res) => setDonorPredictions(res.data))
        .catch(() => setDonorPredictions([]));
    }
  }, []);

  const fmtUsd = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const conversionCellStyle = (prob?: number | null) => {
    if (prob == null) return undefined;
    const pct = prob * 100;
    const clamped = Math.max(0, Math.min(100, pct));
    const bucketStart =
      clamped < 50 ? 0 : clamped < 70 ? 50 : clamped < 81 ? 70 : 81;
    const bucketEnd =
      clamped < 50 ? 50 : clamped < 70 ? 70 : clamped < 81 ? 81 : 100;
    const t = (clamped - bucketStart) / Math.max(1, bucketEnd - bucketStart);
    const hueStart =
      clamped < 50 ? 0 : clamped < 70 ? 42 : clamped < 81 ? 92 : 118;
    const hueEnd =
      clamped < 50 ? 12 : clamped < 70 ? 60 : clamped < 81 ? 108 : 125;
    const hue = Math.round(hueStart + (hueEnd - hueStart) * t);
    const light = Math.round(94 - 18 * t);
    return {
      backgroundColor: `hsl(${hue} 85% ${light}%)`,
      color: `hsl(${hue} 70% 20%)`,
      fontWeight: 700 as const,
      borderRadius: "6px",
      padding: "0.2rem 0.45rem",
      display: "inline-block",
    };
  };

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
      fetchMetrics(1, pageSize);
      closeModal();
    } catch (err) {
      alert("Failed to save metric.");
    } finally {
      setSaving(false);
    }
  };

  const deleteMetric = async (id: number) => {
    if (window.confirm("Delete this metric?")) {
      try {
        await apiClient.delete(`/SafehouseMonthlyMetrics/${id}`);
        fetchMetrics(page, pageSize);
      } catch (err) {
        alert("Failed to delete metric.");
      }
    }
  };
  const refreshSocialPredictions = async () => {
    setRefreshingSocial(true);
    try {
      await apiClient.post("/SocialDonationPredictions/refresh-demo");
      const refreshed = await apiClient.get<SocialDonationPrediction[]>(
        "/SocialDonationPredictions",
        {
          params: {
            take: TOP_SOCIAL_POST_COUNT,
            latestOnly: true,
            sort: "value_desc",
          },
        },
      );
      setSocialPredictions(refreshed.data);
    } catch {
      alert("Failed to refresh social prediction scoring batch.");
    } finally {
      setRefreshingSocial(false);
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
    avgPredictedDonationUsd: topSocialAvg,
  };
  const fmtMetric = (value: number, unit: "count" | "usd") =>
    unit === "usd" ? fmtUsd(value) : value.toLocaleString();
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
  const sortedMetrics = [...metrics].sort((a, b) =>
    metricSortDir === "asc"
      ? a.safehouseId - b.safehouseId
      : b.safehouseId - a.safehouseId,
  );
  const pageSizeSelectValue =
    totalCount > 0 && pageSize >= totalCount ? "all" : String(pageSize);

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

      <div className="filter-bar">
        <input
          type="date"
          className="filter-input"
          aria-label="From date"
          placeholder="From date"
        />
        <input
          type="date"
          className="filter-input"
          aria-label="To date"
          placeholder="To date"
        />
        <select className="filter-select" aria-label="Filter by safehouse">
          <option>All Safehouses</option>
        </select>
      </div>

      <div className="admin-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Safehouse Monthly Metrics</h3>
          <small className="refresh-chip">
            Showing {sortedMetrics.length} of {totalCount} records
          </small>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th
                className="clickable-th"
                onClick={() =>
                  setMetricSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                Safehouse ID {metricSortDir === "asc" ? "▲" : "▼"}
              </th>
              <th>Active Residents</th>
              <th>Avg Education Progress</th>
              <th>Avg Health Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="placeholder-row">
                  {error}
                </td>
              </tr>
            )}
            {metrics.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="placeholder-row">
                  No metrics recorded yet.
                </td>
              </tr>
            )}
            {sortedMetrics.map((m) => (
              <tr key={m.metricId}>
                <td>
                  {new Date(m.monthStart).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </td>
                <td>{m.safehouseId}</td>
                <td>{m.activeResidents}</td>
                <td>
                  {m.avgEducationProgress != null
                    ? m.avgEducationProgress
                    : "—"}
                </td>
                <td>{m.avgHealthScore != null ? m.avgHealthScore : "—"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => openModal(m)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteMetric(m.metricId!)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination-row">
          <button
            className="btn btn-secondary btn-sm"
            disabled={page === 1 || loading}
            onClick={() => {
              const p = page - 1;
              setPage(p);
              fetchMetrics(p, pageSize);
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
          </span>
          <input
            className="pagination-jump-input"
            type="number"
            aria-label="Jump to page"
            min={1}
            max={Math.max(1, Math.ceil(totalCount / pageSize))}
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const max = Math.max(1, Math.ceil(totalCount / pageSize));
              const p = Math.min(max, Math.max(1, Number(jumpPage) || 1));
              setPage(p);
              fetchMetrics(p, pageSize);
            }}
          >
            Go
          </button>
          <select
            className="filter-select"
            style={{ marginLeft: "auto" }}
            aria-label="Items per page"
            value={pageSizeSelectValue}
            onChange={(e) => {
              const size = parsePageSize(e.target.value, totalCount);
              setPageSize(size);
              setPage(1);
              fetchMetrics(1, size);
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
            <option value="all">All records</option>
          </select>
          <button
            className="btn btn-secondary btn-sm"
            disabled={!hasMore || loading}
            onClick={() => {
              const p = page + 1;
              setPage(p);
              fetchMetrics(p, pageSize);
            }}
          >
            Next
          </button>
        </div>
      </div>

      {ENABLE_ML_PREDICTIONS && (
        <>
          <div className="admin-card">
            <h3>OKR Tracker (Target vs Actual)</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Objective</th>
                  <th>Key Result</th>
                  <th>Owner</th>
                  <th>Period</th>
                  <th>Baseline</th>
                  <th>Target</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {okrRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.objective}</td>
                    <td>{row.keyResult}</td>
                    <td>{row.owner}</td>
                    <td>{row.period}</td>
                    <td>{fmtMetric(row.baseline, row.unit)}</td>
                    <td>{fmtMetric(row.target, row.unit)}</td>
                    <td>{fmtMetric(row.actual, row.unit)}</td>
                    <td>
                      {row.unit === "usd"
                        ? fmtUsd(row.variance)
                        : row.variance.toLocaleString()}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          minWidth: 72,
                          textAlign: "center",
                          borderRadius: 999,
                          padding: "0.15rem 0.45rem",
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
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "0.75rem",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
              }}
            >
              OKR note: values are tied to current scored batches;
              targets/baselines are configurable for leadership planning.
            </div>
          </div>

          <div className="admin-card">
            <h3>Executive Prediction Snapshot</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Signal</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Residents in High &quot;Low Progress&quot; risk band</td>
                  <td>{highProgressRisk}</td>
                </tr>
                <tr>
                  <td>Residents in High incident risk band</td>
                  <td>{highIncidentRisk}</td>
                </tr>
                <tr>
                  <td>
                    Avg predicted donation value across top social posts (n=
                    {socialPredictions.length}, USD)
                  </td>
                  <td>{fmtUsd(topSocialAvg)}</td>
                </tr>
              </tbody>
            </table>
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.84rem",
                color: "var(--text-muted)",
              }}
            >
              <div>
                <strong>So what:</strong> High-risk resident counts indicate
                likely near-term intervention load for case teams.
              </div>
              <div>
                <strong>Opportunity:</strong> Social content in the top
                predicted band suggests near-term fundraising upside.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.35rem",
                marginTop: "0.75rem",
                flexDirection: "column",
              }}
            >
              <LastRefreshChip meta={progressMeta} label="Progress" />
              <LastRefreshChip meta={incidentMeta} label="Incident" />
              <LastRefreshChip meta={socialMeta} label="Social donation" />
            </div>
          </div>

          <div className="admin-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Top Predicted Social Donation Posts</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={refreshSocialPredictions}
                disabled={refreshingSocial}
              >
                {refreshingSocial
                  ? "Refreshing scoring..."
                  : "Run Social Scoring (No Redeploy)"}
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Post ID</th>
                  <th>Predicted Donation Value (USD)</th>
                  <th>High Conversion Probability</th>
                </tr>
              </thead>
              <tbody>
                {socialPredictions.slice(0, 10).map((post) => (
                  <tr key={post.predictionId}>
                    <td>{post.postId}</td>
                    <td>{fmtUsd(post.predictedDonationValuePhp)}</td>
                    <td>
                      {post.pHighConversion != null ? (
                        <span
                          style={conversionCellStyle(post.pHighConversion)}
                        >{`${(post.pHighConversion * 100).toFixed(1)}%`}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
                {socialPredictions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="placeholder-row">
                      No scored social predictions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "0.75rem",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
              }}
            >
              Conversion color legend: &lt;50% red, 50-69% yellow, 70-80% light
              green, 81%+ green. Shade varies within each band.
            </div>
          </div>
        </>
      )}

      {ENABLE_ML_PREDICTIONS && (
        <div className="admin-card">
          <h3>Post Draft Scorer (Planning Heuristic)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Frontend planning aid for campaign drafting. This is not direct
            model inference.
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
            <ul style={{ marginTop: "0.5rem" }}>
              {draftActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Metric Modal */}
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
                      safehouseId: parseInt(e.target.value) || 0,
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
                      activeResidents: parseInt(e.target.value) || 0,
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
                      processRecordingCount: parseInt(e.target.value) || 0,
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
                      homeVisitationCount: parseInt(e.target.value) || 0,
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
                      incidentCount: parseInt(e.target.value) || 0,
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
