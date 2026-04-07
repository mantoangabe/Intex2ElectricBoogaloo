"""Shared helpers for generating INTEX ML pipeline notebooks (nbformat JSON)."""
from __future__ import annotations

import json
import uuid
from pathlib import Path


def cid() -> str:
    return str(uuid.uuid4())[:8]


def cell_md(text: str) -> dict:
    return {"cell_type": "markdown", "metadata": {}, "source": text.splitlines(keepends=True), "id": cid()}


def cell_code(text: str) -> dict:
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": text.splitlines(keepends=True),
        "id": cid(),
    }


def save_nb(path: Path, cells: list) -> None:
    nb = {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.11.0"},
        },
        "cells": cells,
    }
    path.write_text(json.dumps(nb, indent=1), encoding="utf-8")


COMMON_ROOT = '''import json
import warnings
from datetime import timedelta
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns  # noqa: F401 — used in EDA cells across generated notebooks

warnings.filterwarnings("ignore", category=UserWarning)
RANDOM_STATE = 42
plt.style.use("seaborn-v0_8-whitegrid")
sns.set_context("talk", font_scale=0.85)

def find_project_root() -> Path:
    cwd = Path.cwd().resolve()
    for p in [cwd, *cwd.parents]:
        if (p / "lighthouse_csv_v7").is_dir():
            return p
    raise FileNotFoundError(
        "Could not find lighthouse_csv_v7. Open or run from the INTEX II EDA project folder."
    )

PROJECT_ROOT = find_project_root()
DATA_DIR = PROJECT_ROOT / "lighthouse_csv_v7"
OUTPUT_DIR = PROJECT_ROOT / "ml_pipelines" / "artifacts"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
print("PROJECT_ROOT:", PROJECT_ROOT.resolve())
'''


def executive_summary(
    pipeline_num: int,
    pipeline_title: str,
    one_liner: str,
    bullets: list[str],
    tier_note: str | None = None,
) -> str:
    tier = ""
    if tier_note:
        tier = f"\n### Pipeline strength tier\n{tier_note}\n"
    blist = "\n".join(f"- {b}" for b in bullets)
    return f"""# Pipeline {pipeline_num}: {pipeline_title}

**Organization:** River of Life / Lighthouse Sanctuary (INTEX)  
**Methodology:** CRISP-DM–aligned (see `pipeline_guide.md` in this folder)

---

## Executive Summary

{one_liner}

**What this notebook delivers**
{blist}
{tier}
*Non-technical readers:* skim the Executive Summary, **Business Interpretation**, **Key Findings**, and **Recommended Actions**, then use charts in Sections 3–5 for discussion with data staff.

---
"""


def section_problem_framing(
    business_problem: str,
    stakeholders_md: str,
    why_matters: str,
    predictive_goal: str,
    explanatory_goal: str,
    why_different: str,
    decision: str,
    limitation: str,
) -> str:
    return f"""## 1. Problem Framing

### Business problem
{business_problem}

### Stakeholders
{stakeholders_md}

### Why this matters
{why_matters}

### Predictive goal (what we forecast or score)
{predictive_goal}

### Explanatory goal (what we want to understand)
{explanatory_goal}

### Why predictive and explanatory are different
{why_different}

### Decision this work supports
{decision}

### Limitations (preview)
{limitation}

---
"""


def section_leakage(
    target_definition: str,
    at_prediction_time: str,
    no_future_data: str,
    split_validity: str,
    checks_code_note: str,
) -> str:
    return f"""## Data Validity & Leakage Check

### How the target is defined
{target_definition}

### What information is allowed at prediction time
{at_prediction_time}

### Why future information does not leak into features
{no_future_data}

### Why the train/test approach is valid
{split_validity}

### Automated checks in this notebook
{checks_code_note}

---
"""


def section_data_acq_prep(intro: str) -> str:
    return f"""## 2. Data Acquisition & Preparation

{intro}

---
"""


def section_eda() -> str:
    return """## 3. Exploration (EDA)

We visualize distributions and relationships **relevant to the business question**, not generic plots. Narrative interpretation follows each chart in markdown where noted.

---
"""


def section_modeling_intro(
    features_rationale: str,
    baseline_name: str,
    interpretable_name: str,
    performance_name: str,
) -> str:
    return f"""## 4. Modeling & Feature Selection

### Feature rationale (why these inputs)
{features_rationale}

### Three-model strategy
1. **Baseline — {baseline_name}:** trivial rule so we never mistake “model” for “signal.”
2. **Interpretable — {interpretable_name}:** coefficients or clear structure for **explanation** and stakeholder trust.
3. **Performance — {performance_name}:** stronger fit for **batch scoring**; may sacrifice some interpretability.

### Feature selection
We keep the feature set **parsimonious** and justified; where helpful, regularization (Ridge / L1) or tree-based implicit selection reduces noise. Final model choice is documented in Section 5 with **tradeoffs**.

---
"""


def section_evaluation() -> str:
    return """## 5. Evaluation & Interpretation

### Metrics
We report metrics appropriate to the task (regression: MAE, RMSE, R²; classification: accuracy, precision, recall, F1, ROC-AUC where applicable). **Grouped or held-out units** (donor, resident, safehouse) avoid optimistic scores when the same entity appears many times.

### What to look for
- **Lift over baseline:** if the interpretable and performance models barely beat the baseline, treat outputs as **weak decision support** until more data arrives.
- **Stability:** cross-validation spread indicates whether the model generalizes or chases noise.

---
"""


def section_business_interpretation(
    plain_english: str,
    reliability: str,
    do_differently: str,
    decision_support: str,
    false_positives: str,
    false_negatives: str,
) -> str:
    return f"""## Business Interpretation

### What this means in plain English
{plain_english}

### How reliable is this for real decisions?
{reliability}

### What should the organization do differently?
{do_differently}

### What decision does this directly support?
{decision_support}

### When the model is wrong
- **False positives (predicted high risk / high amount / etc., but reality was “fine”):**  
  {false_positives}
- **False negatives (model said “low concern” but something important happened):**  
  {false_negatives}

---
"""


def section_causal(
    discovered: str,
    not_causal: str,
    honest_limits: str,
) -> str:
    return f"""## 6. Causal & Relationship Analysis

### What relationships showed up in the data
{discovered}

### Why these are not proven causal
{not_causal}

### Honest limitations
{honest_limits}

---
"""


def section_key_findings(bullets: list[str]) -> str:
    bl = "\n".join(f"- {b}" for b in bullets)
    return f"""## Key Findings

{bl}

---
"""


def section_recommended_actions(bullets: list[str]) -> str:
    bl = "\n".join(f"- {b}" for b in bullets)
    return f"""## Recommended Actions

{bl}

---
"""


def section_deployment_full(
    trigger: str,
    net_surface: str,
    users: str,
    table_sql: str,
    upsert_sql: str,
    python_note: str,
) -> str:
    return f"""## 7. Deployment Plan

### What triggers scoring
{trigger}

### Where results appear in the .NET application
{net_surface}

### Who uses the output and how
{users}

### PostgreSQL table schema

```sql
{table_sql}
```

### Example upsert (batch job after training/scoring)

```sql
{upsert_sql}
```

### Python → PostgreSQL → .NET data flow
1. Scheduled **batch job** (e.g., nightly Airflow / Azure Function / Windows Task Scheduler) runs this notebook’s scoring script or a `joblib` loader.
2. Script reads the latest warehouse export or DB replica, builds features **as of `run_date`**, computes predictions.
3. Results are **UPSERTed** into the table below (idempotent per natural key).
4. The **.NET** admin API reads via EF Core or Dapper; UI shows sortable lists, filters, and **no raw model internals** to end users unless “explain” panel is explicitly designed.

{python_note}

---
"""
