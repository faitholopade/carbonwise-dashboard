import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataStore } from "@/store/useDataStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from "lucide-react";

export default function Compare() {
  const { runs } = useDataStore();

  // Group runs by run_name and calculate averages
  const groupedData = runs.reduce((acc, run) => {
    if (!acc[run.run_name]) {
      acc[run.run_name] = {
        name: run.run_name,
        totalEnergy: 0,
        totalCo2: 0,
        totalLatency: 0,
        totalSci: 0,
        count: 0,
      };
    }
    acc[run.run_name].totalEnergy += run.energy_kwh;
    acc[run.run_name].totalCo2 += run.co2e_kg;
    acc[run.run_name].totalLatency += run.latency_ms;
    acc[run.run_name].totalSci += run.sci_wh_per_req;
    acc[run.run_name].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedData).map((group: any) => ({
    name: group.name,
    'Energy (kWh)': (group.totalEnergy / group.count).toFixed(3),
    'CO₂e (kg)': (group.totalCo2 / group.count).toFixed(3),
    'Latency (ms)': (group.totalLatency / group.count).toFixed(0),
    avgSci: (group.totalSci / group.count).toFixed(0),
  }));

  // Calculate improvement percentages if we have baseline and optimized
  const baseline = chartData.find(d => d.name.toLowerCase().includes('baseline'));
  const optimized = chartData.find(d => d.name.toLowerCase().includes('optimized'));
  
  let improvements = null;
  if (baseline && optimized) {
    improvements = {
      energy: ((1 - Number(optimized['Energy (kWh)']) / Number(baseline['Energy (kWh)'])) * 100).toFixed(1),
      co2: ((1 - Number(optimized['CO₂e (kg)']) / Number(baseline['CO₂e (kg)'])) * 100).toFixed(1),
      latency: ((1 - Number(optimized['Latency (ms)']) / Number(baseline['Latency (ms)'])) * 100).toFixed(1),
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
            <CardTitle>Energy Consumption (kWh)</CardTitle>
            <CardDescription>Average energy per run configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="Energy (kWh)" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>CO₂ Emissions (kg)</CardTitle>
            <CardDescription>Average carbon emissions per run configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="CO₂e (kg)" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
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
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Legend />
                <Bar dataKey="Latency (ms)" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
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
                      {data.avgSci} Wh/req
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
