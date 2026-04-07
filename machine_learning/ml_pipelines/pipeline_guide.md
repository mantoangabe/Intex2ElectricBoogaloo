# INTEX Machine Learning Pipeline Specifications

River of Life – Lighthouse Sanctuary  

---

## Overview

This document defines a set of candidate machine learning pipelines for the INTEX project. Each pipeline is designed to address a meaningful business problem within the organization and follows the full end-to-end ML lifecycle:

1. Problem Framing
2. Data Acquisition and Preparation
3. Exploration
4. Modeling (Explanatory + Predictive)
5. Evaluation and Interpretation
6. Deployment

Each pipeline must:

- Clearly define a business problem
- Distinguish between prediction and explanation
- Use appropriate data from the relational dataset
- Produce actionable outputs for the application
- Be deployable via PostgreSQL integration or API

The goal is not to build many pipelines, but to build a few high-quality pipelines that drive real decisions.

---

# Core Pipelines (Recommended)

---

## 1. Donor Retention / Lapse Risk Pipeline

### Business Problem

The organization lacks visibility into donor retention and cannot identify which donors are at risk of lapsing.

### Objective

Predict which donors are likely to stop giving and identify factors that influence donor retention.

### Target Variables

- Binary: donor will lapse within next 90 or 120 days
- Optional: probability of donation within next 90 days

### Data Sources

- supporters
- donations
- donation_allocations
- (optional) social_media_posts

### Feature Engineering

- Recency (days since last donation)
- Frequency (number of donations)
- Monetary value (average donation amount)
- Recurring donation indicator
- Time between donations
- Donation allocation diversity
- Donor tenure

### Modeling

#### Explanatory Model

- Logistic regression
- Identify which features influence retention

#### Predictive Model

- Classification (logistic regression, decision tree, random forest, or boosting)
- Predict lapse risk

### Evaluation

- Accuracy, precision, recall, F1 score
- ROC-AUC
- Emphasis on recall (catching at-risk donors)

### Outputs

- Lapse risk score (0–1)
- Risk category (High, Medium, Low)
- Top contributing features

### Business Value

- Enables targeted donor outreach
- Improves retention and revenue stability

### Deployment

- Store results in `donor_predictions` table
- Surface in admin dashboard for prioritization

---

## 2. Resident Progress / Intervention Priority Pipeline

### Business Problem

Staff lack a clear way to identify which residents need attention or intervention.

### Objective

Predict which residents are at risk of stagnation or regression.

### Target Variables

- Binary: low progress next period
- Optional: decline in composite progress score

### Data Sources

- residents
- education_records
- health_wellbeing_records
- intervention_plans
- incident_reports
- process_recordings
- home_visitations

### Feature Engineering

- Recent progress trends
- Attendance rates
- Health scores (nutrition, sleep, energy)
- Incident frequency and severity
- Intervention plan status
- Counseling session frequency
- Time since last intervention

### Modeling

#### Explanatory Model

- Regression or logistic model
- Identify drivers of progress and regression

#### Predictive Model

- Classification model for next-period risk

### Evaluation

- Accuracy, recall, precision
- Emphasis on recall (catching at-risk residents)

### Outputs

- Risk score
- Priority ranking
- Key contributing factors

### Business Value

- Prevents residents from falling behind
- Improves resource allocation and intervention planning

### Deployment

- Store results in `resident_predictions`
- Display in admin case management dashboard

---

# Secondary Pipelines

---

## 3. Donation Amount Prediction Pipeline

### Business Problem

The organization does not know how much a donor is likely to give in the future.

### Objective

Predict expected donation amount for each donor.

### Target Variable

- Continuous: next donation amount

### Features

- Past donation amounts
- Donation frequency
- Time since last donation
- Donor type and tenure

### Modeling

- Linear regression
- Tree-based regression (random forest, gradient boosting)

### Evaluation

- RMSE
- MAE
- R-squared

### Outputs

- Predicted donation amount
- Donor value tier

### Business Value

- Prioritizes high-value donors
- Improves fundraising strategy

---

## 4. Donor Lifetime Value (LTV) Pipeline

### Business Problem

The organization lacks a long-term view of donor value.

### Objective

Estimate total future value of each donor.

### Target Variable

- Predicted total future donations

### Features

- Historical donation patterns
- Retention probability
- Donation frequency and amount

### Modeling

- Regression model
- Combined with retention predictions

### Outputs

- LTV score

### Business Value

- Identifies high-value donors
- Supports long-term donor strategy

---

## 5. Donation Timing Prediction Pipeline

### Business Problem

The organization does not know when to reach out to donors.

### Objective

Predict when a donor is likely to give again.

### Target Variable

- Probability of donation within time window (30/60/90 days)

### Features

- Time since last donation
- Historical donation intervals
- Donor engagement patterns

### Modeling

- Classification or time-based modeling

### Outputs

- Next donation probability
- Suggested outreach timing

### Business Value

- Improves timing of donor communication

---

## 6. Safehouse Performance Pipeline

### Business Problem

No standardized way to compare safehouse performance.

### Objective

Evaluate and compare outcomes across safehouses.

### Target Variable

- Composite performance score

### Data Sources

- safehouse_monthly_metrics
- residents
- incident_reports
- intervention_plans

### Features

- Average resident progress
- Incident rates
- Intervention success rates
- Occupancy rates

### Modeling

- Regression or clustering

### Outputs

- Safehouse performance score
- Ranking of safehouses

### Business Value

- Identifies best practices
- Supports operational decisions

---

## 7. Incident Risk Prediction Pipeline

### Business Problem

Incidents are handled reactively rather than proactively.

### Objective

Predict likelihood of incidents occurring.

### Target Variable

- Binary: incident occurrence within next period

### Features

- Past incidents
- Behavioral indicators
- Health and education metrics
- Intervention status

### Modeling

- Classification model

### Outputs

- Incident risk score

### Business Value

- Enables proactive intervention
- Improves safety

---

# Advanced / Optional Pipelines

---

## 8. Intervention Effectiveness Pipeline

### Business Problem

Unclear which interventions are most effective.

### Objective

Determine which interventions lead to improved outcomes.

### Target Variable

- Change in progress metrics

### Modeling

- Explanatory regression

### Outputs

- Effectiveness ranking by intervention type

### Business Value

- Optimizes intervention strategies

---

## 9. Donor Segmentation Pipeline

### Business Problem

Donors are treated uniformly despite different behaviors.

### Objective

Group donors into meaningful segments.

### Modeling

- Clustering (K-means)

### Outputs

- Donor segments

### Business Value

- Enables personalized communication

---

## 10. Social Media Engagement Pipeline

### Business Problem

Unclear which social media content drives engagement or donations.

### Objective

Identify drivers of social content that correlate with downstream donations, not just vanity engagement.

### Target Variable

- Primary: donation_referrals (count per post)
- Primary: estimated_donation_value_php (continuous value per post)
- Secondary: high-conversion flag (e.g., donation_referrals above threshold)
- Supporting diagnostic only: engagement_rate

### Features

- Post type
- Content characteristics
- Timing
- Platform
- CTA type and CTA presence
- Boost indicator and boost budget
- Campaign tag/context
- Caption metadata (length, hashtags, mentions)

### Modeling

- Baseline model(s): DummyRegressor / DummyClassifier
- Interpretable model(s): Ridge (value), Logistic Regression (high-conversion)
- Performance model(s): Random Forest regressor/classifier
- Compare interpretability vs predictive lift and select final deployment model by business objective

### Outputs

- Predicted donation value by post
- Probability of high-conversion post
- Ranked drivers for content strategy decisions
- Confidence/risk notes for decision-makers

### Business Value

- Improves content strategy using donation-linked outcomes
- Improves paid boost allocation toward higher expected donation impact
- Supports weekly editorial and fundraising prioritization

### Data Validity & Leakage Check

- Targets are post-outcome fields and must never be used as model inputs
- Pre-publish scoring should only use fields known before or at scheduling time
- Keep engagement metrics for explanatory analysis, not as strict pre-publish predictive features unless explicitly running a post-publish optimization mode
- Prefer time-based validation (train on earlier posts, test on later posts) for production-readiness

### Deployment Notes (Pipeline 10 specific)

- Trigger: weekly scoring for upcoming post queue; nightly refresh as outcomes land
- PostgreSQL output table: `social_donation_impact_predictions`
- Core columns:
  - post_id
  - scored_for_date
  - p_high_conversion
  - predicted_donation_value_php
  - model_version
  - top_drivers (jsonb)
  - scored_at
- App surface: .NET marketing planner and fundraising dashboard for content and budget prioritization

---

# Deployment Strategy

All pipelines should be deployed using the following approach:

1. Train models in Python
2. Run batch scoring (scheduled or manual)
3. Write predictions to PostgreSQL tables
4. Surface predictions in the web application
5. Capture outcomes for retraining and model monitoring

### Example Tables

- donor_predictions
- resident_predictions
- safehouse_predictions
- donor_ltv_estimates
- donor_timing_predictions
- resident_incident_risk
- donor_segments
- social_donation_impact_predictions

Each table should include:

- entity ID (or post_id for social)
- as_of/scored date
- prediction score/value (probability, risk score, expected amount/value, etc.)
- prediction category/band (when applicable)
- model version
- scored_at timestamp
- top drivers / explanation payload (jsonb preferred for app tooltips)

For Pipeline 10 specifically (`social_donation_impact_predictions`), include:

- post_id
- scored_for_date
- p_high_conversion
- predicted_donation_value_php
- model_version
- top_drivers (jsonb)
- scored_at

---

# Final Guidance

Focus on:

- Clear business problems
- Strong feature engineering
- Interpretable insights
- Real integration into the app

Avoid:

- Building too many pipelines
- Weak or unclear targets
- Models without actionable outputs

A small number of well-executed pipelines will outperform a large number of shallow ones.