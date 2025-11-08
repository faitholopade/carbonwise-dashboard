# cw_report.py
# Usage:
#   python cw_report.py run_log.jsonl --out report.md --pdf report.pdf

import json, argparse, statistics, os
from datetime import datetime

def load_jsonl(path):
    rows = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))
    return rows

def group_by_name(rows):
    g = {}
    for r in rows:
        g.setdefault(r["run_name"], []).append(r)
    return g

def mean(vals):
    return statistics.mean(vals) if vals else 0.0

def summarize(rows):
    return {
        "n": len(rows),
        "energy_kwh": mean([r["energy_kwh"] for r in rows]),
        "co2e_kg": mean([r["co2e_kg"] for r in rows]),
        "latency_ms": mean([r["latency_ms"] for r in rows]),
        "sci_wh_per_req": mean([r.get("sci_wh_per_req", 0.0) for r in rows]),
        "cost_eur": mean([r.get("cost_eur", 0.0) for r in rows]),
    }

def md_report(groups, baseline="baseline", optimized="optimized"):
    base = summarize(groups.get(baseline, []))
    opt = summarize(groups.get(optimized, []))
    def pct_drop(a, b):  # from a to b
        return 100.0 * (a - b) / a if a > 0 else 0.0
    ts = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    lines = []
    lines.append(f"# CarbonWise Report")
    lines.append("")
    lines.append(f"_Generated: {ts}_")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append("| Metric | Baseline | Optimized | Δ % |")
    lines.append("|---|---:|---:|---:|")
    lines.append(f"| Energy (kWh) | {base['energy_kwh']:.3f} | {opt['energy_kwh']:.3f} | {pct_drop(base['energy_kwh'], opt['energy_kwh']):.1f}% |")
    lines.append(f"| CO₂e (kg) | {base['co2e_kg']:.3f} | {opt['co2e_kg']:.3f} | {pct_drop(base['co2e_kg'], opt['co2e_kg']):.1f}% |")
    lines.append(f"| Latency (ms) | {base['latency_ms']:.1f} | {opt['latency_ms']:.1f} | {pct_drop(base['latency_ms'], opt['latency_ms']):.1f}% |")
    lines.append(f"| SCI (Wh/req) | {base['sci_wh_per_req']:.1f} | {opt['sci_wh_per_req']:.1f} | {pct_drop(base['sci_wh_per_req'], opt['sci_wh_per_req']):.1f}% |")
    lines.append(f"| Cost (€) | {base['cost_eur']:.4f} | {opt['cost_eur']:.4f} | {pct_drop(base['cost_eur'], opt['cost_eur']):.1f}% |")
    lines.append("")
    lines.append("## Notes")
    lines.append("- Values are means across runs with the same `run_name`.")
    lines.append("- SCI = (Wh per request).")
    lines.append("- Cost uses `CARBONWISE_KWH_EUR` if set (default €0.25/kWh).")
    lines.append("")
    return "\n".join(lines)

def write_pdf(md_text, out_pdf):
    # Minimal dependency: try reportlab if available; else write a .txt fallback.
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm
        from textwrap import wrap
        c = canvas.Canvas(out_pdf, pagesize=A4)
        width, height = A4
        x, y = 20*mm, height - 20*mm
        for para in md_text.split("\n"):
            for line in wrap(para, 95):
                c.drawString(x, y, line)
                y -= 6*mm
                if y < 20*mm:
                    c.showPage()
                    y = height - 20*mm
            y -= 3*mm
        c.save()
        return True
    except Exception:
        with open(out_pdf.replace(".pdf", ".txt"), "w", encoding="utf-8") as f:
            f.write(md_text)
        return False

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("log", help="run_log.jsonl path")
    ap.add_argument("--out", default="report.md")
    ap.add_argument("--pdf", default="report.pdf")
    ap.add_argument("--baseline", default="baseline")
    ap.add_argument("--optimized", default="optimized")
    args = ap.parse_args()

    rows = load_jsonl(args.log)
    groups = group_by_name(rows)
    text = md_report(groups, args.baseline, args.optimized)

    with open(args.out, "w", encoding="utf-8") as f:
        f.write(text)

    ok = write_pdf(text, args.pdf)
    print(f"Wrote {args.out}")
    if ok:
        print(f"Wrote {args.pdf}")
    else:
        print(f"ReportLab not available — wrote {args.pdf.replace('.pdf','.txt')} instead.")

if __name__ == "__main__":
    main()
