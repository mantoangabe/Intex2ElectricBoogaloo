#!/usr/bin/env python3
"""Regenerate pipelines 3–10 to match donor_retention / resident_progress depth. Run from repo root."""
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


# ---------------------------------------------------------------------------
# Pipeline 3: Donation amount (regression)
# ---------------------------------------------------------------------------
def build_3() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                3,
                "Donation Amount Prediction",
                "We estimate how large a supporter’s **next monetary gift** is likely to be, using only giving history available **before** a snapshot date—so fundraising can set **ethical ask bands** and forecast cash.",
                [
                    "Grouped validation by donor (no cheating with duplicate rows)",
                    "Baseline + Ridge (explain) + Random Forest (predict)",
                    "Full deployment: PostgreSQL + .NET fundraising UI",
                ],
                None,
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Campaign copy and CRM defaults often use one-size ask strings. Knowing **expected next gift size** (with uncertainty) helps personalize asks without embarrassing low-ball or exploitative high-ball amounts.",
                stakeholders_md="| **Development / comms** | Ask strings, email tiering |\n| **Finance / ED** | Rough cash timing (with caveats) |\n| **Donors** | Respectful, proportional invitations |",
                why_matters="Better alignment between **capacity signals in data** and **outreach** can lift response without increasing pressure tactics.",
                predictive_goal="**Continuous:** predicted **peso amount** of the **first** monetary gift in the 120-day forward window (logged target during training).",
                explanatory_goal="**Directional drivers:** which RFM-style factors historically align with **larger vs smaller** next gifts (Ridge coefficients on log scale).",
                why_different="Prediction optimizes **RMSE** for operational scoring; explanation optimizes **human trust** and workshop teaching—even if a linear model is slightly worse on error.",
                decision="**Ask-band assignment** in CRM and **campaign segment budgets** (e.g., major-gift officer prep for top decile).",
                limitation="Past wealth and channel confound **causal** stories; see Section 6.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="**y** = `amount` of the **earliest** monetary donation with `as_of_date` < `donation_date` ≤ `as_of_date + 120 days`.",
                at_prediction_time="Only gifts with `donation_date` < `as_of_date`, plus static supporter attributes. Allocation diversity uses rows with `donation_date` < `as_of_date`.",
                no_future_data="The forward gift that defines **y** is never included in feature aggregation windows.",
                split_validity="**GroupShuffleSplit** and **GroupKFold** by `supporter_id` because monthly snapshots duplicate donors.",
                checks_code_note="Code prints row counts and date ranges; inspect `panel` for missing labels.",
            )
        )
    )
    c.append(
        cell_md(
            section_data_acq_prep(
                "**Tables:** `donations.csv` (Monetary, non-null `amount`), `supporters.csv`, `donation_allocations.csv`.\n\n"
                "**Joins:** `donations` ⋈ `supporters` on `supporter_id`; `donations` ⋈ `allocations` on `donation_id` for `n_program_areas`.\n\n"
                "**Engineering:** winsorize historical amount sums at 1%/99%; target `log1p(y_amount)` for training."
            )
        )
    )
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupKFold, GroupShuffleSplit, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

def winsorize(s, lo=0.01, hi=0.99):
    return s.clip(lower=s.quantile(lo), upper=s.quantile(hi))

sup = pd.read_csv(DATA_DIR / "supporters.csv", parse_dates=["created_at", "first_donation_date"])
don = pd.read_csv(DATA_DIR / "donations.csv", parse_dates=["donation_date"])
alloc = pd.read_csv(DATA_DIR / "donation_allocations.csv")
don_a = don.merge(alloc, on="donation_id", how="left")
mon = don[(don["donation_type"] == "Monetary") & don["amount"].notna()].copy()

def build_panel(horizon=120):
    rows = []
    anchors = pd.date_range("2023-04-01", "2025-10-01", freq="MS")
    mx = mon["donation_date"].max()
    for as_of in anchors:
        if as_of + timedelta(days=horizon) > mx:
            continue
        for sid in mon.loc[mon["donation_date"] < as_of, "supporter_id"].unique():
            pm = mon[(mon["supporter_id"] == sid) & (mon["donation_date"] < as_of)].sort_values("donation_date")
            if pm.empty:
                continue
            fut = mon[(mon["supporter_id"] == sid) & (mon["donation_date"] > as_of) & (mon["donation_date"] <= as_of + timedelta(days=horizon))]
            if fut.empty:
                continue
            y_amt = float(fut.iloc[0]["amount"])
            last = pm.iloc[-1]
            recency = (as_of - last["donation_date"]).days
            freq = len(pm)
            amt_sum = winsorize(pm["amount"]).sum()
            amt_mean = pm["amount"].mean()
            has_rec = int(pm["is_recurring"].fillna(False).astype(bool).any())
            tenure = (as_of - pm["donation_date"].min()).days
            da = don_a[(don_a["supporter_id"] == sid) & (don_a["donation_date"] < as_of)]
            n_prog = int(da["program_area"].nunique(dropna=True))
            rows.append({"supporter_id": sid, "as_of_date": as_of, "y_amount": y_amt, "recency_days": recency, "frequency": freq, "sum_amount_hist": amt_sum, "mean_amount_hist": amt_mean, "has_recurring": has_rec, "tenure_days": tenure, "n_program_areas": n_prog})
    df = pd.merge(pd.DataFrame(rows), sup[["supporter_id", "supporter_type", "region", "acquisition_channel"]], on="supporter_id")
    return df

panel = build_panel()
panel["log_y"] = np.log1p(panel["y_amount"])
print(panel.shape, panel["y_amount"].describe())
panel.head()
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''fig, ax = plt.subplots(1, 2, figsize=(10, 4))
sns.histplot(panel["y_amount"], kde=True, ax=ax[0])
ax[0].set_title("Next gift (PHP)")
sns.histplot(panel["log_y"], kde=True, ax=ax[1])
ax[1].set_title("log1p(next gift)")
plt.tight_layout()
plt.show()
sns.heatmap(panel[["recency_days", "frequency", "sum_amount_hist", "mean_amount_hist", "tenure_days", "y_amount"]].corr(), annot=True, fmt=".2f", cmap="vlag", center=0)
plt.title("Linear associations (not causal)")
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="Classic **RFM** plus **recurring** flag and **program breadth** (`n_program_areas`) capture habit, scale, and engagement depth.",
                baseline_name="DummyRegressor (predict training-set mean of log1p y)",
                interpretable_name="Ridge regression (scaled numerics + one-hot)",
                performance_name="Random Forest regressor (+ Gradient Boosting comparison in CV)",
            )
        )
    )
    c.append(
        cell_code(
            '''NUM = ["recency_days", "frequency", "sum_amount_hist", "mean_amount_hist", "has_recurring", "tenure_days", "n_program_areas"]
CAT = ["supporter_type", "region", "acquisition_channel"]
X = panel[NUM + CAT]
y = panel["log_y"]
groups = panel["supporter_id"]
prep = ColumnTransformer([("n", StandardScaler(), NUM), ("c", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT)])

def pipe(model):
    return Pipeline([("p", prep), ("m", model)])

gkf = GroupKFold(5)
rows_cv = []
for name, model in [
    ("baseline_mean", DummyRegressor(strategy="mean")),
    ("ridge", Ridge(alpha=2.0)),
    ("rf", RandomForestRegressor(n_estimators=200, max_depth=6, min_samples_leaf=4, random_state=RANDOM_STATE, n_jobs=-1)),
    ("gbrt", GradientBoostingRegressor(random_state=RANDOM_STATE, max_depth=3, n_estimators=150, learning_rate=0.06)),
]:
    sc = cross_validate(pipe(model), X, y, cv=gkf, groups=groups, scoring={"rmse": "neg_root_mean_squared_error", "r2": "r2"}, n_jobs=-1)
    rows_cv.append({"model": name, "rmse_log": -sc["test_rmse"].mean(), "r2_log": sc["test_r2"].mean()})
cv_df = pd.DataFrame(rows_cv)
print(cv_df.to_string(index=False))

gss = GroupShuffleSplit(1, test_size=0.25, random_state=RANDOM_STATE)
tr, te = next(gss.split(X, y, groups))
best = RandomForestRegressor(n_estimators=250, max_depth=6, min_samples_leaf=4, random_state=RANDOM_STATE, n_jobs=-1)
p_best = pipe(best)
p_best.fit(X.iloc[tr], y.iloc[tr])
pred_log = p_best.predict(X.iloc[te])
true_amt = np.expm1(y.iloc[te])
pred_amt = np.expm1(pred_log)
print("Holdout MAE (PHP)", mean_absolute_error(true_amt, pred_amt))
print("Holdout RMSE (PHP)", mean_squared_error(true_amt, pred_amt) ** 0.5)
print("Holdout R2 log-scale", r2_score(y.iloc[te], pred_log))
'''
        )
    )
    c.append(
        cell_code(
            '''ridge_full = pipe(Ridge(2.0))
ridge_full.fit(X.iloc[tr], y.iloc[tr])
coef = pd.Series(ridge_full.named_steps["m"].coef_, index=ridge_full.named_steps["p"].get_feature_names_out()).sort_values()
plt.figure(figsize=(8, max(4, len(coef) * 0.15)))
coef.plot(kind="barh", color="steelblue")
plt.title("Ridge coefficients (log1p next amount)")
plt.tight_layout()
plt.show()
print("Chosen for production scoring: Random Forest (see CV table vs Ridge vs baseline).")
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="The model learns **who tends to give larger next gifts** from past frequency and scale. It does **not** read donor morality—only observable history.",
                reliability="With ~60 unique donors and many panel rows, metrics **move** with split. Use scores as **priorities**, not guarantees; refresh quarterly.",
                do_differently="Set **ask bands** by decile of predicted next gift; **A/B test** wording; never show raw scores to donors.",
                decision_support="**CRM default ask** and **staff prep** for high-decile donors.",
                false_positives="Suggested ask **too high** → lower conversion or donor discomfort; mitigate with **soft ranges** and human override.",
                false_negatives="Suggested ask **too low** → leave money on table; mitigate by **caps and major-gift review** for high-tenure donors.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Larger historical totals and frequency usually align with larger next gifts in CV.",
                not_causal="Channel and acquisition confound wealth; Ridge weights are **associational**.",
                honest_limits="No experimental variation; small donor universe.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Tree model typically beats Ridge on RMSE; Ridge explains **direction** of drivers.",
                    "Program breadth and recurring signal often matter—validate on your next refresh.",
                    "Always compare to **baseline mean** before trusting production scores.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Deploy **decile bands** in CRM, not point asks alone.",
                    "Log `model_version` and retrain when campaigns shift behavior.",
                    "Pair scores with **relationship manager judgment** for major gifts.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Nightly or weekly batch** after donations sync (or on-demand before big campaigns).",
                net_surface="**Fundraising → Donor detail** panel: “Suggested next gift band”; optional internal-only column in donor list export.",
                users="| **Development** | Sets asks |\n| **Comms** | Email tiering |\n| **Data admin** | Monitors drift |",
                table_sql="""CREATE TABLE donor_next_amount_predictions (
  prediction_id BIGSERIAL PRIMARY KEY,
  supporter_id INTEGER NOT NULL,
  as_of_date DATE NOT NULL,
  forward_window_days INTEGER NOT NULL DEFAULT 120,
  predicted_next_amount_php DOUBLE PRECISION NOT NULL,
  band_low_php DOUBLE PRECISION,
  band_high_php DOUBLE PRECISION,
  model_version VARCHAR(40) NOT NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (supporter_id, as_of_date, forward_window_days, model_version)
);
CREATE INDEX idx_donor_amt_sup ON donor_next_amount_predictions (supporter_id);
CREATE INDEX idx_donor_amt_run ON donor_next_amount_predictions (scored_at DESC);""",
                upsert_sql="""INSERT INTO donor_next_amount_predictions
  (supporter_id, as_of_date, forward_window_days, predicted_next_amount_php, band_low_php, band_high_php, model_version)
VALUES (42, DATE '2026-04-07', 120, 1250.0, 800.0, 1700.0, 'donation_amount_v2')
ON CONFLICT (supporter_id, as_of_date, forward_window_days, model_version)
DO UPDATE SET predicted_next_amount_php = EXCLUDED.predicted_next_amount_php,
  band_low_php = EXCLUDED.band_low_php, band_high_php = EXCLUDED.band_high_php, scored_at = NOW();""",
                python_note="Persist `joblib.dump(final_pipeline, OUTPUT_DIR / 'donation_amount_v2.joblib')` after sign-off; scoring script loads artifact and uses SQLAlchemy/`psycopg2` `execute_values` for bulk upsert.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
final = Pipeline([("p", prep), ("m", RandomForestRegressor(250, max_depth=6, min_samples_leaf=4, random_state=RANDOM_STATE, n_jobs=-1))])
final.fit(X, y)
dump(final, OUTPUT_DIR / "donation_amount_v2.joblib")
print("Saved", OUTPUT_DIR / "donation_amount_v2.joblib")
'''
        )
    )
    save_nb(NB_DIR / "donation_amount_prediction.ipynb", c)


def build_4() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                4,
                "Donor Lifetime Value (LTV) Proxy",
                "We estimate **monetary giving over the next 365 days** from each supporter’s history—a **practical LTV proxy** when true lifetime length is unknown.",
                [
                    "365-day forward sum as operational target",
                    "Dummy + Ridge + Random Forest compared with grouped CV",
                    "PostgreSQL store for portfolio views in .NET",
                ],
                None,
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Leadership needs a **forward-looking donor value** view for staffing and campaign investment—not only last gift.",
                stakeholders_md="| **ED / board** | Portfolio narrative |\n| **Major gifts** | Pipeline depth |\n| **Finance** | Rough receipts (scenario only) |",
                why_matters="Concentrating relationship time on **high forward-value** donors (with ethics) improves ROI of scarce staff hours.",
                predictive_goal="**Regression:** predicted **sum of monetary gifts** in the next 365 days (log1p trained).",
                explanatory_goal="**Ridge** shows which historical patterns align with **higher forward-year totals**.",
                why_different="Trees may fit nonlinear combos for **scoring**; Ridge supports **storytelling** in board decks.",
                decision="**Portfolio tiers** and **relationship manager assignment** priorities.",
                limitation="One-year window ≠ lifetime; macro shocks omitted.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="**y** = sum of `amount` for monetary gifts with `as_of` < date ≤ `as_of + 365 days`.",
                at_prediction_time="Gifts and allocations strictly before `as_of`; static supporter attributes.",
                no_future_data="Forward-year gifts excluded from features.",
                split_validity="**GroupKFold / GroupShuffleSplit** by `supporter_id`.",
                checks_code_note="Panel date bounds printed with row counts.",
            )
        )
    )
    c.append(
        cell_md(
            section_data_acq_prep(
                "**Tables:** monetary `donations`, `supporters`, `donation_allocations` for program count.\n\n"
                "Same engineering patterns as Pipeline 3 with **365-day horizon**."
            )
        )
    )
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import GroupKFold, GroupShuffleSplit, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

def ws(s):
    return s.clip(s.quantile(0.01), s.quantile(0.99))

sup = pd.read_csv(DATA_DIR / "supporters.csv", parse_dates=["created_at"])
mon = pd.read_csv(DATA_DIR / "donations.csv", parse_dates=["donation_date"])
mon = mon[(mon["donation_type"] == "Monetary") & mon["amount"].notna()].copy()
alloc = pd.read_csv(DATA_DIR / "donation_allocations.csv")
da = mon.merge(alloc, on="donation_id", how="left")
rows = []
anchors = pd.date_range("2023-04-01", "2025-01-01", freq="MS")
mx = mon["donation_date"].max()
for as_of in anchors:
    if as_of + timedelta(days=365) > mx:
        continue
    for sid in mon.loc[mon["donation_date"] < as_of, "supporter_id"].unique():
        pm = mon[(mon["supporter_id"] == sid) & (mon["donation_date"] < as_of)]
        if pm.empty:
            continue
        fut = mon[(mon["supporter_id"] == sid) & (mon["donation_date"] > as_of) & (mon["donation_date"] <= as_of + timedelta(days=365))]
        y = float(fut["amount"].sum())
        last = pm.sort_values("donation_date").iloc[-1]
        rec = (as_of - last["donation_date"]).days
        freq = len(pm)
        sm = ws(pm["amount"]).sum()
        mn = pm["amount"].mean()
        hr = int(pm["is_recurring"].fillna(False).astype(bool).any())
        ten = (as_of - pm["donation_date"].min()).days
        npr = int(da[(da["supporter_id"] == sid) & (da["donation_date"] < as_of)]["program_area"].nunique(dropna=True))
        rows.append({"supporter_id": sid, "as_of": as_of, "y_ltv": y, "recency_days": rec, "frequency": freq, "hist_sum": sm, "hist_mean": mn, "has_recurring": hr, "tenure_days": ten, "n_prog": npr})
p = pd.merge(pd.DataFrame(rows), sup[["supporter_id", "supporter_type", "region", "acquisition_channel"]], on="supporter_id")
p["log1p_y"] = np.log1p(p["y_ltv"])
print(p.shape, p["y_ltv"].describe())
NUM = ["recency_days", "frequency", "hist_sum", "hist_mean", "has_recurring", "tenure_days", "n_prog"]
CAT = ["supporter_type", "region", "acquisition_channel"]
X, y, g = p[NUM + CAT], p["log1p_y"], p["supporter_id"]
prep = ColumnTransformer([("n", StandardScaler(), NUM), ("c", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT)])

def pipe(m):
    return Pipeline([("p", prep), ("m", m)])
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''plt.figure(figsize=(6, 4))
sns.histplot(p["y_ltv"], kde=True)
plt.title("365-day forward monetary total (PHP)")
plt.show()
sns.heatmap(p[["recency_days", "frequency", "hist_sum", "hist_mean", "tenure_days", "y_ltv"]].corr(), annot=True, fmt=".2f", cmap="vlag", center=0)
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="RFM + recurring + program count proxy **breadth of mission engagement**.",
                baseline_name="Mean log1p forward total",
                interpretable_name="Ridge regression",
                performance_name="Random Forest (+ GBRT in CV loop)",
            )
        )
    )
    c.append(
        cell_code(
            '''gkf = GroupKFold(5)
for name, m in [("baseline", DummyRegressor(strategy="mean")), ("ridge", Ridge(3.0)), ("rf", RandomForestRegressor(200, max_depth=6, min_samples_leaf=4, random_state=RANDOM_STATE, n_jobs=-1)), ("gbrt", GradientBoostingRegressor(random_state=RANDOM_STATE, max_depth=3, n_estimators=120))]:
    sc = cross_validate(pipe(m), X, y, cv=gkf, groups=g, scoring={"rmse": "neg_root_mean_squared_error", "r2": "r2"}, n_jobs=-1)
    print(name, "RMSE_log", -sc["test_rmse"].mean(), "R2", sc["test_r2"].mean())
gss = GroupShuffleSplit(1, test_size=0.25, random_state=RANDOM_STATE)
tr, te = next(gss.split(X, y, g))
rf = RandomForestRegressor(220, max_depth=6, min_samples_leaf=4, random_state=RANDOM_STATE, n_jobs=-1)
pr = pipe(rf)
pr.fit(X.iloc[tr], y.iloc[tr])
pred = np.expm1(pr.predict(X.iloc[te]))
true = np.expm1(y.iloc[te])
print("Holdout MAE pesos", mean_absolute_error(true, pred))
ridge_explain = pipe(Ridge(3.0))
ridge_explain.fit(X.iloc[tr], y.iloc[tr])
coef = pd.Series(ridge_explain.named_steps["m"].coef_, index=ridge_explain.named_steps["p"].get_feature_names_out()).sort_values()
coef.tail(12).plot(kind="barh", color="darkgreen")
plt.title("Ridge — drivers of log1p forward-year total")
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="Higher predicted **next-year totals** mean “this relationship likely moves more money soon”—not that the person is ‘better.’",
                reliability="Use for **ranking** inside portfolio reviews; external audit of fairness recommended if used in HR-like decisions.",
                do_differently="Pair tiers with **qualitative relationship knowledge**; do not auto-cut stewardship for ‘low LTV’ scores.",
                decision_support="**Time allocation** for major-gift officers and **board charts**.",
                false_positives="Over-invest time on someone who quiets giving → opportunity cost.",
                false_negatives="Under-invest in a rising donor → missed relationship; mitigate with **floor touches** for all active donors.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Past heavy givers tend to show higher forward sums in-sample.",
                not_causal="Wealth, channel, and life events confound.",
                honest_limits="Single synthetic org sample; short history.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Compare every release to **baseline mean**.",
                    "Ridge gives **narrative**; RF gives **scores**.",
                    "365d sum is a **proxy**, not philosophical lifetime value.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Publish **tier definitions** internally (deciles).",
                    "Refresh after **major campaigns**.",
                    "Document **ethical use** policy (no automated donor shaming).",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Monthly batch** after books close or weekly if CRM supports incremental sync.",
                net_surface="**Development dashboard** → Donor portfolio heatmap; export for board slides (aggregated only).",
                users="| **Leadership** | Strategy |\n| **MGO** | Call lists |",
                table_sql="""CREATE TABLE donor_ltv_estimates (
  id BIGSERIAL PRIMARY KEY,
  supporter_id INTEGER NOT NULL,
  as_of_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL DEFAULT 365,
  estimated_forward_giving_php DOUBLE PRECISION NOT NULL,
  tier VARCHAR(16),
  model_version VARCHAR(40) NOT NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (supporter_id, as_of_date, horizon_days, model_version)
);""",
                upsert_sql="""INSERT INTO donor_ltv_estimates (supporter_id, as_of_date, horizon_days, estimated_forward_giving_php, tier, model_version)
VALUES (42, DATE '2026-04-07', 365, 15000.0, 'TierA', 'ltv_v2')
ON CONFLICT (supporter_id, as_of_date, horizon_days, model_version)
DO UPDATE SET estimated_forward_giving_php = EXCLUDED.estimated_forward_giving_php, tier = EXCLUDED.tier, scored_at = NOW();""",
                python_note="Scoring job: `joblib.load` → compute features as-of run date → upsert.",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
final = pipe(RandomForestRegressor(220, max_depth=6, min_samples_leaf=4, random_state=RANDOM_STATE, n_jobs=-1))
final.fit(X, y)
dump(final, OUTPUT_DIR / "donor_ltv_v2.joblib")
print("Saved artifact")
'''
        )
    )
    save_nb(NB_DIR / "donor_ltv.ipynb", c)


def build_5() -> None:
    c = []
    c.append(
        cell_md(
            executive_summary(
                5,
                "Donation Timing Prediction",
                "We estimate the **probability of any monetary gift within the next 30 days** so comms can time **touches** without blasting everyone.",
                [
                    "30-day window (adjust `HORIZON` for 60/90 in code)",
                    "Dummy + Logistic (explain) + Random Forest (predict)",
                    "Grouped CV by donor",
                ],
                None,
            )
        )
    )
    c.append(
        cell_md(
            section_problem_framing(
                business_problem="Blast emails at random times **fatigue** donors; quiet periods before likely gifts are missed opportunities.",
                stakeholders_md="| **Comms** | Send calendar |\n| **Development** | Lightweight nudges |",
                why_matters="Better **timing** can lift response rates with **fewer** messages.",
                predictive_goal="**Binary:** P(gift in next `HORIZON` days).",
                explanatory_goal="**Logistic coefficients** on recency/frequency show **who is ‘due’** in data language.",
                why_different="Random Forest may lift AUC for routing; logistic gives **signed** drivers for workshops.",
                decision="**Weekly send queue** ordering and **suppress** rules for low-probability donors during quiet weeks.",
                limitation="Seasonality partially unmodeled; calendar events matter.",
            )
        )
    )
    c.append(
        cell_md(
            section_leakage(
                target_definition="**y=1** if ≥1 monetary gift in (`as_of`, `as_of + HORIZON`].",
                at_prediction_time="History strictly before `as_of`.",
                no_future_data="Forward window only in label.",
                split_validity="Grouped by `supporter_id`.",
                checks_code_note="Print class balance per anchor sample.",
            )
        )
    )
    c.append(cell_md(section_data_acq_prep("**Tables:** monetary `donations`, `supporters`. Monthly panel similar to Pipeline 1.")))
    c.append(cell_code(COMMON_ROOT))
    c.append(
        cell_code(
            '''from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score, RocCurveDisplay, ConfusionMatrixDisplay
from sklearn.model_selection import GroupKFold, GroupShuffleSplit, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

HORIZON = 30
sup = pd.read_csv(DATA_DIR / "supporters.csv", parse_dates=["created_at"])
mon = pd.read_csv(DATA_DIR / "donations.csv", parse_dates=["donation_date"])
mon = mon[mon["donation_type"] == "Monetary"].copy()
rows = []
anchors = pd.date_range("2023-05-01", "2025-11-01", freq="MS")
mx = mon["donation_date"].max()
for as_of in anchors:
    if as_of + timedelta(days=HORIZON) > mx:
        continue
    for sid in mon.loc[mon["donation_date"] < as_of, "supporter_id"].unique():
        pm = mon[(mon["supporter_id"] == sid) & (mon["donation_date"] < as_of)].sort_values("donation_date")
        if len(pm) < 1:
            continue
        fut = mon[(mon["supporter_id"] == sid) & (mon["donation_date"] > as_of) & (mon["donation_date"] <= as_of + timedelta(days=HORIZON))]
        y = int(len(fut) > 0)
        last = pm.iloc[-1]
        rows.append({"supporter_id": sid, "as_of": as_of, "y": y, "recency_days": (as_of - last["donation_date"]).days, "frequency": len(pm), "mean_amt": pm["amount"].fillna(0).mean(), "has_rec": int(pm["is_recurring"].fillna(False).astype(bool).any()), "tenure": (as_of - pm["donation_date"].min()).days})
p = pd.merge(pd.DataFrame(rows), sup[["supporter_id", "supporter_type", "acquisition_channel"]], on="supporter_id")
print("positive rate", p["y"].mean(), "rows", len(p))
NUM = ["recency_days", "frequency", "mean_amt", "has_rec", "tenure"]
CAT = ["supporter_type", "acquisition_channel"]
X, y, g = p[NUM + CAT], p["y"], p["supporter_id"]
prep = ColumnTransformer([("n", StandardScaler(), NUM), ("c", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT)])

def pc(model):
    return Pipeline([("p", prep), ("c", model)])
'''
        )
    )
    c.append(cell_md(section_eda()))
    c.append(
        cell_code(
            '''sns.boxplot(data=p, x="y", y="recency_days")
plt.title("Recency vs gift in next 30d")
plt.show()
'''
        )
    )
    c.append(
        cell_md(
            section_modeling_intro(
                features_rationale="Recency/frequency dominate **timing** intuition; tenure and mean amount add scale.",
                baseline_name="Stratified dummy (marginal prevalence)",
                interpretable_name="Balanced logistic regression",
                performance_name="Random Forest + Gradient Boosting benchmark",
            )
        )
    )
    c.append(
        cell_code(
            '''gkf = GroupKFold(5)
for name, m in [("dummy_strat", DummyClassifier(strategy="stratified", random_state=RANDOM_STATE)), ("logit", LogisticRegression(max_iter=2500, class_weight="balanced", random_state=RANDOM_STATE)), ("rf", RandomForestClassifier(200, max_depth=6, class_weight="balanced_subsample", random_state=RANDOM_STATE, n_jobs=-1)), ("gb", GradientBoostingClassifier(random_state=RANDOM_STATE, max_depth=3, n_estimators=150))]:
    sc = cross_validate(pc(m), X, y, cv=gkf, groups=g, scoring=["roc_auc", "f1"], n_jobs=-1)
    print(name, "AUC", sc["test_roc_auc"].mean(), "F1", sc["test_f1"].mean())
gss = GroupShuffleSplit(1, test_size=0.25, random_state=RANDOM_STATE)
tr, te = next(gss.split(X, y, g))
logit = pc(LogisticRegression(max_iter=2500, class_weight="balanced", random_state=RANDOM_STATE))
logit.fit(X.iloc[tr], y.iloc[tr])
pr = logit.predict_proba(X.iloc[te])[:, 1]
print("Holdout AUC", roc_auc_score(y.iloc[te], pr))
fig, ax = plt.subplots(1, 2, figsize=(10, 4))
ConfusionMatrixDisplay.from_predictions(y.iloc[te], (pr >= 0.5).astype(int), ax=ax[0])
RocCurveDisplay.from_predictions(y.iloc[te], pr, ax=ax[1])
plt.tight_layout()
plt.show()
coef = pd.Series(logit.named_steps["c"].coef_.ravel(), index=logit.named_steps["p"].get_feature_names_out()).sort_values()
coef.plot(kind="barh", figsize=(7, 5), title="Logistic coefficients (timing)")
plt.tight_layout()
plt.show()
'''
        )
    )
    c.append(cell_md(section_evaluation()))
    c.append(
        cell_md(
            section_business_interpretation(
                plain_english="High score ≈ ‘statistically due soon’ given past rhythm—not a guarantee they want email **today**.",
                reliability="Moderate; tune threshold to **weekly email capacity**.",
                do_differently="**Stagger** campaigns using ranked probabilities; add **human holidays** calendar overlay.",
                decision_support="**Send queue ordering** and **suppression** during low-probability weeks.",
                false_positives="Extra message to someone who would have given anyway → mild fatigue.",
                false_negatives="Skip a donor who would have responded → lost gift; mitigate **floor** of gratitude touches.",
            )
        )
    )
    c.append(
        cell_md(
            section_causal(
                discovered="Short recency aligns with imminent gifts.",
                not_causal="Reminders not randomized.",
                honest_limits="Campaign spikes unmodeled.",
            )
        )
    )
    c.append(
        cell_md(
            section_key_findings(
                [
                    "Always beat **dummy stratified** before trusting.",
                    "Logistic gives **interpretable** ‘due’ narrative.",
                    "Adjust `HORIZON` for quarterly planning.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_recommended_actions(
                [
                    "Set threshold from **ops capacity**, not default 0.5.",
                    "Log experiments when messaging changes.",
                ]
            )
        )
    )
    c.append(
        cell_md(
            section_deployment_full(
                trigger="**Weekly** batch Monday 6am before comms build.",
                net_surface="**Comms module** → “Suggested send week” column; API filter `p_gift_30d > 0.4`.",
                users="| **Comms manager** | Scheduling |\n| **Volunteer coordinator** | SMS cadence |",
                table_sql="""CREATE TABLE donor_timing_predictions (
  id BIGSERIAL PRIMARY KEY,
  supporter_id INTEGER NOT NULL,
  as_of_date DATE NOT NULL,
  horizon_days INTEGER NOT NULL,
  p_gift_in_window DOUBLE PRECISION NOT NULL,
  model_version VARCHAR(40) NOT NULL,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (supporter_id, as_of_date, horizon_days, model_version)
);""",
                upsert_sql="""INSERT INTO donor_timing_predictions (supporter_id, as_of_date, horizon_days, p_gift_in_window, model_version)
VALUES (42, DATE '2026-04-07', 30, 0.62, 'timing_v2')
ON CONFLICT (supporter_id, as_of_date, horizon_days, model_version)
DO UPDATE SET p_gift_in_window = EXCLUDED.p_gift_in_window, scored_at = NOW();""",
                python_note="",
            )
        )
    )
    c.append(
        cell_code(
            '''from joblib import dump
best = pc(RandomForestClassifier(200, max_depth=6, class_weight="balanced_subsample", random_state=RANDOM_STATE, n_jobs=-1))
best.fit(X, y)
dump(best, OUTPUT_DIR / "donation_timing_v2.joblib")
'''
        )
    )
    save_nb(NB_DIR / "donation_timing_prediction.ipynb", c)


def main() -> None:
    build_3()
    build_4()
    build_5()
    import generate_pipelines_6_10 as p610

    p610.main()


if __name__ == "__main__":
    main()
