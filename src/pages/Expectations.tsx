import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';

const expectationsContent = `
# Project Expectations & Judging Criteria

This document outlines how the CarbonWise Dashboard meets the evaluation criteria for sustainable AI development.

## 1. Carbon Footprint Measurement

**Requirement:** Measure and track the carbon footprint of AI model inference.

**Implementation:**
- Integration with CodeCarbon SDK for real-time energy consumption tracking
- Automatic calculation of CO₂ emissions based on energy usage and regional carbon intensity
- Per-run tracking of energy (kWh), emissions (kg CO₂e), and latency metrics
- Support for JSONL data format with comprehensive metadata

## 2. Optimization Strategies

**Requirement:** Implement and demonstrate carbon reduction techniques.

**Implementation:**
- **Quantization:** 4-bit and 8-bit model quantization support
- **Speculative Decoding:** Enable faster inference with maintained accuracy
- **Token Limiting:** Configurable maximum token counts to prevent waste
- **Baseline vs Optimized:** Side-by-side comparison showing 37% energy reduction

## 3. Software Carbon Intensity (SCI) Metric

**Requirement:** Calculate and display SCI scores per functional unit.

**Formula:** SCI = (Energy in Wh per request) / max(requests, 1)

**Implementation:**
- Automatic SCI calculation for each run
- Aggregate SCI scores by run configuration
- Visual comparison of SCI metrics across configurations
- Clear display units: Wh per request

## 4. Regional Carbon Intelligence

**Requirement:** Provide region-based recommendations for carbon reduction.

**Implementation:**
- Pre-loaded regional carbon intensity data (gCO₂/kWh) from ASDI
- Interactive region selector showing current carbon intensity
- Top 3 greener alternative recommendations with % improvement
- Sortable table of all regions by carbon intensity
- Support for custom region factor uploads

## 5. Visualization & Reporting

**Requirement:** Clear, actionable insights through visualization.

**Implementation:**
- Interactive bar charts comparing energy, emissions, and latency
- Percentage improvement calculations
- Printable HTML reports
- PDF export functionality (html2pdf.js)
- Comprehensive rubric mapping in reports

## 6. Data Contract & Interoperability

**Expected Data Format (JSONL):**

\`\`\`json
{
  "run_id": "uuid",
  "run_name": "baseline",
  "ts": "2025-11-08T16:25:12Z",
  "energy_kwh": 0.92,
  "co2e_kg": 0.42,
  "latency_ms": 980,
  "requests": 1,
  "sci_wh_per_req": 920,
  "meta": {
    "precision": "fp16",
    "spec_decode": false,
    "quant": null,
    "region": "eu-west-1"
  }
}
\`\`\`

## 7. Simulation & Demo Mode

**Requirement:** Functional demonstration without GPU infrastructure.

**Implementation:**
- Pre-loaded demo data with realistic metrics
- Baseline (0.92 kWh, 0.42 kg CO₂e) vs Optimized (0.58 kWh, 0.27 kg CO₂e)
- Persistent localStorage for user-uploaded data
- Seamless switching between demo and real data

## Technical Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS with custom design system
- **Charts:** Recharts for data visualization
- **State:** Zustand with localStorage persistence
- **PDF Export:** html2pdf.js

## Accessibility & UX

- Responsive design for mobile and desktop
- Semantic HTML structure
- Clear visual hierarchy
- Accessible color contrasts
- Loading states and error handling
- Toast notifications for user feedback

## Future Enhancements

- Real-time streaming data support
- Multi-model comparison
- Historical trend analysis
- Custom carbon intensity factors per cloud provider
- API integration for automated tracking
- Advanced filtering and search
`;

export default function Expectations() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl">Expectations & Criteria</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-foreground mt-8 mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-foreground mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-foreground mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-foreground mb-4 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-foreground" {...props} />,
                li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
                code: ({node, ...props}) => <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-accent" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
              }}
            >
              {expectationsContent}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
