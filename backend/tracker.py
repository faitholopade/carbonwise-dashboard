from __future__ import annotations
import json, os, time, uuid, logging, platform, shutil
from datetime import datetime
from typing import Any, Dict, Callable, Optional
from codecarbon import EmissionsTracker

SCHEMA_VERSION = "1.1.0"
LOG_PATH = os.environ.get("CARBONWISE_LOG", "run_log.jsonl")

# €/kWh for impact/cost calc
KWH_COST = float(os.environ.get("CARBONWISE_KWH_EUR", "0.25"))  # €0.25/kWh default

REGION_G_INTENSITY = {
    # AWS
    "eu-west-1": 275,      # Ireland
    "eu-west-2": 270,      # London
    "eu-central-1": 420,   # Frankfurt
    # GCP
    "europe-west9": 80,    # Paris (very clean mix)
    "europe-west4": 230,   # Netherlands
    # Azure-ish
    "northeurope": 275,    # Ireland
    "westeurope": 230,     # Netherlands
}
COUNTRY_G_INTENSITY = {
    "IE": 275,
    "GB": 270,
    "UK": 270,
    "FR": 80,
    "NL": 230,
    "DE": 420,
}

def _get_energy_kwh_safe(tracker: EmissionsTracker) -> float:
    """Try multiple places CodeCarbon may store energy (kWh)."""
    try:
        data = getattr(tracker, "final_emissions_data", None)
        if data is not None and hasattr(data, "energy_consumed") and data.energy_consumed is not None:
            return float(data.energy_consumed)
    except Exception:
        pass
    try:
        total_energy = getattr(tracker, "_total_energy", None)
        if total_energy is not None and hasattr(total_energy, "kWh"):
            return float(total_energy.kWh)
    except Exception:
        pass
    try:
        em = getattr(tracker, "_emissions_data", None)
        if isinstance(em, dict):
            val = em.get("energy_consumed")
            if val is not None:
                return float(val)
    except Exception:
        pass
    return 0.0

def _infer_gco2_per_kwh(meta: Dict[str, Any], country_iso: Optional[str]) -> float:
    """Pick a grid intensity (gCO2/kWh) from meta.region or country ISO; default 300."""
    region = None
    m = meta or {}
    if isinstance(m, dict):
        region = m.get("region") or m.get("cloud_region") or m.get("provider_region")
        if isinstance(region, str):
            region = region.lower()
    if region and region in REGION_G_INTENSITY:
        return float(REGION_G_INTENSITY[region])
    c = (country_iso or os.getenv("CODECARBON_COUNTRY_ISO_CODE") or "").upper()
    if c in COUNTRY_G_INTENSITY:
        return float(COUNTRY_G_INTENSITY[c])
    return 300.0  # conservative default

def _env_meta() -> Dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "cpu": platform.processor(),
        "codecarbon_version": _pkg_ver("codecarbon"),
        "cwd": os.getcwd(),
    }

def _pkg_ver(name: str) -> str:
    try:
        import importlib.metadata as im
        return im.version(name)
    except Exception:
        return "unknown"

def track(
    run_name: str = "run",
    requests: int = 1,
    meta: Optional[Dict[str, Any]] = None,
    *,
    country_iso: Optional[str] = None,   # e.g., "IE", "FR"
    measure_secs: float = 1.0,           # power sampling period
    quiet: bool = True,                  # suppress CodeCarbon logs
    carbon_budget_wh: Optional[float] = None,  # e.g., 800.0 Wh budget for the run
) -> Callable:
    """
    Decorator to measure energy/CO2 and log JSONL.
    - Falls back to energy-from-CO2 if raw energy is unavailable.
    - Adds SCI, cost, budget flags, and environment metadata.
    """
    if quiet:
        logging.getLogger("codecarbon").setLevel(logging.ERROR)

    meta = dict(meta or {})
    meta.setdefault("notes", "CarbonWise tracker")

    def deco(fn: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            rid = str(uuid.uuid4())

            # Respect env var if set; otherwise allow explicit country hint
            if country_iso and not os.getenv("CODECARBON_COUNTRY_ISO_CODE"):
                os.environ["CODECARBON_COUNTRY_ISO_CODE"] = country_iso

            # Build tracker (works across CodeCarbon versions)
            try:
                tracker = EmissionsTracker(
                    measure_power_secs=measure_secs,
                    country_iso_code=os.getenv("CODECARBON_COUNTRY_ISO_CODE"),
                )
            except TypeError:
                tracker = EmissionsTracker(measure_power_secs=measure_secs)

            tracker.start()
            t0 = time.time()
            result = fn(*args, **kwargs)
            latency_ms = (time.time() - t0) * 1000.0

            # stop() returns CO2e in kg
            try:
                co2e_kg = float(tracker.stop() or 0.0)
            except Exception:
                co2e_kg = 0.0

            # Try to read energy; if zero/missing, infer from CO2 using grid intensity.
            energy_kwh = _get_energy_kwh_safe(tracker)
            gco2_per_kwh_used = None
            if (energy_kwh is None) or (energy_kwh <= 0.0):
                gco2_per_kwh_used = _infer_gco2_per_kwh(meta, country_iso)
                # energy_kwh = (kg * 1000 g/kg) / (g/kWh)
                if gco2_per_kwh_used > 0:
                    energy_kwh = (co2e_kg * 1000.0) / gco2_per_kwh_used
                else:
                    energy_kwh = 0.0

            energy_wh = energy_kwh * 1000.0
            co2e_g = co2e_kg * 1000.0
            fu = max(1, int(requests))
            sci_wh_per_req = energy_wh / fu
            cost_eur = energy_kwh * KWH_COST

            budget_exceeded = False
            budget_wh = None
            if carbon_budget_wh is not None:
                budget_wh = float(carbon_budget_wh)
                budget_exceeded = energy_wh > budget_wh

            rec = {
                "run_id": rid,
                "run_name": run_name,
                "ts": datetime.utcnow().isoformat(timespec="seconds") + "Z",

                # Raw units
                "energy_kwh": round(energy_kwh, 9),
                "co2e_kg": round(co2e_kg, 9),

                # Display units
                "energy_wh": round(energy_wh, 3),
                "co2e_g": round(co2e_g, 3),
                "latency_ms": round(latency_ms, 2),

                # KPI
                "requests": fu,
                "sci_wh_per_req": round(sci_wh_per_req, 3),
                "cost_eur": round(cost_eur, 4),

                # Budget
                "carbon_budget_wh": budget_wh,
                "budget_exceeded": budget_exceeded,

                # Provenance
                "grid_factor_gco2_per_kwh_used": gco2_per_kwh_used,
                "meta": {**meta, **_env_meta()},
            }

            with open(LOG_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(rec) + "\n")

            return result
        return wrapper
    return deco
