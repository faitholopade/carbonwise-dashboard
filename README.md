# 🌿 CarbonWise AI — Measure → Optimize → Prove Sustainable AI - INTERNATIONAL HAICKATHON Submission: https://www.global-haickathon.com/

**CarbonWise AI** is a  Python tracker + React dashboard that helps teams **measure** the carbon footprint of AI workloads, **optimize** with smart toggles, and **prove** reductions with side-by-side charts and a one-click PDF report. It includes a **Region Advisor** powered by **ASDI** data to suggest greener cloud regions.

---

## ✨ Why this matters
AI energy use is growing rapidly. Most teams lack *transparent, actionable* feedback to reduce emissions without sacrificing quality. CarbonWise makes sustainability a **first-class engineering metric**.

---

## 📦 What’s inside

### 🧠 Backend (Python)
- `/backend/tracker.py` — `@track` decorator that logs `energy_kwh`, `co2e_kg`, `latency_ms`, `SCI`
- `/backend/examples_baseline.py` / `/backend/examples_optimized.py` — generate demo logs
- `/backend/sample_run_log.jsonl` — ready-made demo data

### 💻 Frontend (React - Lovable)
- **Upload**: load JSONL/CSV logs
- **Compare**: baseline vs optimized charts (kWh, CO₂e, latency) + SCI
- **Region Advisor**: upload or use default `public/region_factors.json` (ASDI-derived)
- **Report**: export printable HTML → PDF
- **Expectations**: judging expectations markdown

---

## 🚀 Quickstart

### 1) Run the Dashboard
```bash
npm install
npm run dev
# open the local URL shown in the terminal
```

### 2) Use the sample data (fastest)
In the app → **Upload** → select `backend/sample_run_log.jsonl`  
Then open **Compare**, **Region Advisor**, and **Report**.

### 3) Generate fresh logs
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python examples_baseline.py
python examples_optimized.py
# this creates backend/run_log.jsonl
```
Back in the app → **Upload** → select `backend/run_log.jsonl`.

---

## 🧮 SCI & Data Contract

**SCI** (Software Carbon Intensity):  
`SCI (Wh/request) = (energy_kwh * 1000) / max(requests, 1)`

Each line in `run_log.jsonl`:
```json
{
  "run_id": "uuid",
  "run_name": "baseline",
  "ts": "2025-11-08T16:25:12Z",
  "energy_kwh": 0.92,
  "co2e_kg": 0.42,
  "latency_ms": 980.0,
  "requests": 1,
  "sci_wh_per_req": 920.0,
  "meta": {
    "precision": "fp16",
    "spec_decode": false,
    "quant": null,
    "region": "eu-west-1"
  }
}
```

---

## 🌍 ASDI (Amazon Sustainability Data Initiative)

The **Region Advisor** uses `public/region_factors.json` (ASDI-derived) to sort regions by **gCO₂/kWh** and show greener alternatives.  
You can upload your own dataset for your cloud/provider.

---

## 🧪 Demo checklist

1. **Generate** baseline & optimized logs (or use sample).  
2. **Upload** in the dashboard.  
3. **Compare** → show % drop in kWh/CO₂e and SCI improvement.  
4. **Region Advisor** → select current region, view top 3 greener options.  
5. **Report** → click **Export PDF** → attach to submission.

---

## 🧭 Expectations (for kickoff)

- **Problem**: Teams lack actionable, standardized feedback to reduce AI workload emissions.  
- **Solution**: SDK + dashboard that measures energy/CO₂e (CodeCarbon), computes SCI, and recommends optimizations with an ASDI-powered Region Advisor.  
- **Scope**: Python tracker; React dashboard with Compare/SCI/Advisor/Report; sample data; public repo.  
- **Success**: ≥30% kWh/CO₂e reduction on demo; <10 lines to instrument; 90-sec video + PDF report.
