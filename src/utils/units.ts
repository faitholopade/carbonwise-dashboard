// src/utils/units.ts
export function getEnergyDisplay(rec: any) {
  // Prefer scaled fields from the tracker; else autoscale kWh→Wh
  if (typeof rec.energy_wh === "number") return { value: rec.energy_wh, unit: "Wh" };
  if (typeof rec.energy_kwh === "number") {
    const kwh = rec.energy_kwh;
    if (kwh >= 0.01) return { value: kwh, unit: "kWh" };
    return { value: kwh * 1000, unit: "Wh" };
  }
  return { value: 0, unit: "Wh" };
}

export function getCO2Display(rec: any) {
  if (typeof rec.co2e_g === "number") return { value: rec.co2e_g, unit: "g" };
  if (typeof rec.co2e_kg === "number") {
    const kg = rec.co2e_kg;
    if (kg >= 0.01) return { value: kg, unit: "kg" };
    return { value: kg * 1000, unit: "g" };
  }
  return { value: 0, unit: "g" };
}

// For percent-reduction math, always normalize to base units (kWh/kg)
export function energyAsKWh(rec: any) {
  if (typeof rec.energy_kwh === "number") return rec.energy_kwh;
  if (typeof rec.energy_wh === "number") return rec.energy_wh / 1000;
  return 0;
}
export function co2AsKg(rec: any) {
  if (typeof rec.co2e_kg === "number") return rec.co2e_kg;
  if (typeof rec.co2e_g === "number") return rec.co2e_g / 1000;
  return 0;
}
export const pct = (base: number, opt: number) =>
  base > 1e-12 ? ((base - opt) / base) * 100 : 0;
