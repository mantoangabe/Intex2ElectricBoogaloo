# Prediction Columns Handoff (Pipelines 1, 2, 7, 10)

This document defines the minimum prediction-column additions for the four priority predictive pipelines, plus an expanded schema recommendation for future-proofing.

## Quick Version: One New Prediction Column Per Pipeline

If the database change needs to stay minimal, add one core model-output column for each pipeline:

- Pipeline 1 (Donor Retention / Lapse Risk): `lapse_risk_probability`
- Pipeline 2 (Resident Progress / Intervention Priority): `low_progress_risk_probability`
- Pipeline 7 (Incident Risk Prediction): `incident_risk_probability`
- Pipeline 10 (Social -> Donation Impact): `predicted_donation_value_php`

## What Each Column Means

### Pipeline 1: `lapse_risk_probability`

- Type: numeric/double precision (0.0 to 1.0)
- Meaning: Predicted probability that a donor will lapse within the configured horizon (for example, 90 days).
- Use in app/admin: Sort donors by highest lapse risk to prioritize retention outreach.

### Pipeline 2: `low_progress_risk_probability`

- Type: numeric/double precision (0.0 to 1.0)
- Meaning: Predicted probability that a resident shows low progress or regression in the next monitoring window.
- Use in app/admin: Prioritize intervention review and case staffing for highest-risk residents.

### Pipeline 7: `incident_risk_probability`

- Type: numeric/double precision (0.0 to 1.0)
- Meaning: Predicted probability of at least one incident during the next horizon window (commonly 60 days).
- Use in app/admin: Support safety huddles and case triage workflows.

### Pipeline 10: `predicted_donation_value_php`

- Type: numeric/double precision (currency value in PHP)
- Meaning: Predicted expected donation value linked to a given post.
- Use in app/admin: Rank draft/scheduled posts by expected donation impact for content and budget prioritization.

## How They Fit Into the System

- These are model outputs, not source-of-truth transactional fields.
- Values should be refreshed by batch scoring jobs (nightly/weekly depending on pipeline).
- UI should treat these as decision-support signals, not deterministic truth.
- Store with a scoring date and model version whenever possible for traceability.

## Expanded Use (Recommended Full Prediction Schema)

If Gabe wants to implement a fuller and more maintainable schema now, include these standard companion columns in each pipeline prediction table.

### Shared Companion Columns

- Entity key (for example `supporter_id`, `resident_id`, `post_id`)
- `as_of_date` or `scored_for_date`
- `horizon_days` (where applicable)
- Prediction output column (one of the 4 columns above)
- `risk_band` or category band (where applicable)
- `model_version`
- `top_drivers` or `drivers_json` (jsonb)
- `scored_at` timestamp

### Pipeline-Specific Expanded Suggestions

- Pipeline 1 (Donor Retention):
  - Core: `lapse_risk_probability`
  - Common adds: `risk_band`, `model_version`, `top_drivers`, `scored_at`
- Pipeline 2 (Resident Progress):
  - Core: `low_progress_risk_probability`
  - Common adds: `priority_score` and/or `priority_band`, `model_version`, `top_drivers`, `scored_at`
- Pipeline 7 (Incident Risk):
  - Core: `incident_risk_probability`
  - Common adds: `risk_band`, `model_version`, `drivers_json`, `scored_at`
- Pipeline 10 (Social Donation Impact):
  - Core: `predicted_donation_value_php`
  - Common adds: `p_high_conversion`, `model_version`, `top_drivers`, `scored_at`

## Suggested Naming Consistency

To keep API and UI integration simple:

- Use `*_probability` for risk-style predictions.
- Use `predicted_*` for numeric forecast values.
- Use `model_version` and `scored_at` in every prediction table.
- Prefer `jsonb` for driver/explanation payloads.

## Hand-off Note for Database Work

Minimum viable change is one new prediction column per pipeline.  
Best-practice change is one prediction column plus audit/traceability fields (`model_version`, `scored_at`) and optional explanation payload (`top_drivers`/`drivers_json`).