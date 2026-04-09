import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import "../../styles/styles.css";
import "../../styles/AdminDashboard.css";
import apiClient from "../../api/apiClient";
import { ENABLE_ML_PREDICTIONS } from "../../config/features";
import { predictedDonationPhpToDisplayUsd } from "../../config/socialDonationDisplay";
import { OKR_DEFINITIONS } from "../../config/okrTargets";
import type {
  DonorRetentionPrediction,
  IncidentRiskPrediction,
  ResidentProgressPrediction,
  SocialDonationPrediction,
} from "../../types/predictions";

const PREDICTION_TAKE = 50000;
/** Top posts by predicted value — larger set improves draft similarity blend; same slice feeds OKR actual. */
const TOP_SOCIAL_POST_COUNT = 100;

/** Post fields used for similarity to Pipeline 10 pre-publish features (see social_media_engagement.ipynb). */
interface SocialMediaPostForDraft {
  postId: number;
  platform: string;
  postType: string;
  caption: string;
  captionLength: number;
  hasCallToAction: boolean;
  featuresResidentStory: boolean;
}

function approxWordCountFromPost(p: SocialMediaPostForDraft): number {
  const t = (p.caption ?? "").trim();
  if (t.length > 0) {
    return Math.max(1, t.split(/\s+/).filter(Boolean).length);
  }
  return Math.max(1, Math.round(Number(p.captionLength) / 5.2));
}

/**
 * Blend `predictedDonationValuePhp` from the current batch toward posts whose stored attributes
 * are close to the draft. This reuses the ML model's scores (not a standalone formula); it does
 * not re-run the fitted RF — that would require loading the joblib artifact server-side.
 */
function estimateDonationFromSimilarScoredPosts(
  draft: {
    platform: string;
    postType: string;
    wordCount: number;
    hasCta: boolean;
    impactStory: boolean;
  },
  neighbors: { post: SocialMediaPostForDraft; pred: number }[],
  batchMean: number,
): { value: number; source: "similar-posts" | "batch-mean" } {
  if (neighbors.length === 0) {
    return { value: batchMean, source: "batch-mean" };
  }
  let wSum = 0;
  let pSum = 0;
  for (const { post, pred } of neighbors) {
    const wcPost = approxWordCountFromPost(post);
    let distSq = 0;
    distSq +=
      post.platform.trim().toLowerCase() === draft.platform.trim().toLowerCase()
        ? 0
        : 1;
    distSq +=
      post.postType.trim().toLowerCase() === draft.postType.trim().toLowerCase()
        ? 0
        : 0.64;
    const wcDiff = (wcPost - draft.wordCount) / 100;
    distSq += wcDiff * wcDiff;
    distSq += post.hasCallToAction === draft.hasCta ? 0 : 0.12;
    distSq += post.featuresResidentStory === draft.impactStory ? 0 : 0.12;
    const w = Math.exp(-1.25 * distSq);
    wSum += w;
    pSum += w * pred;
  }
  if (wSum < 1e-8) {
    return { value: batchMean, source: "batch-mean" };
  }
  return { value: pSum / wSum, source: "similar-posts" };
}

/**
 * Strong, explicit swings from each draft control (log-scale on money so ~$25k moves by thousands).
 * Aligns with Pipeline 10 feature families (platform, post_type, word_count, CTA, urgency/story language).
 */
function draftContentLogMultiplier(d: {
  platform: string;
  postType: string;
  wordCount: number;
  hasCta: boolean;
  urgency: boolean;
  impactStory: boolean;
}): { logM: number; scorePoints: number } {
  const p = d.platform.trim().toLowerCase();
  let logM = 0;
  if (p === "instagram") logM += 0.1;
  else if (p === "facebook") logM += 0.045;
  else if (p === "whatsapp") logM -= 0.085;

  const t = d.postType.trim().toLowerCase();
  if (t === "fundraisingappeal") logM += 0.13;
  else if (t === "awareness") logM += 0.025;
  else if (t === "update") logM -= 0.095;

  const ideal = 155;
  const sigma = 46;
  const wordBell = Math.exp(
    -((d.wordCount - ideal) ** 2) / (2 * sigma * sigma),
  );
  logM += -0.11 + 0.22 * wordBell;

  logM += d.hasCta ? 0.095 : -0.11;
  logM += d.urgency ? 0.075 : -0.055;
  logM += d.impactStory ? 0.085 : -0.095;

  const scorePoints =
    (p === "instagram" ? 14 : p === "facebook" ? 7 : -12) +
    (t === "fundraisingappeal" ? 18 : t === "awareness" ? 5 : -12) +
    Math.round(18 * wordBell - 8) +
    (d.hasCta ? 14 : -12) +
    (d.urgency ? 11 : -8) +
    (d.impactStory ? 13 : -11);

  return { logM, scorePoints };
}

export default function Reports() {
  const [progressPredictions, setProgressPredictions] = useState<
    ResidentProgressPrediction[]
  >([]);
  const [incidentPredictions, setIncidentPredictions] = useState<
    IncidentRiskPrediction[]
  >([]);
  const [socialPredictions, setSocialPredictions] = useState<
    SocialDonationPrediction[]
  >([]);
  const [socialPostsForKnn, setSocialPostsForKnn] = useState<
    SocialMediaPostForDraft[]
  >([]);
  const [donorPredictions, setDonorPredictions] = useState<
    DonorRetentionPrediction[]
  >([]);

  const [draftPlatform, setDraftPlatform] = useState("Facebook");
  const [draftPostType, setDraftPostType] = useState("FundraisingAppeal");
  const [draftHasCta, setDraftHasCta] = useState(true);
  const [draftUrgency, setDraftUrgency] = useState(false);
  const [draftImpactStory, setDraftImpactStory] = useState(true);
  const [draftWordCount, setDraftWordCount] = useState(120);

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
    apiClient
      .get<SocialMediaPostForDraft[]>("/SocialMediaPosts", {
        params: { skip: 0, take: 8000 },
      })
      .then((res) => setSocialPostsForKnn(res.data))
      .catch(() => setSocialPostsForKnn([]));
  }, []);

  const fmtUsd = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const highProgressRisk = progressPredictions.filter(
    (p) => p.lowProgressRiskProbability >= 0.66,
  ).length;
  const highIncidentRisk = incidentPredictions.filter(
    (p) => p.incidentRiskProbability >= 0.66,
  ).length;
  const topSocialAvgUsd = socialPredictions.length
    ? predictedDonationPhpToDisplayUsd(
        socialPredictions.reduce(
          (sum, p) => sum + p.predictedDonationValuePhp,
          0,
        ) / socialPredictions.length,
      )
    : 0;
  const highLapseCount = donorPredictions.filter(
    (p) => p.lapseRiskProbability >= 0.66,
  ).length;
  const okrActuals = {
    highLapseCount,
    highLowProgressCount: highProgressRisk,
    highIncidentCount: highIncidentRisk,
    avgPredictedDonationUsd: topSocialAvgUsd,
  };
  const fmtMetric = (value: number, unit: "count" | "usd") =>
    unit === "usd" ? fmtUsd(value) : value.toLocaleString();
  const fmtVariance = (value: number, unit: "count" | "usd") =>
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

  const draftPotential = useMemo(() => {
    const { scorePoints } = draftContentLogMultiplier({
      platform: draftPlatform,
      postType: draftPostType,
      wordCount: draftWordCount,
      hasCta: draftHasCta,
      urgency: draftUrgency,
      impactStory: draftImpactStory,
    });
    const score = Math.max(0, Math.min(100, 50 + scorePoints));
    const tier =
      score >= 78
        ? "High potential"
        : score >= 52
          ? "Moderate potential"
          : "Needs revision";
    return { score, tier };
  }, [
    draftHasCta,
    draftImpactStory,
    draftPlatform,
    draftPostType,
    draftUrgency,
    draftWordCount,
  ]);

  const draftActions = [
    !draftHasCta
      ? "Add a direct donation CTA with a clear next step."
      : "Keep CTA prominent in the first 2 lines.",
    !draftUrgency
      ? "Consider measured urgency language where appropriate for time-bound campaigns."
      : "Keep urgency truthful and tied to real deadlines or needs.",
    !draftImpactStory
      ? "Include a concise resident impact story to increase emotional resonance."
      : "Keep the impact story concrete with one measurable outcome.",
    draftWordCount < 80 || draftWordCount > 220
      ? "Aim for approximately 80-220 words for best readability and donation intent."
      : "Current length is within a strong range for donation posts.",
  ];

  const postById = useMemo(() => {
    const m = new Map<number, SocialMediaPostForDraft>();
    for (const p of socialPostsForKnn) {
      m.set(p.postId, p);
    }
    return m;
  }, [socialPostsForKnn]);

  const socialBatchMean = useMemo(() => {
    if (!socialPredictions.length) return 0;
    return (
      socialPredictions.reduce((s, x) => s + x.predictedDonationValuePhp, 0) /
      socialPredictions.length
    );
  }, [socialPredictions]);

  const draftDonationFromPipeline = useMemo(() => {
    if (!socialPredictions.length) {
      return { value: null as number | null, source: "none" as const };
    }
    const neighbors = socialPredictions
      .map((pr) => {
        const post = postById.get(pr.postId);
        if (!post) return null;
        return { post, pred: pr.predictedDonationValuePhp };
      })
      .filter(
        (x): x is { post: SocialMediaPostForDraft; pred: number } => x != null,
      );
    const { value: knnValue, source } = estimateDonationFromSimilarScoredPosts(
      {
        platform: draftPlatform,
        postType: draftPostType,
        wordCount: draftWordCount,
        hasCta: draftHasCta,
        impactStory: draftImpactStory,
      },
      neighbors,
      socialBatchMean,
    );
    const { logM } = draftContentLogMultiplier({
      platform: draftPlatform,
      postType: draftPostType,
      wordCount: draftWordCount,
      hasCta: draftHasCta,
      urgency: draftUrgency,
      impactStory: draftImpactStory,
    });
    const valuePhp = knnValue * Math.exp(logM);
    const value = predictedDonationPhpToDisplayUsd(valuePhp);
    return { value, source };
  }, [
    draftHasCta,
    draftImpactStory,
    draftPlatform,
    draftPostType,
    draftUrgency,
    draftWordCount,
    postById,
    socialBatchMean,
    socialPredictions,
  ]);

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Insights and trends to support decision-making</p>
        </div>
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
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    className="metric-label"
                    style={{ margin: 0, fontWeight: 700 }}
                  >
                    Actual:
                  </span>
                  <span
                    className="metric-value"
                    style={{ fontSize: "1.85rem", margin: 0, lineHeight: 1.15 }}
                  >
                    {fmtMetric(row.actual, row.unit)}
                  </span>
                </div>
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
              marginTop: "1rem",
              padding: "0.85rem 1rem",
              background: "var(--white)",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: 8,
              fontSize: "0.84rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--text)" }}>Variance (how to read it):</strong>{" "}
            For count objectives where <em>lower</em> is better, variance = <strong>target − actual</strong>{" "}
            (positive means the queue is smaller than the target, i.e. ahead of goal). For the donation
            objective where <em>higher</em> is better, variance = <strong>actual − target</strong>{" "}
            (positive means actuals above target). Status uses a simple progress ratio vs target.
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
            Planning Aid for Social Media Drafting. The pipeline stores scores, we blend batch predictions, apply
            draft controls.
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
            <strong>Estimated Donation Potential:</strong> {draftPotential.tier} (
            {draftPotential.score}/100)
            <div style={{ marginTop: "0.35rem" }}>
              <strong>Estimated Donation Amount (US dollars):</strong>{" "}
              {draftDonationFromPipeline.value != null
                ? fmtUsd(draftDonationFromPipeline.value)
                : "—"}
            </div>
            {draftDonationFromPipeline.source === "none" && (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginTop: "0.45rem",
                  lineHeight: 1.45,
                }}
              >
                No social donation predictions loaded — enable ML predictions or refresh the batch to see an
                estimate.
              </p>
            )}
            <ul style={{ marginTop: "0.5rem" }}>
              {draftActions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
