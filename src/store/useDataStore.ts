import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RunData {
  run_id: string;
  run_name: string;
  ts: string;
  energy_kwh: number;
  co2e_kg: number;
  latency_ms: number;
  requests: number;
  sci_wh_per_req: number;
  meta: {
    precision?: string;
    spec_decode?: boolean;
    quant?: string | null;
    region?: string;
  };
}

export interface RegionFactor {
  region: string;
  gco2_per_kwh: number;
  country?: string;
}

interface DataState {
  runs: RunData[];
  regionFactors: RegionFactor[];
  setRuns: (runs: RunData[]) => void;
  setRegionFactors: (factors: RegionFactor[]) => void;
  clearData: () => void;
}

// Demo data
const demoRuns: RunData[] = [
  {
    run_id: "demo-baseline-1",
    run_name: "baseline",
    ts: new Date().toISOString(),
    energy_kwh: 0.92,
    co2e_kg: 0.42,
    latency_ms: 980,
    requests: 1,
    sci_wh_per_req: 920,
    meta: {
      precision: "fp16",
      spec_decode: false,
      quant: null,
      region: "us-east-1"
    }
  },
  {
    run_id: "demo-optimized-1",
    run_name: "optimized",
    ts: new Date().toISOString(),
    energy_kwh: 0.58,
    co2e_kg: 0.27,
    latency_ms: 710,
    requests: 1,
    sci_wh_per_req: 580,
    meta: {
      precision: "4bit",
      spec_decode: true,
      quant: "4bit",
      region: "us-west-2"
    }
  }
];

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      runs: demoRuns,
      regionFactors: [],
      setRuns: (runs) => set({ runs }),
      setRegionFactors: (factors) => set({ regionFactors: factors }),
      clearData: () => set({ runs: demoRuns, regionFactors: [] }),
    }),
    {
      name: 'carbonwise-storage',
    }
  )
);
