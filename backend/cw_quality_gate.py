# cw_quality_gate.py
# Usage:
#   python cw_quality_gate.py run_log.jsonl --baseline baseline --optimized optimized --max_latency_regress 5 --max_sci_regress 5

import json, argparse, statistics, sys

def load_jsonl(p):
    rows = []
    with open(p, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                rows.append(json.loads(line))
    return rows

def mean(vals): return statistics.mean(vals) if vals else 0.0

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("log")
    ap.add_argument("--baseline", default="baseline")
    ap.add_argument("--optimized", default="optimized")
    ap.add_argument("--max_latency_regress", type=float, default=5.0, help="% allowed worse latency")
    ap.add_argument("--max_sci_regress", type=float, default=5.0, help="% allowed worse SCI")
    args = ap.parse_args()

    rows = load_jsonl(args.log)
    base = [r for r in rows if r["run_name"] == args.baseline]
    opt  = [r for r in rows if r["run_name"] == args.optimized]
    if not base or not opt:
        print("Missing baseline or optimized runs.")
        sys.exit(2)

    b_lat = mean([r["latency_ms"] for r in base])
    o_lat = mean([r["latency_ms"] for r in opt])
    b_sci = mean([r.get("sci_wh_per_req", 0.0) for r in base])
    o_sci = mean([r.get("sci_wh_per_req", 0.0) for r in opt])

    def regress_pct(b, o): return 100.0 * (o - b) / b if b > 0 else 0.0
    lat_regress = regress_pct(b_lat, o_lat)
    sci_regress = regress_pct(b_sci, o_sci)

    ok = (lat_regress <= args.max_latency_regress) and (sci_regress <= args.max_sci_regress)
    print(f"Latency regress: {lat_regress:.2f}% (limit {args.max_latency_regress}%)")
    print(f"SCI regress: {sci_regress:.2f}% (limit {args.max_sci_regress}%)")
    if ok:
        print("QUALITY GATE: PASS ✅")
        sys.exit(0)
    else:
        print("QUALITY GATE: FAIL ❌")
        sys.exit(1)

if __name__ == "__main__":
    main()
