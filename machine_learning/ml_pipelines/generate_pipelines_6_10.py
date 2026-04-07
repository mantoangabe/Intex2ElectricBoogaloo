#!/usr/bin/env python3
"""Generate pipelines 6–10 (full structure). Run after generate_pipelines_3_10.py or standalone."""
from __future__ import annotations

from pathlib import Path

from nb_utils import (
    COMMON_ROOT,
    cell_code,
    cell_md,
    executive_summary,
    save_nb,
    section_business_interpretation,
    section_causal,
    section_data_acq_prep,
    section_deployment_full,
    section_eda,
    section_evaluation,
    section_key_findings,
    section_leakage,
    section_modeling_intro,
    section_problem_framing,
    section_recommended_actions,
)

NB_DIR = Path(__file__).resolve().parent

TIER_SECONDARY = (
    "**Secondary / exploratory pipeline:** Outputs are best for **learning and discussion**, not pay-for-performance rankings, "
    "until case-mix adjustment and more history are available."
)


def build_6() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                6,
                "Safehouse Performance",
                "We combine a **transparent composite score** from monthly KPIs with a **forecast model** for next-month **incident count** to support operational learning across sites.",
                [
                    "Z-score composite (education, health, services) minus incident penalty",
                    "Baseline + Ridge + RF for **next-month incidents** (grouped by safehouse)",
                    "PostgreSQL table for program director dashboard",
                ],
                TIER_SECONDARY + " **Caseload severity differs by site**—interpret ranks cautiously.",
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Leadership lacks a **repeatable** way to compare month-to-month operational signals across safehouses without relying on anecdotes alone.",
                stakeholders_md="| **Program director** | Supervision & support |\n| **Site leads** | Peer learning |\n| **Board** | High-level trends (aggregated) |",
                why_matters="Identifying **outlier months** early can trigger support (staffing, training) before crises compound.",
                predictive_goal="**Regression:** forecast **next month `incident_count`** from lagged KPIs (RF primary for scoring).",
                explanatory_goal="**Ridge coefficients** on lagged features show which **lagged** metrics align with more/fewer incidents (associational).",
                why_different="Composite score is **descriptive** for dashboards; RF focuses on **predictive accuracy** for early warning.",
                decision="**Which sites get a program-office deep-dive this month** (never automatic punishment).",
                limitation="No resident-level risk adjustment in composite; small N of sites.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="**Composite:** row-level z-mix of education/health/services minus incident z. **Supervised target:** `incident_count` at month *t*.",
                at_prediction_time="**Lagged** features `L1_*` built from month *t-1* metrics only (after `dropna(subset=lag_features)`).",
                no_future_data="We do not use same-month outcomes as predictors for that month’s label in the forecasting block.",
                split_validity="**GroupKFold by `safehouse_id`** so the same house does not leak across train/test folds.",
                checks_code_note="Verify `df2` row count > 0 after lag; print per-safehouse month coverage.",
            )
        )
    )
    c.append(
        cell_md(
            section_data_acq_prep(
                "**Tables:** `safehouse_monthly_metrics.csv`, `safehouses.csv`.\n\n"
                "Numeric columns coerced; medians impute missing KPIs. **Lag-1** features via `groupby('safehouse_id').shift(1)`."
            )
        )
    )
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''m = pd.read_csv(DATA_DIR / "safehouse_monthly_metrics.csv", parse_dates=["month_start", "month_end"])
sh = pd.read_csv(DATA_DIR / "safehouses.csv")
df = m.merge(sh[["safehouse_id", "name"]], on="safehouse_id", how="left")
num_cols = ["active_residents", "avg_education_progress", "avg_health_score", "process_recording_count", "home_visitation_count", "incident_count"]
for col in num_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")
    df[col] = df[col].fillna(df[col].median())
zparts = []
for col in ["avg_education_progress", "avg_health_score", "process_recording_count", "home_visitation_count"]:
    z = (df[col] - df[col].mean()) / (df[col].std() + 1e-9)
    zparts.append(z)
inc_z = (df["incident_count"] - df["incident_count"].mean()) / (df["incident_count"].std() + 1e-9)
df["composite_z"] = sum(zparts) / len(zparts) - 0.5 * inc_z
df2 = df.sort_values(["safehouse_id", "month_start"])
lag = df2.groupby("safehouse_id")[num_cols].shift(1)
feat = [f"L1_{k}" for k in num_cols]
df2 = df2.assign(**{f"L1_{k}": lag[k] for k in num_cols}).dropna(subset=feat)
X, y, g = df2[feat], df2["incident_count"], df2["safehouse_id"]
print("Forecasting panel rows", len(df2), "safehouses", g.nunique())
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''ranked = df.groupby("safehouse_id")["composite_z"].mean().sort_values(ascending=False)
print("Mean composite z by safehouse (exploratory index)")
print(ranked)
ranked.plot(kind="bar", figsize=(9, 4), title="Average composite z (secondary / exploratory)")
plt.tight_layout()
plt.show()
for sid in sorted(df["safehouse_id"].unique())[:4]:
    sub = df[df["safehouse_id"] == sid].sort_values("month_start")
    plt.plot(sub["month_start"], sub["incident_count"], marker="o", label=f"SH{sid}")
plt.legend()
plt.title("Incident count over time (sample)")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="**All KPIs lagged one month** capture recent operational context without same-month leakage for the incident target.",
                baseline_name="DummyRegressor (mean incidents)",
                interpretable_name="Ridge regression",
                performance_name="Random Forest regressor",
            )
        )
    )
    c.append(
        cell_code(
            '''from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import GroupKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

def pipe(model):
    return Pipeline([("s", StandardScaler()), ("m", model)])

gkf = GroupKFold(4)
for name, model in [("baseline", DummyRegressor(strategy="mean")), ("ridge", Ridge(1.0)), ("rf", RandomForestRegressor(150, max_depth=5, min_samples_leaf=3, random_state=RANDOM_STATE, n_jobs=-1))]:
    sc = cross_validate(pipe(model), X, y, cv=gkf, groups=g, scoring={"mae": "neg_mean_absolute_error", "r2": "r2"}, n_jobs=-1)
    print(name, "MAE", -sc["test_mae"].mean(), "R2", sc["test_r2"].mean())
rf = pipe(RandomForestRegressor(150, max_depth=5, min_samples_leaf=3, random_state=RANDOM_STATE, n_jobs=-1))
rf.fit(X, y)
ridge_explain = pipe(Ridge(1.0))
ridge_explain.fit(X, y)
coef = pd.Series(ridge_explain.named_steps["m"].coef_, index=feat).sort_values()
coef.plot(kind="barh", title="Ridge on lag features → incidents (interpretable)")
plt.tight_layout()
plt.show()
print("Final model for scoring: RF if it beats baseline MAE in CV; Ridge for coefficient stories.")
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="**Composite z** is a weighted narrative index for dashboards; **RF forecast** flags months where incidents may spike vs recent lag pattern.",
                reliability="Incident counts are **sparse**—expect modest R². Use as **triage**, not precision scheduling.",
                do_differently="Pair flags with **qualitative** site context; fund **support visits**, not blame.",
                decision_support="**Program office site visits** and **resource reallocation** conversations.",
                false_positives="Unneeded intensive visit → staff time cost.",
                false_negatives="Miss a brewing crisis → safety risk; keep **non-model** reporting channels mandatory.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Lagged incidents often predict future incidents (persistence).",
                not_causal="Operational changes were not randomized.",
                honest_limits="Nine sites; heterogeneous missions.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Composite is **transparent**; forecasting is **probabilistic** and weak at small N.",
                    "Always read **secondary tier** disclaimer to stakeholders.",
                    "Ridge shows **which lagged signals** align with incidents in linear approximation.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Add **case-mix** variables when available before using ranks in HR contexts.",
                    "Log **site narratives** alongside scores each month.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Monthly** ETL after `safehouse_monthly_metrics` refresh.",
                net_surface="**.NET Program Portal → Safehouse dashboard** tab: table + sparklines; filter `predicted_incidents_next_month > site_p90`.",
                users="| **Program director** | Oversight |\n| **Regional supervisor** | Visits |",
                table_sql="""CREATE TABLE safehouse_performance_scores (
  id BIGSERIAL PRIMARY KEY,
  safehouse_id INTEGER NOT NULL,
  month_start DATE NOT NULL,
  composite_z DOUBLE PRECISION NOT NULL,
  predicted_next_month_incidents DOUBLE PRECISION,
  model_version VARCHAR(40) NOT NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (safehouse_id, month_start, model_version)
);""",
                upsert_sql="""INSERT INTO safehouse_performance_scores (safehouse_id, month_start, composite_z, predicted_next_month_incidents, model_version)
VALUES (3, DATE '2026-03-01', 0.12, 1.4, 'safehouse_v2')
ON CONFLICT (safehouse_id, month_start, model_version)
DO UPDATE SET composite_z = EXCLUDED.composite_z, predicted_next_month_incidents = EXCLUDED.predicted_next_month_incidents, scored_at = NOW();""",
                python_note="Batch computes composite from raw metrics, then `rf.predict` on latest lag row per site.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
dump(rf, OUTPUT_DIR / "safehouse_incident_rf_v2.joblib")
print("Saved RF forecaster")
'''
        )
    )
    save_nb(NB_DIR / "safehouse_performance.ipynb", c)


def build_7() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                7,
                "Incident Risk Prediction",
                "We estimate the **probability of ≥1 incident** in the **next 60 days** per resident using case history and recent education/health signals—**decision support** for supervision, not automation.",
                [
                    "Grouped CV by resident",
                    "Dummy + Logistic + Random Forest",
                    "Deployment schema for case-management UI",
                ],
                None,
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Incidents are often handled **reactively**; staff need a **ranked watchlist** grounded in case records.",
                stakeholders_md="| **House parents / SW** | Daily supervision |\n| **Safety officer** | Huddles |\n| **Leadership** | Aggregate risk governance |",
                why_matters="Earlier attention may **prevent harm** when combined with professional judgment.",
                predictive_goal="**Binary probability** of any incident in next 60 days.",
                explanatory_goal="**Logistic coefficients** describe which **recorded** factors align with higher risk (training use).",
                why_different="RF may increase recall; logistic supports **ethics reviews** and staff training narratives.",
                decision="**Weekly case conference priority list** (internal only, humane framing).",
                limitation="Labels are rare and noisy; model errors have **safety** implications—see Business Interpretation.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="**y=1** if any `incident_reports` row falls in (`as_of`, `as_of+60d`].",
                at_prediction_time="Incidents/education/health in **prior 90d** only; static resident fields.",
                no_future_data="Future incidents excluded from features.",
                split_validity="**GroupShuffleSplit / GroupKFold** on `resident_id`.",
                checks_code_note="Print positive prevalence; verify no feature uses `incident_date > as_of`.",
            )
        )
    )
    c.append(
        cell_md(
            section_data_acq_prep(
                "**Tables:** `residents`, `incident_reports`, `education_records`, `health_wellbeing_records`."
            )
        )
    )
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score, ConfusionMatrixDisplay, RocCurveDisplay
from sklearn.model_selection import GroupKFold, GroupShuffleSplit, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

res = pd.read_csv(DATA_DIR / "residents.csv", parse_dates=["date_of_admission"])
inc = pd.read_csv(DATA_DIR / "incident_reports.csv", parse_dates=["incident_date"])
edu = pd.read_csv(DATA_DIR / "education_records.csv", parse_dates=["record_date"])
hl = pd.read_csv(DATA_DIR / "health_wellbeing_records.csv", parse_dates=["record_date"])
H = 60
rows = []
anchors = pd.date_range("2023-06-01", "2025-10-01", freq="MS")
mx = inc["incident_date"].max()
sev = {"Low": 1, "Medium": 2, "High": 3}
for as_of in anchors:
    if as_of + timedelta(days=H) > mx:
        continue
    for rid in res["resident_id"].unique():
        fut = inc[(inc["resident_id"] == rid) & (inc["incident_date"] > as_of) & (inc["incident_date"] <= as_of + timedelta(days=H))]
        y = int(len(fut) > 0)
        d0 = as_of - timedelta(days=90)
        past = inc[(inc["resident_id"] == rid) & (inc["incident_date"] >= d0) & (inc["incident_date"] <= as_of)]
        n_past = len(past)
        mx_sev = past["severity"].map(sev).max() if n_past and past["severity"].map(sev).notna().any() else 0
        hp = hl[(hl["resident_id"] == rid) & (hl["record_date"] >= d0) & (hl["record_date"] <= as_of)]
        hsc = hp["general_health_score"].mean() if len(hp) else np.nan
        ep = edu[(edu["resident_id"] == rid) & (edu["record_date"] >= d0) & (edu["record_date"] <= as_of)]
        pr = ep["progress_percent"].mean() if len(ep) else np.nan
        r = res[res["resident_id"] == rid].iloc[0]
        rows.append({"resident_id": rid, "as_of": as_of, "y": y, "incidents_90d": n_past, "max_sev_90d": float(mx_sev), "health_mean_90d": hsc, "edu_prog_mean_90d": pr, "safehouse_id": int(r["safehouse_id"]), "risk_lvl": r["current_risk_level"], "status": r["case_status"]})
p = pd.DataFrame(rows)
p["health_mean_90d"] = p["health_mean_90d"].fillna(p["health_mean_90d"].median())
p["edu_prog_mean_90d"] = p["edu_prog_mean_90d"].fillna(p["edu_prog_mean_90d"].median())
adm = res.set_index("resident_id")["date_of_admission"]
p["tenure_days"] = p.apply(lambda r: (r["as_of"] - adm[r["resident_id"]]).days if pd.notna(adm[r["resident_id"]]) else 0, axis=1)
print("n=", len(p), "rate=", p["y"].mean())
NUM = ["incidents_90d", "max_sev_90d", "health_mean_90d", "edu_prog_mean_90d", "tenure_days", "safehouse_id"]
CAT = ["risk_lvl", "status"]
X, y, g = p[NUM + CAT], p["y"], p["resident_id"]
prep = ColumnTransformer([("n", StandardScaler(), NUM), ("c", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT)])

def pc(m):
    return Pipeline([("p", prep), ("c", m)])
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''sns.boxplot(data=p, x="y", y="incidents_90d")
plt.title("Prior 90d incident count vs future 60d incident")
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="Recent **incident load**, **severity**, **health/education** averages, **tenure**, **safehouse**, case **status**.",
                baseline_name="Stratified dummy",
                interpretable_name="Balanced logistic regression",
                performance_name="Random Forest classifier",
            )
        )
    )
    c.append(
        cell_code(
            '''gkf = GroupKFold(5)
for name, m in [("dummy", DummyClassifier(strategy="stratified", random_state=RANDOM_STATE)), ("logit", LogisticRegression(max_iter=3000, class_weight="balanced", random_state=RANDOM_STATE)), ("rf", RandomForestClassifier(250, max_depth=5, class_weight="balanced_subsample", random_state=RANDOM_STATE, n_jobs=-1))]:
    sc = cross_validate(pc(m), X, y, cv=gkf, groups=g, scoring=["roc_auc", "recall", "f1"], n_jobs=-1)
    print(name, "AUC", sc["test_roc_auc"].mean(), "recall", sc["test_recall"].mean())
gss = GroupShuffleSplit(1, test_size=0.25, random_state=RANDOM_STATE)
tr, te = next(gss.split(X, y, g))
logit = pc(LogisticRegression(max_iter=3000, class_weight="balanced", random_state=RANDOM_STATE))
logit.fit(X.iloc[tr], y.iloc[tr])
pr = logit.predict_proba(X.iloc[te])[:, 1]
print("Holdout AUC", roc_auc_score(y.iloc[te], pr))
fig, ax = plt.subplots(1, 2, figsize=(10, 4))
ConfusionMatrixDisplay.from_predictions(y.iloc[te], (pr >= 0.5).astype(int), ax=ax[0])
RocCurveDisplay.from_predictions(y.iloc[te], pr, ax=ax[1])
plt.tight_layout()
plt.show()
coef = pd.Series(logit.named_steps["c"].coef_.ravel(), index=logit.named_steps["p"].get_feature_names_out()).sort_values()
coef.plot(kind="barh", figsize=(7, 6))
plt.title("Logistic: drivers of incident risk (associational)")
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="Scores highlight residents whose **record pattern** resembles past months with incidents—**not** predictions of character.",
                reliability="Moderate-to-low; prioritize **recall** for safety huddles if policy allows extra staff time.",
                do_differently="Use list for **open questions** in supervision (“what changed?”), not labels shown to youth.",
                decision_support="**Case conference ordering** and **night-shift briefings** (internal).",
                false_positives="Unnecessary anxiety or over-scrutiny → **dignity harm**; mitigate with **trauma-informed** framing.",
                false_negatives="Missed emerging crisis → **safety** risk; **mandatory** human reporting still required.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Prior incidents correlate with future incidents (persistence).",
                not_causal="Interventions not randomized.",
                honest_limits="Underfitting rare events.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Compare to **dummy** every release.",
                    "Tune threshold for **recall vs dignity costs**.",
                    "Never disable **human mandatory reporting**.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Legal review of **fairness** and **consent** for internal scores.",
                    "Train staff on **false positive** handling.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Nightly** batch after case notes sync (or weekly if data latency).",
                net_surface="**.NET Case Management → Resident roster** with internal-only `risk_band` column; detail view shows **top 3 drivers** (plain language).",
                users="| **Social worker** | Conference prep |\n| **House supervisor** | Shift handoff |",
                table_sql="""CREATE TABLE resident_incident_risk (
  id BIGSERIAL PRIMARY KEY,
  resident_id INTEGER NOT NULL,
  as_of_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL DEFAULT 60,
  incident_risk_probability DOUBLE PRECISION NOT NULL,
  risk_band VARCHAR(12),
  model_version VARCHAR(40) NOT NULL,
  drivers_json JSONB,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resident_id, as_of_date, horizon_days, model_version)
);""",
                upsert_sql="""INSERT INTO resident_incident_risk (resident_id, as_of_date, horizon_days, incident_risk_probability, risk_band, model_version, drivers_json)
VALUES (8, DATE '2026-04-07', 60, 0.41, 'Medium', 'incident_v2', '[{"factor":"recent incidents"}]'::jsonb)
ON CONFLICT (resident_id, as_of_date, horizon_days, model_version)
DO UPDATE SET incident_risk_probability = EXCLUDED.incident_risk_probability, risk_band = EXCLUDED.risk_band, drivers_json = EXCLUDED.drivers_json, scored_at = NOW();""",
                python_note="Map logistic coefficients to **plain-language** driver strings in ETL—not raw `num__` names in UI.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
final = pc(RandomForestClassifier(250, max_depth=5, class_weight="balanced_subsample", random_state=RANDOM_STATE, n_jobs=-1))
final.fit(X, y)
dump(final, OUTPUT_DIR / "incident_risk_v2.joblib")
'''
        )
    )
    save_nb(NB_DIR / "incident_risk_prediction.ipynb", c)


def build_8() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                8,
                "Intervention Effectiveness",
                "We quantify **associations** between **intervention plan categories present before a month** and **next-month education progress change**—for supervision and training, **not** causal proof.",
                [
                    "Descriptive mean deltas by category + predictive models (Dummy, Ridge, RF)",
                    "Explicit **selection bias** warning",
                    "Secondary tier — see Problem Framing",
                ],
                TIER_SECONDARY + " Treat as **hypothesis generation** for randomized pilots.",
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Staff ask **which service lines** deserve investment; leaders need structured evidence beyond anecdotes.",
                stakeholders_md="| **Clinical supervisor** | Training |\n| **Program quality** | Continuous improvement |",
                why_matters="Better targeting of **effective** supports (if validated later) improves outcomes per peso.",
                predictive_goal="**Regression:** predict **Δ progress** to next education record from binary category flags + plan count.",
                explanatory_goal="**Ridge** coefficients + **mean Δ by category** table for discussion.",
                why_different="Random forest may capture interactions for **priority flags**; ridge explains **linear** stories.",
                decision="**Quarterly service-mix review** and **pilot design** (not individual performance pay).",
                limitation="**No randomization**—harder cases likely receive more Safety plans.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="For each education row at date *t*, **Δ** = next record’s `progress_percent` minus current (first next row only).",
                at_prediction_time="Intervention plans with `created_at` ≤ *t*; category dummies indicate **ever active** categories up to *t*.",
                no_future_data="Future progress defines target only; not used as input.",
                split_validity="**GroupKFold** on `resident_id`.",
                checks_code_note="Drop residents with sparse records implicitly when no next row.",
            )
        )
    )
    c.append(cell_md(section_data_acq_prep("**Tables:** `intervention_plans`, `education_records`.")))
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import GroupKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

iv = pd.read_csv(DATA_DIR / "intervention_plans.csv", parse_dates=["created_at", "updated_at"])
edu = pd.read_csv(DATA_DIR / "education_records.csv", parse_dates=["record_date"])
cats = sorted(iv["plan_category"].dropna().unique())
rows = []
for _, er in edu.iterrows():
    rid, dt = int(er["resident_id"]), er["record_date"]
    nxt = edu[(edu["resident_id"] == rid) & (edu["record_date"] > dt)].sort_values("record_date")
    if nxt.empty:
        continue
    delta = float(nxt.iloc[0]["progress_percent"] - er["progress_percent"])
    plans = iv[(iv["resident_id"] == rid) & (iv["created_at"] <= dt)]
    row = {"resident_id": rid, "record_date": dt, "delta": delta, "n_plans": len(plans)}
    for cat in cats:
        row[f"cat_{cat}"] = int(cat in set(plans["plan_category"].values))
    rows.append(row)
p = pd.DataFrame(rows)
feat_cols = [f"cat_{c}" for c in cats] + ["n_plans"]
X, y, g = p[feat_cols], p["delta"], p["resident_id"]
prep = ColumnTransformer([("n", StandardScaler(), feat_cols)])

def pr(m):
    return Pipeline([("p", prep), ("m", m)])

print("Mean delta by active category (purely descriptive)")
for c in cats:
    col = f"cat_{c}"
    on = p.loc[p[col] == 1, "delta"]
    off = p.loc[p[col] == 0, "delta"]
    if len(on) > 5:
        print(c, "on_mean", on.mean(), "off_mean", off.mean(), "n_on", len(on))
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''sns.histplot(p["delta"], kde=True)
plt.title("Distribution of month-to-month progress changes")
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="Binary flags for **which plan families were open** before the education snapshot; `n_plans` proxies intensity.",
                baseline_name="Mean Δ (dummy)",
                interpretable_name="Ridge regression",
                performance_name="Random Forest regressor",
            )
        )
    )
    c.append(
        cell_code(
            '''gkf = GroupKFold(5)
for name, m in [("baseline", DummyRegressor(strategy="mean")), ("ridge", Ridge(2.0)), ("rf", RandomForestRegressor(180, max_depth=4, min_samples_leaf=12, random_state=RANDOM_STATE, n_jobs=-1))]:
    sc = cross_validate(pr(m), X, y, cv=gkf, groups=g, scoring={"mae": "neg_mean_absolute_error", "r2": "r2"}, n_jobs=-1)
    print(name, "MAE", -sc["test_mae"].mean(), "R2", sc["test_r2"].mean())
ridge_fit = pr(Ridge(2.0))
ridge_fit.fit(X, y)
coef = pd.Series(ridge_fit.named_steps["m"].coef_, index=feat_cols).sort_values()
coef.plot(kind="barh", title="Ridge on plan-category flags (selection bias likely)")
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="Negative mean Δ for a category may mean **harder cases** get that plan—not that the plan **harms** youth.",
                reliability="**Low for causal claims**; adequate for **agenda-setting** with clinical leadership.",
                do_differently="Run **small randomized pilots** before scaling any “drop this plan” decision.",
                decision_support="**Training curriculum** emphasis and **research questions**.",
                false_positives="Think a plan “works” when confounded → misallocate budget.",
                false_negatives="Discard a useful plan → worse outcomes; mitigate with **mixed-methods** evaluation.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Category-specific mean deltas and ridge signs are **descriptive**.",
                not_causal="Selection into plans drives most observed patterns.",
                honest_limits="Synthetic data; single org.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Lead with **selection bias** in every presentation.",
                    "Use table of **on vs off means** for discussion, not HR scoring.",
                    "RF lift over ridge is **about prediction**, not causality.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Partner with academics for **difference-in-differences** if IDs allow.",
                    "Document **ethical** use: never tie pay to these coefficients alone.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Quarterly** analytic job (not real-time).",
                net_surface="**.NET Admin → Quality dashboard** “Intervention insights” read-only cards (aggregated).",
                users="| **Program QA** | Reviews |\n| **Clinical director** | Training |",
                table_sql="""CREATE TABLE intervention_effectiveness_snapshot (
  id BIGSERIAL PRIMARY KEY,
  snapshot_quarter DATE NOT NULL,
  plan_category VARCHAR(64) NOT NULL,
  mean_progress_delta DOUBLE PRECISION,
  n_exposures INTEGER,
  model_version VARCHAR(40) NOT NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (snapshot_quarter, plan_category, model_version)
);""",
                upsert_sql="""INSERT INTO intervention_effectiveness_snapshot (snapshot_quarter, plan_category, mean_progress_delta, n_exposures, model_version)
VALUES (DATE '2026-04-01', 'Safety', -0.8, 120, 'intervention_v2')
ON CONFLICT (snapshot_quarter, plan_category, model_version)
DO UPDATE SET mean_progress_delta = EXCLUDED.mean_progress_delta, n_exposures = EXCLUDED.n_exposures, scored_at = NOW();""",
                python_note="Aggregate in Python then upsert; **no per-resident public scores** recommended.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
final = pr(RandomForestRegressor(180, max_depth=4, min_samples_leaf=12, random_state=RANDOM_STATE, n_jobs=-1))
final.fit(X, y)
dump(final, OUTPUT_DIR / "intervention_effect_v2.joblib")
'''
        )
    )
    save_nb(NB_DIR / "intervention_effectiveness.ipynb", c)


def build_9() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                9,
                "Donor Segmentation",
                "We discover **donor personas** with k-means, then train a **supervised segment-assignment model** so new donors can be **scored in production**—clustering alone is not enough for deployment.",
                [
                    "K-means (discovery) + Logistic (explain assignment) + RF (predict assignment)",
                    "Silhouette + **business-readable** cluster profiles",
                    "Honest note: personas are **descriptive**",
                ],
                "**Mixed tier:** Strong for **marketing personalization**; weaker for **finance forecasting**—pair with Pipelines 3–5.",
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Donors are treated uniformly in messaging despite different **cadence and scale** of giving.",
                stakeholders_md="| **Comms** | Tone & channel |\n| **Development** | Journey maps |",
                why_matters="Personas reduce **irrelevant** touches and improve **relevance**.",
                predictive_goal="**Multiclass:** assign **segment_id** for CRM routing (RF or logistic).",
                explanatory_goal="**Cluster center table** + **multinomial logistic** coefficients for **naming** and workshop teaching.",
                why_different="K-means **creates** segments (unsupervised); supervised models **operationalize** them for new records.",
                decision="**Journey templates** (email series A/B/C) and **event invitations**.",
                limitation="Stability of clusters with N≈60 donors is limited—refresh often.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="**Discovery:** k-means on scaled RFM at global snapshot. **Supervised label:** cluster id from k-means `predict` on same features (train k-means on **training donors only**, then assign test).",
                at_prediction_time="RFM as of **max donation date** in data (single cross-section scoring script can use rolling as-of).",
                no_future_data="For this notebook, features are **historical** totals as of dataset end; for production, recompute as-of run date.",
                split_validity="**GroupShuffleSplit** by `supporter_id` before fitting k-means on train only; test donors get cluster labels via **transform**.",
                checks_code_note="Print cluster sizes; warn if any cluster < 5 donors.",
            )
        )
    )
    c.append(
        cell_md(
            section_data_acq_prep(
                "**Table:** monetary `donations` aggregated per `supporter_id`.\n\n"
                "Features: recency (days since last gift at snapshot), frequency, total, average, recurring flag."
            )
        )
    )
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, silhouette_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

mon = pd.read_csv(DATA_DIR / "donations.csv", parse_dates=["donation_date"])
mon = mon[mon["donation_type"] == "Monetary"].dropna(subset=["amount"])
mx = mon["donation_date"].max()
rows = []
for sid in mon["supporter_id"].unique():
    pm = mon[mon["supporter_id"] == sid]
    rows.append({"supporter_id": sid, "frequency": len(pm), "recency_days": (mx - pm["donation_date"].max()).days, "monetary_total": pm["amount"].sum(), "monetary_avg": pm["amount"].mean(), "has_recurring": int(pm["is_recurring"].fillna(False).astype(bool).any())})
rfm = pd.DataFrame(rows)
NUM = ["recency_days", "frequency", "monetary_total", "monetary_avg", "has_recurring"]
Xu = rfm[NUM].values
scaler_vis = StandardScaler()
Xs_vis = scaler_vis.fit_transform(Xu)
best_k, best_s = 3, -1.0
for k in range(3, 7):
    lab = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=20).fit_predict(Xs_vis)
    s = silhouette_score(Xs_vis, lab)
    if s > best_s:
        best_k, best_s = k, s
print("k=", best_k, "silhouette=", round(best_s, 4))
km_vis = KMeans(n_clusters=best_k, random_state=RANDOM_STATE, n_init=20)
rfm["segment"] = km_vis.fit_predict(Xs_vis)
print(rfm.groupby("segment")[NUM].mean())
print(rfm["segment"].value_counts().sort_index())
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''sns.pairplot(rfm, vars=["recency_days", "frequency", "monetary_total"], hue="segment", plot_kws={"alpha": 0.6})
plt.suptitle("Segment separation (pairplot)", y=1.02)
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="Standard **RFM + recurring** for nonprofit segmentation.",
                baseline_name="DummyClassifier (predict majority segment on train)",
                interpretable_name="Multinomial logistic regression on scaled RFM",
                performance_name="Random Forest classifier for segment assignment",
            )
        )
    )
    c.append(
        cell_code(
            '''gss = GroupShuffleSplit(1, test_size=0.3, random_state=RANDOM_STATE)
tr, te = next(gss.split(rfm[NUM], np.zeros(len(rfm)), rfm["supporter_id"]))
scaler_km = StandardScaler()
Xs_tr_km = scaler_km.fit_transform(rfm.loc[tr, NUM].values)
km_tr = KMeans(n_clusters=best_k, random_state=RANDOM_STATE, n_init=20)
lab_tr = km_tr.fit_predict(Xs_tr_km)
lab_te = km_tr.predict(scaler_km.transform(rfm.loc[te, NUM].values))
X_tr, X_te = rfm.loc[tr, NUM], rfm.loc[te, NUM]
y_te = lab_te
prep = ColumnTransformer([("n", StandardScaler(), NUM)])

dummy = DummyClassifier(strategy="most_frequent")
dummy.fit(X_tr, lab_tr)
print("Dummy test acc", (dummy.predict(X_te) == y_te).mean())
log_pipe = Pipeline([("p", prep), ("c", LogisticRegression(max_iter=3000, random_state=RANDOM_STATE))])
log_pipe.fit(X_tr, lab_tr)
print("Logistic test acc", (log_pipe.predict(X_te) == y_te).mean())
print(classification_report(y_te, log_pipe.predict(X_te), zero_division=0))
rf_pipe = Pipeline([("p", prep), ("c", RandomForestClassifier(150, max_depth=4, random_state=RANDOM_STATE, n_jobs=-1))])
rf_pipe.fit(X_tr, lab_tr)
print("RF test acc", (rf_pipe.predict(X_te) == y_te).mean())
rf_clf = rf_pipe
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="Each **segment** is a bundle of similar giving behaviors; **names** (e.g., ‘steady sustainer’) should be chosen in a workshop, not by the algorithm alone.",
                reliability="Assignment accuracy is limited with **~60 donors**—treat as **soft** tags.",
                do_differently="Create **3–4 journey maps** aligned to segments; measure uplift with A/B tests.",
                decision_support="**CRM segment field** and **content calendar** variants.",
                false_positives="Wrong segment → slightly mismatched tone (usually low harm).",
                false_negatives="Donor doesn’t fit personas → generic journey; keep **opt-out** and preference center.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Clusters summarize **covariance** of RFM, not motivations.",
                not_causal="Personas don’t explain *why* people give.",
                honest_limits="Silhouette is a weak guide; business readability dominates.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "K-means **discovers**; supervised model **deploys**.",
                    "Compare logistic vs RF for **interpretability vs accuracy**.",
                    "Refresh segments **quarterly**.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Run **naming workshop** with comms + development.",
                    "Store `model_version` and `k` in DB.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Monthly** after donations sync (recompute RFM as-of date).",
                net_surface="**.NET CRM → Donor** `segment_code` + tooltip explaining **persona** in plain language.",
                users="| **Comms** | Journeys |\n| **Data admin** | Audits |",
                table_sql="""CREATE TABLE donor_segments (
  id BIGSERIAL PRIMARY KEY,
  supporter_id INTEGER NOT NULL,
  as_of_date DATE NOT NULL,
  segment_id INTEGER NOT NULL,
  segment_label VARCHAR(64),
  assignment_probability DOUBLE PRECISION,
  kmeans_k INTEGER NOT NULL,
  model_version VARCHAR(40) NOT NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (supporter_id, as_of_date, model_version)
);""",
                upsert_sql="""INSERT INTO donor_segments (supporter_id, as_of_date, segment_id, segment_label, assignment_probability, kmeans_k, model_version)
VALUES (42, DATE '2026-04-07', 2, 'SteadySustainer', 0.78, 4, 'segment_v2')
ON CONFLICT (supporter_id, as_of_date, model_version)
DO UPDATE SET segment_id = EXCLUDED.segment_id, segment_label = EXCLUDED.segment_label, assignment_probability = EXCLUDED.assignment_probability, scored_at = NOW();""",
                python_note="Persist **both** `joblib` of scaler+kmeans+RF classifier in one dict or Pipeline; scoring applies scaler→kmeans.predict_proba optional→RF.predict_proba for deployment stability.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
dump({"scaler_km_train": scaler_km, "kmeans": km_tr, "classifier_pipeline": rf_clf, "k": best_k, "num_cols": NUM}, OUTPUT_DIR / "donor_segment_bundle_v2.joblib")
'''
        )
    )
    save_nb(NB_DIR / "donor_segmentation.ipynb", c)


def build_10() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                10,
                "Social Media Engagement -> Donation Impact",
                "This pipeline focuses on **engagement signals that correlate with donations**, not vanity engagement alone. We model donation-linked outcomes and keep engagement as an explanatory mediator.",
                [
                    "Primary target: donation_referrals and estimated donation value",
                    "Baseline + interpretable + performance models",
                    "Heavy use of `social_media_posts.csv` with deployment-ready scoring tables",
                ],
                "**Exploratory-operational:** platform algorithms change quickly; retrain frequently and validate with experiments.",
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="The team wants to know which post characteristics drive **donation outcomes**, not just likes/comments.",
                stakeholders_md="| **Digital comms** | Content choices |\n| **Fundraising** | Campaign ROI |\n| **Leadership** | Budget allocation |",
                why_matters="High engagement without donation lift can consume budget and attention with limited mission impact.",
                predictive_goal="Predict **donation_referrals** (count) and **estimated_donation_value_php** from post attributes, with a binary high-conversion flag for triage.",
                explanatory_goal="Quantify which content/timing/platform factors align with stronger donation-linked outcomes, while showing engagement as a related mediator.",
                why_different="Predictive model optimizes ranking and expected value; interpretable model supports strategy conversations and creative guidelines.",
                decision="Which post types to prioritize in calendar, where to spend boost budget, and which posts enter rapid-response fundraising queue.",
                limitation="Correlational evidence only; boosted posts and platform algorithms confound causal interpretation.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="Primary regression target: `estimated_donation_value_php`; secondary classification target: `high_conversion_post` where donation_referrals >= median positive referrals.",
                at_prediction_time="Use pre-publish and early metadata fields (platform, post_type, topic, timing, CTA, caption features, boost flag/budget).",
                no_future_data="Do not use downstream donation fields as features; engagement metrics are used in explanatory EDA but excluded from strict pre-publish predictive feature set.",
                split_validity="KFold with shuffle is used for this post-level dataset; recommended production upgrade is time-based split by created_at month.",
                checks_code_note="Notebook explicitly builds `feature_cols_strict` excluding post-outcome leakage columns.",
            )
        )
    )
    c.append(
        cell_md(
            section_data_acq_prep(
                "**Table:** `social_media_posts.csv` (primary source).\n\n"
                "Preparation emphasizes donation-linked columns: `donation_referrals`, `estimated_donation_value_php`, plus post metadata and CTA fields."
            )
        )
    )
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import Ridge, LogisticRegression
from sklearn.metrics import mean_absolute_error, r2_score, roc_auc_score, classification_report
from sklearn.model_selection import KFold, train_test_split, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

soc = pd.read_csv(DATA_DIR / "social_media_posts.csv", parse_dates=["created_at"])
# Keep rows with donation-linked targets
soc = soc.dropna(subset=["donation_referrals", "estimated_donation_value_php"]).copy()

# Coerce numeric fields used for modeling
num_candidates = [
    "post_hour", "caption_length", "num_hashtags", "mentions_count", "boost_budget_php",
    "follower_count_at_post", "subscriber_count_at_post", "watch_time_seconds", "avg_view_duration_seconds",
]
for col in num_candidates:
    if col in soc.columns:
        soc[col] = pd.to_numeric(soc[col], errors="coerce").fillna(0)

if "is_boosted" in soc.columns:
    soc["is_boosted"] = soc["is_boosted"].astype(str).str.lower().eq("true").astype(int)
if "has_call_to_action" in soc.columns:
    soc["has_call_to_action"] = soc["has_call_to_action"].astype(str).str.lower().eq("true").astype(int)

# Strict pre-publish-ish feature set (no downstream outcomes like impressions/likes/clicks/referrals/value)
feature_num = [c for c in ["post_hour", "caption_length", "num_hashtags", "mentions_count", "is_boosted", "boost_budget_php", "follower_count_at_post"] if c in soc.columns]
feature_cat = [c for c in ["platform", "post_type", "media_type", "content_topic", "sentiment_tone", "call_to_action_type", "campaign_name"] if c in soc.columns]

X = soc[feature_num + feature_cat].copy()
y_value = pd.to_numeric(soc["estimated_donation_value_php"], errors="coerce").fillna(0)
y_ref = pd.to_numeric(soc["donation_referrals"], errors="coerce").fillna(0)
pos_ref = y_ref[y_ref > 0]
ref_thresh = pos_ref.median() if len(pos_ref) else 1
y_high = (y_ref >= ref_thresh).astype(int)

prep = ColumnTransformer([
    ("num", StandardScaler(), feature_num),
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), feature_cat),
])

def reg_pipe(m):
    return Pipeline([("prep", prep), ("model", m)])

def clf_pipe(m):
    return Pipeline([("prep", prep), ("model", m)])

print("Rows:", len(soc), "high-conversion rate:", y_high.mean(), "ref threshold:", ref_thresh)
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''fig, ax = plt.subplots(1, 2, figsize=(11, 4))
sns.histplot(y_ref, kde=True, ax=ax[0])
ax[0].set_title("Donation referrals per post")
sns.histplot(y_value, kde=True, ax=ax[1])
ax[1].set_title("Estimated donation value (PHP)")
plt.tight_layout(); plt.show()

if "engagement_rate" in soc.columns:
    corr = pd.DataFrame({
        "engagement_rate": pd.to_numeric(soc["engagement_rate"], errors="coerce").fillna(0),
        "donation_referrals": y_ref,
        "estimated_donation_value_php": y_value,
    }).corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="vlag", center=0)
    plt.title("Engagement vs donation-linked outcomes (correlation only)")
    plt.tight_layout(); plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="Use post metadata and campaign setup variables available before/at publish; reserve engagement metrics for explanatory analysis and diagnostics.",
                baseline_name="Dummy mean regressor (value) and stratified dummy classifier (high-conversion flag)",
                interpretable_name="Ridge regression (donation value) + Logistic regression (high conversion)",
                performance_name="Random Forest regressor/classifier",
            )
        )
    )
    c.append(
        cell_code(
            '''# Regression track: estimated donation value
kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
for name, model in [
    ("baseline", DummyRegressor(strategy="mean")),
    ("ridge", Ridge(2.0)),
    ("rf", RandomForestRegressor(n_estimators=250, max_depth=8, min_samples_leaf=5, random_state=RANDOM_STATE, n_jobs=-1)),
]:
    sc = cross_validate(reg_pipe(model), X, y_value, cv=kf, scoring={"mae": "neg_mean_absolute_error", "r2": "r2"}, n_jobs=-1)
    print("VALUE", name, "MAE", -sc["test_mae"].mean(), "R2", sc["test_r2"].mean())

# Classification track: high conversion post
for name, model in [
    ("baseline", DummyClassifier(strategy="stratified", random_state=RANDOM_STATE)),
    ("logit", LogisticRegression(max_iter=3000, class_weight="balanced", random_state=RANDOM_STATE)),
    ("rf", RandomForestClassifier(n_estimators=250, max_depth=8, class_weight="balanced_subsample", random_state=RANDOM_STATE, n_jobs=-1)),
]:
    sc = cross_validate(clf_pipe(model), X, y_high, cv=kf, scoring=["roc_auc", "f1"], n_jobs=-1)
    print("HIGH_CONV", name, "AUC", sc["test_roc_auc"].mean(), "F1", sc["test_f1"].mean())

# Holdout examples for business-friendly metrics
X_tr, X_te, yv_tr, yv_te = train_test_split(X, y_value, test_size=0.25, random_state=RANDOM_STATE)
rf_value = reg_pipe(RandomForestRegressor(n_estimators=250, max_depth=8, min_samples_leaf=5, random_state=RANDOM_STATE, n_jobs=-1))
rf_value.fit(X_tr, yv_tr)
yv_pred = rf_value.predict(X_te)
print("Holdout value MAE", mean_absolute_error(yv_te, yv_pred), "R2", r2_score(yv_te, yv_pred))

Xc_tr, Xc_te, yc_tr, yc_te = train_test_split(X, y_high, test_size=0.25, random_state=RANDOM_STATE, stratify=y_high)
logit = clf_pipe(LogisticRegression(max_iter=3000, class_weight="balanced", random_state=RANDOM_STATE))
logit.fit(Xc_tr, yc_tr)
pc = logit.predict_proba(Xc_te)[:, 1]
print("Holdout high-conv AUC", roc_auc_score(yc_te, pc))
print(classification_report(yc_te, (pc >= 0.5).astype(int), zero_division=0))

# Explainability artifacts
ridge = reg_pipe(Ridge(2.0)); ridge.fit(X, y_value)
coef = pd.Series(ridge.named_steps["model"].coef_, index=ridge.named_steps["prep"].get_feature_names_out()).sort_values()
coef.tail(15).plot(kind="barh", title="Ridge coefficients: donation value drivers")
plt.tight_layout(); plt.show()

rfc = clf_pipe(RandomForestClassifier(n_estimators=250, max_depth=8, class_weight="balanced_subsample", random_state=RANDOM_STATE, n_jobs=-1))
rfc.fit(X, y_high)
imp = pd.Series(rfc.named_steps["model"].feature_importances_, index=rfc.named_steps["prep"].get_feature_names_out()).sort_values(ascending=False).head(15)
imp.plot(kind="barh", title="RF importances: high-conversion drivers")
plt.tight_layout(); plt.show()
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="Pipeline 10 now answers: **which posts are likely to drive donations**, and which content factors correlate with donation outcomes-not just engagement volume.",
                reliability="Useful for ranking and experimentation; treat absolute predictions as uncertain due to platform drift and campaign confounding.",
                do_differently="Prioritize high-scoring draft posts for paid spend and prime publishing slots; run A/B tests on top explanatory drivers each month.",
                decision_support="Weekly editorial and fundraising standup: pick which posts to boost and which creative templates to repeat.",
                false_positives="A post predicted to convert may underperform, wasting budget or prime slot.",
                false_negatives="A post predicted low may actually convert, causing missed donation opportunity; keep an exploration quota for novel content.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Engagement metrics often correlate with referrals/value, and platform/content combinations show measurable associations with donation outcomes.",
                not_causal="Boosting, algorithmic distribution, and campaign context confound direct causal claims.",
                honest_limits="Without randomized experiments or robust quasi-experimental design, findings remain correlational.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Donation-linked targets should lead content strategy, with engagement as a supporting diagnostic.",
                    "Interpretable and performance models provide complementary value (guidance vs ranking).",
                    "Strongest next improvement is time-split validation and controlled experiments.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Set monthly creative experiments around top drivers (CTA type, post type, timing).",
                    "Allocate a fixed exploration budget to avoid overfitting to historical winners.",
                    "Retrain quarterly and after major platform algorithm changes.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="Weekly batch scoring for upcoming post queue + nightly backfill after outcomes arrive.",
                net_surface=".NET Marketing module: post planner list shows `p_high_conversion`, `predicted_donation_value_php`, and top drivers.",
                users="| **Digital comms** | Calendar and creative choices |\n| **Fundraising manager** | Budget and campaign decisions |",
                table_sql="""CREATE TABLE social_donation_impact_predictions (
  prediction_id BIGSERIAL PRIMARY KEY,
  post_id INTEGER,
  scored_for_date DATE NOT NULL,
  p_high_conversion DOUBLE PRECISION NOT NULL,
  predicted_donation_value_php DOUBLE PRECISION NOT NULL,
  model_version VARCHAR(40) NOT NULL,
  top_drivers JSONB,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, scored_for_date, model_version)
);""",
                upsert_sql="""INSERT INTO social_donation_impact_predictions
  (post_id, scored_for_date, p_high_conversion, predicted_donation_value_php, model_version, top_drivers)
VALUES
  (318, DATE '2026-04-07', 0.67, 12450.0, 'social_donation_v3', '[{"feature":"call_to_action_type","effect":"positive"}]'::jsonb)
ON CONFLICT (post_id, scored_for_date, model_version)
DO UPDATE SET
  p_high_conversion = EXCLUDED.p_high_conversion,
  predicted_donation_value_php = EXCLUDED.predicted_donation_value_php,
  top_drivers = EXCLUDED.top_drivers,
  scored_at = NOW();""",
                python_note="Scoring job writes one record per draft/scheduled post; after posting, outcomes update a separate fact table used for retraining.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
bundle = {
    "value_model": rf_value,
    "high_conversion_model": rfc,
    "feature_num": feature_num,
    "feature_cat": feature_cat,
    "referral_threshold": float(ref_thresh),
}
dump(bundle, OUTPUT_DIR / "social_donation_impact_v3.joblib")
print("Saved", OUTPUT_DIR / "social_donation_impact_v3.joblib")
'''
        )
    )
    save_nb(NB_DIR / "social_media_engagement.ipynb", c)


def main() -> None:
    build_6()
    build_7()
    build_8()
    build_9()
    build_10()
    print("Wrote pipelines 6–10 notebooks.")


if __name__ == "__main__":
    main()
