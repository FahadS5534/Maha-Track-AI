# Maha-Track AI — Civic Sanitation Response & Transparency System

[![Docker Supported](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](#-docker-deployment)
[![Python FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](#-technology-stack)
[![React + Tailwind](https://img.shields.io/badge/Frontend-React%20%7C%20TailwindCSS-61DAFB?logo=react&logoColor=white)](#-technology-stack)
[![ML Accuracy](https://img.shields.io/badge/ML%20Accuracy-96.67%25-2D6A4F)](#-hinglish-ml-classifier)

---

## 📌 Project Overview

**Maha-Track AI** is a civic sanitation complaint reporting, dispatch management, and public transparency system designed for high-density public events (framed around **Mahakumbh 2026**).

### 🎯 Motivation Context
During Mahakumbh 2025, the **National Green Tribunal (NGT)** documented severe public complaints regarding inadequate toilet facilities, water shortages, and waste accumulation along the Ganga banks. **Maha-Track AI** bridges the gap between field citizens and government event administrators with an end-to-end operational loop:

$$\text{Citizens Report} \longrightarrow \text{Government Acts} \longrightarrow \text{Performance is Measurable}$$

---

## 📱 Three Integrated Views

### 1. 📲 Citizen / Volunteer Reporting App
- **Target**: Submit a sanitation issue in under **30 seconds**.
- **Features**:
  - Accepts free-form complaint text typed in **Hinglish** (mixed Hindi-English, e.g., *"Sector 12 mein toilet overflow ho raha hai"*), Hindi, or English.
  - **Real-Time ML Auto-Classification**: Automatically detects category & department as the user types.
  - **Sector/Zone GPS Pin**: Dropdown and coordinate simulator across 16 Prayagraj Mahakumbh sectors.
  - **Photo Evidence Simulator**: Optional photo upload.
  - **Instant Ticket Confirmation**: Generates unique Complaint ID, assigned department, and priority score.

### 2. 🛡️ Government Staff Queue Dashboard
- **Target**: Operational dispatch queue sorted by dynamic priority score ($0 - 100$).
- **Features**:
  - Filter queue by status (`reported`, `assigned`, `in_progress`, `resolved`), sector/zone, and minimum priority score.
  - **Interactive Leaflet Map**: Displays incident pins color-coded by priority score (Crimson = High, Amber = Medium, Emerald = Resolved/Standard).
  - **Worker Assignment Modal**: Assign sanitation field personnel to pending complaints.
  - **Lifecycle Actions**: Transition state from `assigned` $\rightarrow$ `in_progress` $\rightarrow$ `resolved`.
  - **Event Audit Timeline**: Immutable record of all state transitions (`complaint_events`).

### 3. 📊 Public Transparency Dashboard
- **Target**: Public aggregate performance analytics without exposing personal data.
- **Features**:
  - **Mean Time To Resolution (MTTR)**: Interactive Recharts visualizations breaking down average resolution hours by department and zone.
  - **Sanitation Category Distribution**: Visual pie chart of issue types.
  - **Data Privacy Guarantee**: **Zero individual complainant text or personal details exposed**.
  - **Synthetic Data Lineage Badge**: Honest disclosure indicator displaying `is_synthetic = true` demo data percentage.

---

## 🧠 Hinglish ML Classifier

Instead of heavy black-box LLMs that require high latency and GPUs, **Maha-Track AI** uses a fast, explainable `scikit-learn` `TfidfVectorizer` + `LogisticRegression` pipeline trained on realistic Hinglish complaints across 5 categories:

| Category | Assigned Department | Example Hinglish Complaint |
|---|---|---|
| `toilet_overflow` | Sanitation Dept | *"Sector 12 mein toilet bahut kharab hai overflow ho raha hai"* |
| `no_water` | Water Supply Dept | *"Sector 5 tap water is completely stopped no water coming"* |
| `blocked_drain` | Drainage & Sewage Dept | *"Nala jam ho gaya ganda paani raste par bah raha hai"* |
| `waste_bin_full` | Solid Waste Management | *"Kachre ka dibba bhar gaya hai waste sadak pe pada hai"* |
| `broken_handwashing` | Public Health Dept | *"Sabun aur handwash basin tut gaya hai tap broken Sector 1"* |

### 📈 Evaluated Performance Metrics (80/20 Held-Out Test Split)
- **Exact Classification Accuracy**: **96.67%**
- **Macro F1 Score**: **96.64%**
- **Inference Latency**: $< 5\text{ms}$ (CPU only)

---

## ⚖️ Transparent Priority Scoring Formula

Priority is computed deterministically ($0 - 100$) using a weighted rule-based formula rather than an uncalibrated regression model:

$$\text{Priority Score} = \min\left(100,\, \text{SeverityWeight} + \text{PendingHoursFactor} + \text{ZoneClusterFactor}\right)$$

1. **Category Severity Weight** (Max 40 pts):
   - `toilet_overflow`: 40 | `no_water`: 35 | `blocked_drain`: 30 | `broken_handwashing`: 25 | `waste_bin_full`: 20
2. **Pending Time Factor** (Max 30 pts): $2.5 \times \text{Hours Elapsed}$
3. **Zone Cluster Density Factor** (Max 30 pts): $4.0 \times \text{Open Complaints in Same Zone}$

---

## 🎨 Visual Design System (Light & Aesthetic)

- **Palette**: Warm Soft Linen (`#FAF9F5`), Slate Charcoal (`#1F2923`), Terracotta Red (`#C85A32`), Forest Emerald (`#2D6A4F`), Warm Amber (`#D97706`).
- **Design Constraints**:
  - **No Blue Palette**: Zero blue primary/secondary tones.
  - **No Tacky Gradients**: Ultra-clean cards, crisp borders (`#E7E5E4`), and Google Fonts (*Plus Jakarta Sans* & *Inter*).

---

## 🐳 Docker Deployment

You can containerize and run the complete application (Frontend + Backend + Database + Seed Data) using **Docker Compose**:

### 1. Build and Run Containers
```bash
docker compose up --build
```

### 2. Access Containerized Applications
- **Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API & Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Stop Containers
```bash
docker compose down -v
```

---

## 💻 Manual Local Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup (FastAPI)
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Architectural Decision Log (`DECISIONS.md`)

Key technical decisions and trade-offs are logged in [`DECISIONS.md`](DECISIONS.md) and viewable directly in the web app via the top navbar button.

---

## 🌐 API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/complaints` | Public | Submit citizen sanitation report (< 30s) |
| `GET` | `/complaints` | Staff | Fetch prioritized operational queue |
| `GET` | `/complaints/{id}` | Public | Detailed view with audit event timeline |
| `PATCH` | `/complaints/{id}/assign` | Staff | Assign worker to complaint |
| `PATCH` | `/complaints/{id}/status` | Staff | Update status (`assigned`, `in_progress`, `resolved`) |
| `GET` | `/stats/response-times` | Public | Aggregate resolution time by zone/dept |
| `GET` | `/stats/summary` | Public | Resolution counts, synthetic ratio & classifier metrics |
| `POST` | `/classify` | Internal | Predict category, department & confidence from text |

---

## 📄 License
Released under the MIT License. Developed for Mahakumbh Civic Sanitation Response.
