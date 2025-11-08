import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Upload from "./pages/Upload";
import Compare from "./pages/Compare";
import RegionAdvisor from "./pages/RegionAdvisor";
import Report from "./pages/Report";
import Expectations from "./pages/Expectations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navigation />
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/region-advisor" element={<RegionAdvisor />} />
            <Route path="/report" element={<Report />} />
            <Route path="/expectations" element={<Expectations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
