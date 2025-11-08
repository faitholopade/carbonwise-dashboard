import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/store/useDataStore";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Report() {
  const { runs } = useDataStore();
  const reportRef = useRef<HTMLDivElement>(null);

  const exportPDF = async () => {
    if (!reportRef.current) return;

    try {
      const opt = {
        margin: 10,
        filename: `carbonwise-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(reportRef.current).save();
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error(error);
    }
  };

  // Calculate summary metrics
  const groupedData = runs.reduce((acc, run) => {
    if (!acc[run.run_name]) {
      acc[run.run_name] = {
        name: run.run_name,
        totalEnergy: 0,
        totalCo2: 0,
        totalLatency: 0,
        count: 0,
      };
    }
    acc[run.run_name].totalEnergy += run.energy_kwh;
    acc[run.run_name].totalCo2 += run.co2e_kg;
    acc[run.run_name].totalLatency += run.latency_ms;
    acc[run.run_name].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedData).map((group: any) => ({
    name: group.name,
    'Energy (kWh)': (group.totalEnergy / group.count).toFixed(3),
    'CO₂e (kg)': (group.totalCo2 / group.count).toFixed(3),
  }));

  const baseline = chartData.find(d => d.name.toLowerCase().includes('baseline'));
  const optimized = chartData.find(d => d.name.toLowerCase().includes('optimized'));
  
  let improvements = null;
  if (baseline && optimized) {
    improvements = {
      energy: ((1 - Number(optimized['Energy (kWh)']) / Number(baseline['Energy (kWh)'])) * 100).toFixed(1),
      co2: ((1 - Number(optimized['CO₂e (kg)']) / Number(baseline['CO₂e (kg)'])) * 100).toFixed(1),
    };
  }

  const rubricMappings = [
    {
      criterion: "Carbon Footprint Measurement",
      implementation: "CodeCarbon SDK integration for real-time energy and emissions tracking"
    },
    {
      criterion: "Optimization Strategies",
      implementation: "4-bit quantization, speculative decoding, and token limiting"
    },
    {
      criterion: "SCI Metric Calculation",
      implementation: "Automated SCI calculation: (Wh per request) / functional unit"
    },
    {
      criterion: "Regional Recommendations",
      implementation: "Data-driven region advisor with carbon intensity comparison"
    },
    {
      criterion: "Visualization & Reporting",
      implementation: "Interactive dashboard with charts and exportable PDF reports"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Carbon Impact Report</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of AI model carbon efficiency
            </p>
          </div>
          <Button onClick={exportPDF} size="lg" className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        <div ref={reportRef} className="space-y-6 bg-background p-8 rounded-2xl">
          {/* Report Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-4xl font-bold text-foreground mb-2">CarbonWise Report</h1>
            <p className="text-muted-foreground">
              Generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Executive Summary */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-foreground">
                  This report analyzes the carbon footprint of AI model inference across {runs.length} runs,
                  comparing baseline and optimized configurations to demonstrate potential emissions reductions.
                </p>
                {improvements && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Energy Savings</p>
                      <p className="text-3xl font-bold text-primary">{improvements.energy}%</p>
                    </div>
                    <div className="p-4 bg-accent/5 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">CO₂ Reduction</p>
                      <p className="text-3xl font-bold text-accent">{improvements.co2}%</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Energy (kWh)" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="CO₂e (kg)" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rubric Mapping */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Rubric Compliance</CardTitle>
              <CardDescription>
                How this project addresses evaluation criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rubricMappings.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{item.criterion}</p>
                      <p className="text-sm text-muted-foreground">{item.implementation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span className="text-foreground">
                    Deploy models in regions with lower carbon intensity (e.g., eu-north-1 at 13 gCO₂/kWh)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span className="text-foreground">
                    Enable quantization (4-bit or 8-bit) to reduce energy consumption by up to 37%
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span className="text-foreground">
                    Implement speculative decoding for latency improvements without accuracy loss
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span className="text-foreground">
                    Set appropriate token limits to prevent unnecessary computation
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-6 border-t">
            <p>Generated by CarbonWise Dashboard</p>
            <p className="mt-1">For more information, visit the project documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
