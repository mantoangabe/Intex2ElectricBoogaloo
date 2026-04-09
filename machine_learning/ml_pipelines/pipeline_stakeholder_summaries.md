# ML Pipelines — Stakeholder Summary

**Organization:** River of Life / Lighthouse Sanctuary (INTEX)  
**Audience:** Leadership, board/shareholders, and partners who need the *why* and *so what* without reading code.  
**Companion:** Each section maps to a Jupyter notebook in this folder (`*_*.ipynb`).

This document summarizes **four** upgraded analytics pipelines: what problem they address, what the models do, what we learned at a high level, and **why it matters** for mission and operations.

**Application note:** Trained scores are loaded into the **PostgreSQL** prediction tables and surfaced through the **.NET API** and **admin UI** (dashboard and reports). Counts and averages use the **latest scored batch** (`scored_at`) unless otherwise noted. **Pipeline 10** stores expected lift as **`predicted_donation_value_php`** (peso-scale). The admin UI converts those values to **approximate US dollars for display** using a simple **~56 PHP/USD** planning ratio so per-post figures are interpretable to judges and US stakeholders (not “twenty-two thousand US dollars per post” from mislabeled peso numbers).

---

## At a glance

| Pipeline | Notebook | Core question | Who benefits |
|----------|----------|---------------|--------------|
| **1 — Donor retention / lapse** | `donor_retention.ipynb` | Which supporters are at risk of **not giving again soon**? | Development, stewardship |
| **2 — Resident progress** | `resident_progress.ipynb` | Which residents may **stall or slip** academically in the **next ~45 days**? | Case managers, program leads |
| **7 — Incident risk** | `incident_risk_prediction.ipynb` | Which resident-months look like **higher safety incident risk** in the **next 60 days**? | House parents, safety officer |
| **10 — Social → donations** | `social_media_engagement.ipynb` | Which **planned post traits** align with **donation-attributed** outcomes (not just likes)? | Fundraising, communications |

---

## Pipeline 1: Donor Retention / Lapse Risk

**Notebook:** `donor_retention.ipynb`

### Purpose
Help the organization **prioritize stewardship** when time is limited: identify monetary donors who are **more likely to lapse**—defined as **no monetary gift within ~105 days** after a monthly “snapshot” date—so staff can **thank, check in, and re-engage** before silence becomes habit.

### What the model does (predictive)
- Produces a **probability of lapse** per donor per snapshot using **RFM-style history** (recency, frequency, monetary patterns), recurring behavior, program-area breadth from allocations, and donor segment fields.
- Uses **grouped validation by donor** so metrics are honest when the same person appears in many months.
- **Preprocessing** (imputation, winsorization of monetary fields, scaling) runs **inside** the sklearn pipeline so evaluation is not inflated by peeking at test data.
- Includes **hyperparameter tuning** and an **operations-driven score cutoff** (e.g. top fraction of risk) rather than only a 0.5 threshold.

### What we explain (not causal)
- **Logistic regression** and coefficient-style reading clarify **which historical patterns co-occur** with lapse—useful for **messaging hypotheses** (e.g. recurring donors often look “stickier”), with explicit warnings that **correlation is not causation**.

### Why it matters to the organization
- Retention is typically **cheaper than acquisition**; a ranked list turns “we should steward donors” into a **weekly workflow**.
- Outputs can feed a **stewardship queue** in internal systems—always as **decision support**, not an automated judgment about people.

### In the admin application
- The **dashboard** and **reports** can show how many supporters sit in a **high lapse-risk band** (e.g. probability above an agreed cutoff such as **0.66**) from the **latest** donor-retention batch—useful as a **queue size**, not a verdict on any individual.

### Presentation line
*“We score which donors look most likely to go quiet in the next quarter so development can focus calls and emails where early outreach protects relationships and revenue.”*

---

## Pipeline 2: Resident Progress / Intervention Priority

**Notebook:** `resident_progress.ipynb`

### Purpose
Support **case managers** in deciding **where to focus** education and wellbeing support: flag resident-month snapshots at **higher risk** of **not progressing**—specifically **worse or very low educational progress** in the **next ~45 days**—using records available **only up to** each snapshot date.

### What the model does (predictive)
- **Binary risk score** from recent **education trajectory** (means, trends, variability), **health** touchpoints, **incidents**, **intervention plans** (including stalled “on hold” counts), **counseling/session** intensity and concern rates, **home visits**, tenure, site, and case context.
- **Grouped validation by resident** because monthly panel rows for the same child are correlated.
- **Imputation and scaling in-pipeline**; added **tuned models** and **threshold choice** tied to **how many cases** the team can deeply review per cycle.

### What we explain (not causal)
- Expanded discussion of **confounding**, **panel data**, and **why coefficients are not treatment effects**—still valuable for **supervision and training** on early signals.

### Why it matters to the organization
- Moves response from **purely reactive** to **prioritized proactive** check-ins when patterns in the case file resemble past slip periods.
- Must remain **internal decision support**—professional judgment and **dignity** for residents stay primary.

### In the admin application
- **Dashboard / reports** may display a count of residents in a **high “low progress” risk** band (same latest batch, cutoff such as **≥ 0.66**) to size **case-management** follow-up—not to label a child.

### Presentation line
*“We help teams see which young people’s recent school and case patterns resemble months that later struggled—so managers can schedule reviews and supports before grades or wellbeing slip.”*

---

## Pipeline 7: Incident Risk Prediction

**Notebook:** `incident_risk_prediction.ipynb`

### Purpose
Give **safety and supervision** a **data-grounded watchlist**: estimate whether a resident is **more likely to have at least one incident** in the **next 60 days**, from **pre-window** case history only (prior incidents, education/health rollups, interventions, counseling and home-visit signals, tenure, site, risk tier, case status)—**not** from future or post-outcome fields.

### What the model does (predictive)
- Compares **dummy baseline**, **balanced logistic regression**, and **random forest** with **honest train/holdout** and **cross-validation** on the training split.
- **Rich EDA** links **prior incidents**, **risk labels**, **site**, **tenure**, and **missingness** to outcomes; **multiple probability thresholds** translate scores into **how many residents get flagged** under different staffing assumptions.

### What we explain (not causal)
- **Coefficients and feature importances** highlight **persistence of incident load** and contextual factors; narrative stresses **no proof** that any single factor *causes* incidents—common causes and reporting bias may drive patterns.

### Why it matters to the organization
- Supports **huddles and staffing focus** when time is finite; **false negatives** are safety-sensitive, so thresholds and process must be chosen with care.
- **Never** replaces mandatory reporting, policy, or human judgment.

### In the admin application
- **Dashboard / reports** may show how many residents fall in a **high incident-risk** band for the **60-day** horizon (latest batch, e.g. **≥ 0.66**) to focus **safety** attention—alongside policy, not instead of it.

### Presentation line
*“We rank which cases’ recent records look most like past months that saw incidents—so supervisors can focus attention and prevention, not replace safety protocols.”*

---

## Pipeline 10: Social Media → Donation-Driven Content

**Notebook:** `social_media_engagement.ipynb`

### Purpose
Align social strategy with **fundraising**, not vanity metrics: estimate which **planned post characteristics** (platform, format, topic, CTA, caption signals like donate links and urgency/story language, schedule, boost plan) are associated with **organization-attributed donation outcomes** (`donation_referrals` / `estimated_donation_value_php`). **Likes and reach are excluded from prediction** and used only in a dedicated **“vanity vs donation”** comparison.

### What the model does (predictive)
- **Classification:** probability of **any attributed donation traction**; **regression** on **log scale** for rough **PHP ranking** of expected lift.
- **Random forest** for performance, **logistic regression** for interpretable drivers; **dummy baseline** to prove lift over chance.
- **Stratified splits**, **pipeline imputation/scaling**, and **threshold tables** for operational tradeoffs.
- Batch scoring writes **`predicted_donation_value_php`** (and often **`p_high_conversion`**) per post for downstream tools; see `prediction_columns_handoff.md`.

### What we explain (not causal)
- Coefficients and importances support **creative briefs** (e.g. donate links, fundraising post types, CTAs)—with honesty about **platform mix**, **boost spend**, and **campaign confounding**.

### Why it matters to the organization
- Reduces **random posting**; helps **fundraising and comms** agree on **what to test** (formats, CTAs, timing) tied to **mission revenue**, not only engagement.
- **Internal use only**; ethics around **urgency** and **storytelling** stay explicit.

### In the admin application
- **Dashboard:** summarizes **mean predicted donation** over the **top N** posts by predicted value (latest batch), plus how many of those posts show **high conversion probability**—aligned with OKR-style “impact from social content.”
- **Reports & OKRs:** objective-level **target vs actual** uses the **same latest batch** metrics as the dashboard (leadership-configured baselines/targets in software).
- **Post Draft Scorer (reports):** does **not** re-run the Python `joblib` model in the browser. It starts from **blended** `predicted_donation_value_php` for scored posts **similar** to the draft (platform, post type, word count, CTA, resident story), then applies a **strong log-scale adjustment** so **every** control (including **urgency language**) visibly moves the estimate and the **0–100 potential** score. The UI then applies the **same PHP→~USD** display conversion as the dashboard. If post metadata is missing for blending, the UI starts from the **batch mean** and says so.

### Presentation line
*“We score draft posts by traits we can choose before publish—channel, ask, story cues, timing—against which historical posts actually showed attributed gifts, so marketing invests in content patterns tied to donations, not just likes.”*

---

## Cross-cutting themes (useful for shareholders)

1. **Decision support, not automation** — Every pipeline is built to **inform** staff workflows; none replaces ethics, law, or professional judgment.
2. **Honest evaluation** — Grouped or stratified validation, **leakage-aware preprocessing**, and **baseline comparisons** are standard so we do not over-promise accuracy.
3. **Prediction vs explanation** — Tree models and tuned scores support **operations**; linear/logistic views support **transparency and training**; **causal claims** are deliberately limited.
4. **Deployment path** — Notebooks produce **artifacts** (e.g. `.joblib`); batch jobs or seed flows write predictions to **PostgreSQL**; the **ASP.NET Core** API exposes them to the **React** admin app with **`model_version`** and **`scored_at`** for traceability.
5. **Thresholds in the UI** — “High risk” **counts** on the dashboard use an **agreed probability cutoff** (e.g. 0.66) on the **latest** batch; this is a **workflow sizing** choice, not a universal clinical or legal standard.

---

## Where to go deeper

- **Technical methodology:** `pipeline_guide.md`
- **Column / schema handoff:** `prediction_columns_handoff.md`
- **Per-pipeline detail, charts, and metrics:** open the numbered notebook for each pipeline above.

---

*Last updated: aligns stakeholder narrative with notebook methodology plus current admin UI surfacing (dashboard, reports, OKRs, draft scorer with explicit per-control swings, USD labeling note for donation metrics).*
