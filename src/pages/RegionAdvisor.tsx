import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDataStore, RegionFactor } from "@/store/useDataStore";
import { toast } from "sonner";
import { Upload, ArrowUpDown, TrendingDown } from "lucide-react";

export default function RegionAdvisor() {
  const { regionFactors, setRegionFactors } = useDataStore();
  const [currentRegion, setCurrentRegion] = useState<string>("");
  const [sortField, setSortField] = useState<'region' | 'gco2_per_kwh'>('gco2_per_kwh');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // Load default region factors if none exist
    if (regionFactors.length === 0) {
      fetch('/region_factors.json')
        .then(res => res.json())
        .then(data => {
          setRegionFactors(data);
          toast.success('Loaded default region carbon intensity data');
        })
        .catch(err => {
          console.error('Failed to load region factors:', err);
        });
    }
  }, [regionFactors.length, setRegionFactors]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setRegionFactors(data);
      toast.success('Region factors loaded successfully');
    } catch (error) {
      toast.error('Failed to parse region factors file');
      console.error(error);
    }
  };

  const sortedRegions = [...regionFactors].sort((a, b) => {
    const aVal = sortField === 'region' ? a.region : a.gco2_per_kwh;
    const bVal = sortField === 'region' ? b.region : b.gco2_per_kwh;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const currentRegionData = regionFactors.find(r => r.region === currentRegion);
  const greenerAlternatives = currentRegionData
    ? regionFactors
        .filter(r => r.gco2_per_kwh < currentRegionData.gco2_per_kwh)
        .sort((a, b) => a.gco2_per_kwh - b.gco2_per_kwh)
        .slice(0, 3)
        .map(alt => ({
          ...alt,
          improvement: ((1 - alt.gco2_per_kwh / currentRegionData.gco2_per_kwh) * 100).toFixed(1)
        }))
    : [];

  const toggleSort = (field: 'region' | 'gco2_per_kwh') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Region Advisor</h1>
          <p className="text-muted-foreground">
            Find greener cloud regions to reduce your carbon footprint
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Region Carbon Intensity</CardTitle>
            <CardDescription>
              Upload custom region factors or use default data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="region-upload"
              />
              <label htmlFor="region-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Region Factors
                  </span>
                </Button>
              </label>
              <span className="text-sm text-muted-foreground">
                {regionFactors.length} regions loaded
              </span>
            </div>
          </CardContent>
        </Card>

        {regionFactors.length > 0 && (
          <>
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Current Region</CardTitle>
                <CardDescription>
                  Select your current cloud region to see greener alternatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={currentRegion} onValueChange={setCurrentRegion}>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue placeholder="Select your current region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionFactors.map((region) => (
                      <SelectItem key={region.region} value={region.region}>
                        {region.region} {region.country && `(${region.country})`} - {region.gco2_per_kwh} gCO₂/kWh
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentRegionData && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Carbon Intensity</p>
                    <p className="text-2xl font-bold text-foreground">
                      {currentRegionData.gco2_per_kwh} gCO₂/kWh
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {greenerAlternatives.length > 0 && (
              <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    Greener Alternatives
                  </CardTitle>
                  <CardDescription>
                    Switch to these regions to reduce CO₂ emissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {greenerAlternatives.map((alt) => (
                      <Card key={alt.region} className="border-2 border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg">{alt.region}</CardTitle>
                          {alt.country && (
                            <CardDescription>{alt.country}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Carbon Intensity</p>
                              <p className="text-xl font-bold text-primary">
                                {alt.gco2_per_kwh} gCO₂/kWh
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Improvement</p>
                              <p className="text-xl font-bold text-accent">
                                {alt.improvement}% reduction
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>All Regions</CardTitle>
                <CardDescription>
                  Complete list of cloud regions sorted by carbon intensity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSort('region')}
                            className="hover:bg-transparent"
                          >
                            Region
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSort('gco2_per_kwh')}
                            className="hover:bg-transparent"
                          >
                            Carbon Intensity (gCO₂/kWh)
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRegions.map((region) => (
                        <TableRow 
                          key={region.region}
                          className={region.region === currentRegion ? 'bg-primary/5' : ''}
                        >
                          <TableCell className="font-medium">{region.region}</TableCell>
                          <TableCell>{region.country || 'N/A'}</TableCell>
                          <TableCell>
                            <span className={
                              region.gco2_per_kwh < 100 ? 'text-primary font-bold' :
                              region.gco2_per_kwh < 400 ? 'text-accent' :
                              'text-muted-foreground'
                            }>
                              {region.gco2_per_kwh}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
