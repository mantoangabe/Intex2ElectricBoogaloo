# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack nonprofit case management system for a trafficking survivor organization (Lighthouse Sanctuary Philippines). Capstone (INTEX) project for BYU.

## Commands

### Frontend (`frontend/`)
```bash
npm install
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # TypeScript compile + production build
npm run lint      # ESLint
```

### Backend (`backend/`)
```bash
dotnet run        # API server (https://localhost:5001 / http://localhost:5012)
dotnet build
dotnet ef migrations add <Name>
dotnet ef database update
```

### Machine Learning (`machine_learning/`)
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 ml_pipelines/generate_pipelines_3_10.py   # Regenerate pipeline notebooks
```

## Architecture

### Stack
- **Frontend:** React 19 + TypeScript + Vite, React Router v7, Axios
- **Backend:** ASP.NET Core Web API (.NET 10), EF Core 10, ASP.NET Identity, PostgreSQL (Npgsql)
- **ML:** Python/scikit-learn/Jupyter, CRISP-DM pipelines

### Backend
- One controller per entity, all at `api/[controller]` following standard CRUD REST
- `IntexDbContext` extends `IdentityDbContext<ApplicationUser>` with 17 domain DbSets
- Cookie/session-based auth (not JWT). `AuthController` handles register/login/logout/`GET /me`/change-password
- Roles seeded on startup: `Admin` and `Donor`. CRUD endpoints require `[Authorize(Roles = "Admin")]`
- CORS currently only configured for `http://localhost:5173` in development mode

### Frontend
- Routes defined flat in `App.tsx`. Pages split into `pages/admin/` and `pages/donor/`; shared UI in `components/`
- `api/apiClient.ts` — single Axios instance; base URL is `http://localhost:5012/api`
- `vite.config.ts` proxies `/api` → `https://localhost:5001` — use the proxy path (`/api/...`) in new code rather than hardcoding the port in `apiClient.ts`
- No frontend route guards exist yet — auth enforcement is backend-only

### ML
- 10 CRISP-DM pipeline notebooks in `ml_pipelines/` (donor retention, segmentation, LTV, incident risk, etc.)
- `ml_pipelines/nb_utils.py` — shared notebook generation utilities; used by `generate_pipelines_3_10.py`
- Pipeline outputs feed a prediction columns handoff table back into the web app

### Data Domain (17 entity tables)
- **Donor/Support:** Safehouses, Partners, PartnerAssignments, Supporters, Donations, InKindDonationItems, DonationAllocations
- **Case Management:** Residents, ProcessRecordings, HomeVisitations, EducationRecords, HealthWellbeingRecords, InterventionPlans, IncidentReports
- **Outreach:** SocialMediaPosts, SafehouseMonthlyMetrics, PublicImpactSnapshots

## Known Issues

- **Port mismatch:** `apiClient.ts` targets port `5012`; `vite.config.ts` proxy targets `5001`. Prefer the Vite proxy (`/api/...`) so the port is irrelevant in frontend code.
- **No frontend route guards:** Admin pages are accessible without auth in the browser — only the backend enforces roles.
- **Credentials in source control:** `appsettings.json` contains the live DB password. Avoid committing further secrets; prefer `dotnet user-secrets` or environment variables for local overrides.
