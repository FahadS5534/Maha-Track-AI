# Maha-Track AI — Civic Sanitation Response & Transparency System (Nashik Kumbh Mela 2027)

[![Docker Supported](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](#-docker-deployment)
[![Python FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](#-technology-stack)
[![React + Tailwind](https://img.shields.io/badge/Frontend-React%20%7C%20TailwindCSS-61DAFB?logo=react&logoColor=white)](#-technology-stack)
[![ML Accuracy](https://img.shields.io/badge/ML%20Accuracy-96.67%25-2D6A4F)](#-hinglish-ml-classifier)

---

## 📌 Project Overview

**Maha-Track AI** is a civic sanitation complaint reporting, dispatch management, and public transparency system designed for high-density public events, centered on **Nashik Simhastha Kumbh Mela 2027** across Nashik and Trimbakeshwar.

### 🎯 Motivation Context
During large congregation events along sacred river banks (such as Godavari River in Nashik), inadequate toilet facilities, water shortages, and waste accumulation create critical public health challenges. **Maha-Track AI** bridges the gap between field citizens and government event administrators with an end-to-end operational loop:

$$\text{Citizens Report} \longrightarrow \text{Government Acts} \longrightarrow \text{Performance is Measurable}$$

---

## 📱 Three Integrated Views & Portals

### 1. 🏁 Portal Selection Landing Page
- Select between the **Public Citizen Portal** and the **Admin Complaint Management System**.

### 2. 📲 Citizen / Volunteer Reporting App
- **Target**: Submit a sanitation issue in under **30 seconds**.
- **Features**:
  - Accepts free-form complaint text typed in **Hinglish** (mixed Hindi-English, e.g., *"Ramkund Panchavati mein toilet overflow ho raha hai"*), Marathi, Hindi, or English.
  - **Real-Time ML Auto-Classification**: Automatically detects category & department as the user types.
  - **Sector/Zone GPS Pin**: Dropdown and coordinate simulator across 16 Nashik & Trimbakeshwar sectors.
  - **Duplicate Complaint Detection**: Merges duplicate reports into existing open tickets and automatically escalates their priority score.
  - **Photo Evidence Simulator**: Optional photo upload.

### 3. 🛡️ Admin Complaint Management System
- **Target**: Operational dispatch queue for Nashik Municipal Corporation & control room staff sorted by dynamic priority score ($0 - 100$).
- **Features**:
  - Filter queue by status (`reported`, `assigned`, `in_progress`, `resolved`), sector/zone, and minimum priority score.
  - **Interactive Leaflet Map**: Displays incident pins centered on Ramkund Ghat, Panchavati, and Trimbakeshwar, color-coded by priority score.
  - **Worker Detail Cards Selector**: Interactive card grid showing worker phone, zone match, status, and active task count.
  - **Lifecycle Actions**: Transition state from `assigned` $\rightarrow$ `in_progress` $\rightarrow$ `resolved`.

### 4. 📊 Public Transparency Dashboard
- **Target**: Public aggregate performance analytics without exposing personal data.
- **Features**:
  - **Mean Time To Resolution (MTTR)**: Interactive Recharts visualizations breaking down average resolution hours by department and zone.
  - **Data Privacy Guarantee**: **Zero individual complainant text or personal details exposed**.
  - **Synthetic Data Lineage Badge**: Honest disclosure indicator displaying `is_synthetic = true` demo data percentage.

---

## 🧠 Hinglish ML Classifier

Uses a fast, explainable `scikit-learn` `TfidfVectorizer` + `LogisticRegression` pipeline trained on realistic complaints across 5 categories in Nashik & Trimbakeshwar:

| Category | Assigned Department | Example Hinglish Complaint |
|---|---|---|
| `toilet_overflow` | Sanitation Dept | *"Ramkund Panchavati mein toilet bahut kharab hai overflow ho raha hai"* |
| `no_water` | Water Supply Dept | *"Sector 4 Trimbakeshwar Kushavart Kund tap water stopped no drinking water"* |
| `blocked_drain` | Drainage & Sewage Dept | *"Sector 2 Tapovan Sadhugram side open drain choked with garbage"* |
| `waste_bin_full` | Solid Waste Management | *"Sector 3 Kalaram Temple main dustbin completely full plastic waste everywhere"* |
| `broken_handwashing` | Public Health Dept | *"Sector 5 Panchavati Ghat handwash station tap is broken spraying water"* |

### 📈 Evaluated Performance Metrics (80/20 Held-Out Test Split)
- **Exact Classification Accuracy**: **96.67%**
- **Macro F1 Score**: **96.64%**
- **Inference Latency**: $< 5\text{ms}$ (CPU only)

---

## ⚖️ Transparent Priority Scoring Formula

Priority is computed deterministically ($0 - 100$) using a weighted rule-based formula:

$$\text{Priority Score} = \min\left(100,\, \text{SeverityWeight} + \text{PendingHoursFactor} + \text{ZoneClusterFactor}\right)$$

1. **Category Severity Weight** (Max 40 pts): `toilet_overflow` (40), `no_water` (35), `blocked_drain` (30), `broken_handwashing` (25), `waste_bin_full` (20).
2. **Pending Time Factor** (Max 30 pts): $2.5 \times \text{Hours Elapsed}$
3. **Zone Cluster Density & Duplicate Factor** (Max 30 pts): $4.0 \times \text{Open Complaints} + 15 \times \text{Duplicate Reports}$

---

## 🐳 Docker Deployment

Run the complete application (Frontend + Backend + Database + Seed Data) using **Docker Compose**:

```bash
docker compose up --build
```

- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 Manual Local Setup

```powershell
# Backend (FastAPI)
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# Frontend (React + Vite)
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Architectural Decision Log (`DECISIONS.md`)

Key technical decisions and trade-offs are logged in [`DECISIONS.md`](DECISIONS.md) and viewable directly in the web app via the top navbar button.

---

## 📄 License
Released under the MIT License. Developed for Nashik Simhastha Kumbh Mela 2027 Civic Sanitation Response.
