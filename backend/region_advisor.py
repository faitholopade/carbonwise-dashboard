# region_advisor.py
# Usage:
#   python region_advisor.py --current eu-west-1 --energy_kwh 0.92 --table region_factors.json

import json, argparse

def load_table(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--current", required=True, help="region id (e.g., eu-west-1)")
    ap.add_argument("--energy_kwh", type=float, required=True, help="energy of your run")
    ap.add_argument("--table", default="region_factors.json")
    args = ap.parse_args()

    tbl = load_table(args.table)
    reg = {r["region"]: r for r in tbl}
    if args.current not in reg:
        print(f"Current region {args.current} not in table.")
        return

    cur = reg[args.current]
    cur_g = float(cur["gco2_per_kwh"])
    rows = []
    for r in tbl:
        g = float(r["gco2_per_kwh"])
        if g < cur_g:
            saved = (cur_g - g) / cur_g
            saved_kg = args.energy_kwh * (cur_g - g) / 1000.0
            rows.append((r["region"], r["display_name"], g, saved*100.0, saved_kg))
    rows.sort(key=lambda x: x[2])
    print("Top greener regions (by gCO2/kWh):")
    for region, name, g, pct, kg in rows[:3]:
        print(f"- {name} ({region}): {g:.0f} gCO2/kWh → ~{pct:.1f}% less CO₂e (≈ {kg:.3f} kg saved for {args.energy_kwh:.2f} kWh)")

if __name__ == "__main__":
    main()
