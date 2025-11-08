import { useState } from "react";
import { Upload as UploadIcon, FileJson, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDataStore } from "@/store/useDataStore";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Upload() {
  const { runs, setRuns, clearData } = useDataStore();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      let parsedRuns = [];

      if (file.name.endsWith('.jsonl')) {
        // Parse JSONL (newline-delimited JSON)
        parsedRuns = text
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      } else if (file.name.endsWith('.json')) {
        // Parse regular JSON array
        parsedRuns = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        parsedRuns = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, i) => {
              const value = values[i]?.trim();
              // Try to parse as number
              obj[header] = !isNaN(Number(value)) ? Number(value) : value;
            });
            return obj;
          });
      }

      setRuns(parsedRuns);
      toast.success(`Successfully loaded ${parsedRuns.length} runs`);
    } catch (error) {
      toast.error('Failed to parse file. Please check the format.');
      console.error(error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Upload Run Data</h1>
          <p className="text-muted-foreground">
            Upload JSONL, JSON, or CSV files containing your AI model run metrics
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Data Upload</CardTitle>
            <CardDescription>
              Drag and drop your file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
                ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <input
                type="file"
                accept=".jsonl,.json,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports .jsonl, .json, and .csv files
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileJson className="w-4 h-4" /> JSONL
                  </span>
                  <span className="flex items-center gap-1">
                    <FileJson className="w-4 h-4" /> JSON
                  </span>
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4" /> CSV
                  </span>
                </div>
              </label>
            </div>

            {runs.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {runs.length} runs loaded
                </p>
                <Button variant="outline" size="sm" onClick={clearData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {runs.length > 0 && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Showing {runs.length} runs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run Name</TableHead>
                      <TableHead>Energy (kWh)</TableHead>
                      <TableHead>CO₂e (kg)</TableHead>
                      <TableHead>Latency (ms)</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>SCI (Wh/req)</TableHead>
                      <TableHead>Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.slice(0, 10).map((run, idx) => (
                      <TableRow key={run.run_id || idx}>
                        <TableCell className="font-medium">{run.run_name}</TableCell>
                        <TableCell>{run.energy_kwh.toFixed(3)}</TableCell>
                        <TableCell>{run.co2e_kg.toFixed(3)}</TableCell>
                        <TableCell>{run.latency_ms.toFixed(0)}</TableCell>
                        <TableCell>{run.requests}</TableCell>
                        <TableCell>{run.sci_wh_per_req.toFixed(0)}</TableCell>
                        <TableCell>{run.meta?.region || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {runs.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Showing 10 of {runs.length} runs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
