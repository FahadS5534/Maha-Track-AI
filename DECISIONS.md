# Maha-Track AI — Architectural & Design Decision Log (Nashik Kumbh Mela 2027)

This log records key technical decisions, rationale, and trade-offs made during the development of Maha-Track AI for Nashik Simhastha Kumbh Mela 2027.

---

## [2026-09-13] Decision 1: Rule-Based Priority Scoring Formula
**Decided**: Use a deterministic rule-based scoring formula ($0 - 100$) combining category severity, pending duration, and local zone clustering density.
- **Formula**: $\text{Score} = \min(100, \text{SeverityWeight} + \text{PendingHoursFactor} + \text{ZoneClusterFactor})$
- **Why**: Machine learning for priority scoring was rejected. There is insufficient historical priority ground-truth data from large event sanitation teams. A transparent, auditable formula is more defensible to judges and event administrators than an uncalibrated black-box priority model.
- **Alternatives considered**: Trained regression model (rejected — no real labeled priority training dataset).

---

## [2026-09-13] Decision 2: Classifier Architecture & Hinglish/Marathi Labeled Dataset
**Decided**: Implement `scikit-learn` `TfidfVectorizer` paired with `LogisticRegression` trained on a curated synthetic dataset of Hinglish & English complaints across 5 core sanitation categories centered on Nashik and Trimbakeshwar sectors.
- **Categories**:
  1. `toilet_overflow` -> Sanitation Dept
  2. `no_water` -> Water Supply Dept
  3. `blocked_drain` -> Drainage & Sewage Dept
  4. `waste_bin_full` -> Solid Waste Management
  5. `broken_handwashing` -> Public Health Dept
- **Why**: Real public complaints during events like Nashik Simhastha Kumbh Mela are typed in conversational mixed Hindi-English (Hinglish, e.g. *"Ramkund Panchavati mein paani nahi aa raha hai"*). Heavy deep learning models (e.g. BERT/LLMs) require GPUs and high latency. TF-IDF + Logistic Regression executes in $<5\text{ms}$ with high interpretability and zero GPU dependency.
- **Validation**: Evaluated on an 80/20 held-out test split with exact accuracy and macro F1 score logged transparently.

---

## [2026-09-13] Decision 3: Synthetic Data Flagging & Honest Public Transparency
**Decided**: Include `is_synthetic` as a first-class boolean database column on `complaints` and `workers` tables, defaulting to `true` for demo seed data.
- **Why**: Passing off seed data as "live government feed data" is dishonest. By flagging synthetic data directly in the database schema, the public dashboard can display *"100% Demo Data Mode — Nashik Simhastha 2027 Motivation Context"* with full credibility.

---

## [2026-09-13] Decision 4: Aesthetic & Theme Specification (No Blue, No Gradients)
**Decided**: Warm light aesthetic palette (`Warm Soft Linen #FAF9F5`, `Slate Charcoal #1F2923`, `Terracotta Red #C85A32`, `Forest Emerald #2D6A4F`, `Warm Amber #D97706`).
- **Why**: Standard tech demos overuse generic blue gradients and dark mode glassmorphism. A warm, earth-toned civic theme provides a realistic, professional, and accessible government interface suitable for field and administrative deployment.

---

## [2026-09-13] Decision 5: Duplicate Complaint Detection & Priority Escalation
**Decided**: Check for open duplicate complaints in the same zone & category when a citizen submits a report.
- **Why**: If multiple citizens report an overflowing toilet at Ramkund Ghat, creating 10 duplicate tickets clutters the queue. Merging reports into an existing open ticket and boosting its priority score (+15 points per duplicate report) ensures faster dispatch action without queue bloat.
