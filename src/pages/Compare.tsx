import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataStore } from "@/store/useDataStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from "lucide-react";
import { energyAsKWh, co2AsKg, pct } from "@/utils/units";

export default function Compare() {
  const { runs } = useDataStore();

  // Group runs by run_name and calculate averages using normalized units
  const groupedData = runs.reduce((acc, run) => {
    if (!acc[run.run_name]) {
      acc[run.run_name] = {
        name: run.run_name,
        totalEnergyKWh: 0,
        totalCo2Kg: 0,
        totalLatency: 0,
        totalSci: 0,
        count: 0,
      };
    }
    acc[run.run_name].totalEnergyKWh += energyAsKWh(run);
    acc[run.run_name].totalCo2Kg += co2AsKg(run);
    acc[run.run_name].totalLatency += run.latency_ms || 0;
    acc[run.run_name].totalSci += run.sci_wh_per_req || 0;
    acc[run.run_name].count += 1;
    return acc;
  }, {} as Record<string, any>);

  // Calculate means
  const mean = (total: number, count: number) => count > 0 ? total / count : 0;
  
  const processedGroups = Object.values(groupedData).map((group: any) => ({
    name: group.name,
    avgEnergyKWh: mean(group.totalEnergyKWh, group.count),
    avgCo2Kg: mean(group.totalCo2Kg, group.count),
    avgLatency: mean(group.totalLatency, group.count),
    avgSci: mean(group.totalSci, group.count),
  }));

  // Find baseline and optimized runs
  const baseline = processedGroups.find(d => d.name.toLowerCase().includes('baseline'));
  const optimized = processedGroups.find(d => d.name.toLowerCase().includes('optimized'));
  
  // Determine display units based on magnitude
  const maxEnergyKWh = Math.max(...processedGroups.map(g => g.avgEnergyKWh));
  const maxCo2Kg = Math.max(...processedGroups.map(g => g.avgCo2Kg));
  const energyUnit = maxEnergyKWh < 0.01 ? "Wh" : "kWh";
  const co2Unit = maxCo2Kg < 0.01 ? "g" : "kg";

  // Build chart data with appropriate units
  const chartData = processedGroups.map(group => ({
    name: group.name,
    energy: energyUnit === "Wh" ? group.avgEnergyKWh * 1000 : group.avgEnergyKWh,
    co2: co2Unit === "g" ? group.avgCo2Kg * 1000 : group.avgCo2Kg,
    latency: group.avgLatency,
    avgSci: group.avgSci,
  }));

  // Calculate improvement percentages
  let improvements = null;
  if (baseline && optimized) {
    improvements = {
      energy: pct(baseline.avgEnergyKWh, optimized.avgEnergyKWh).toFixed(1),
      co2: pct(baseline.avgCo2Kg, optimized.avgCo2Kg).toFixed(1),
      latency: pct(baseline.avgLatency, optimized.avgLatency).toFixed(1),
    };
  }

  if (runs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertCircle className="w-5 h-5" />
                <p>No data available. Please upload run data first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Runs</h1>
          <p className="text-muted-foreground">
            Compare energy consumption, emissions, and performance across runs
          </p>
        </div>

        {improvements && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <CardDescription>Energy Reduction</CardDescription>
                <CardTitle className="text-3xl text-primary">
                  {improvements.energy}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <CardDescription>CO₂ Reduction</CardDescription>
                <CardTitle className="text-3xl text-primary">
                  {improvements.co2}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <CardDescription>Latency Improvement</CardDescription>
                <CardTitle className="text-3xl text-primary">
                  {improvements.latency}%
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Energy Consumption ({energyUnit})</CardTitle>
            <CardDescription>Average energy per run configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" label={{ value: `Energy (${energyUnit})`, angle: -90, position: "insideLeft" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="energy" name={`Energy (${energyUnit})`} fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>CO₂ Emissions ({co2Unit})</CardTitle>
            <CardDescription>Average carbon emissions per run configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" label={{ value: `CO₂ (${co2Unit})`, angle: -90, position: "insideLeft" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="co2" name={`CO₂e (${co2Unit})`} fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Latency (ms)</CardTitle>
            <CardDescription>Average response time per run configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="latency" name="Latency (ms)" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>SCI Score (Wh per request)</CardTitle>
            <CardDescription>
              Software Carbon Intensity - lower is better
            </CardDescription>
          </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chartData.map((data) => (
                  <Card key={data.name} className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{data.name}</CardTitle>
                      <CardDescription className="text-3xl font-bold text-primary">
                        {data.avgSci.toFixed(3)} Wh/req
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
