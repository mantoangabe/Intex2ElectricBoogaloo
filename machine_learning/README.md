# INTEX II EDA / ML Pipelines Workspace

This workspace contains end-to-end machine learning pipelines for the Lighthouse Sanctuary / River of Life INTEX project.  
The project follows a CRISP-DM-style structure with business framing, data preparation, modeling, interpretation, and deployment planning.

## Repository Structure

- `ml_pipelines/` - Main deliverables and generators
  - `pipeline_guide.md` - Pipeline requirements and standards
  - `donor_retention.ipynb` ... `social_media_engagement.ipynb` - Pipeline notebooks
  - `generate_pipelines_3_10.py` - Generator/orchestrator for pipelines 3-10
  - `generate_pipelines_6_10.py` - Generator for pipelines 6-10
  - `nb_utils.py` - Shared notebook-generation utilities
  - `artifacts/` - Sample output artifacts
- `lighthouse_csv_v7/` - Source CSV dataset (17 relational tables)
- `notebooks/` - Additional exploratory notebooks
- `requirements.txt` - Python dependencies

## Environment Setup

1. Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

1. Install dependencies:

```bash
pip install -r requirements.txt
```

## Data Requirements

- Place dataset tables in `lighthouse_csv_v7/`.
- Generators and notebooks expect this folder to exist at the workspace root.
- The code resolves project root dynamically, so notebooks can be launched from different folders.

## Generate Pipelines

From workspace root:

```bash
python3 ml_pipelines/generate_pipelines_3_10.py
```

This writes/refreshes notebooks in `ml_pipelines/` for pipelines 3-10.

## Execute Notebooks

Run one notebook:

```bash
jupyter nbconvert --to notebook --execute --inplace ml_pipelines/social_media_engagement.ipynb
```

Run multiple notebooks by repeating the command per file as needed.

## Current Modeling Focus Notes

- Pipeline 10 (`social_media_engagement.ipynb`) is oriented toward **donation impact**:
  - primary targets include donation-linked outcomes (not vanity engagement alone)
  - engagement is used as a supporting diagnostic signal
  - deployment outputs are written to a donation-impact prediction table shape

## What To Commit

Commit:

- `ml_pipelines/*.ipynb`
- `ml_pipelines/*.py`
- `ml_pipelines/pipeline_guide.md`
- `requirements.txt`
- `README.md`

Do not commit:

- `.venv/`
- notebook checkpoints / caches
- local model binaries unless explicitly required for handoff

See `.gitignore` for the full ignore policy.