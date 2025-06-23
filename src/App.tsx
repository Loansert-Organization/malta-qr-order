
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FullstackAudit from "./pages/FullstackAudit";
import VendorManagement from "./pages/VendorManagement";
import VendorDetails from "./pages/VendorDetails";
import ProductionSystem from "./pages/ProductionSystem";
import ProductionAudit from "./pages/ProductionAudit";
import ErrorLogs from "./pages/ErrorLogs";
import AISupervision from "./pages/AISupervision";
import FullstackSystemDashboardPage from "./pages/FullstackSystemDashboard";
import SupportDashboardPage from "./pages/SupportDashboard";
import ProductionAnalyticsDashboardPage from "./pages/ProductionAnalyticsDashboard";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/fullstack-audit" element={<FullstackAudit />} />
              <Route path="/vendor-management" element={<VendorManagement />} />
              <Route path="/vendors/:vendorId" element={<VendorDetails />} />
              <Route path="/production-system" element={<ProductionSystem />} />
              <Route path="/production-audit" element={<ProductionAudit />} />
              <Route path="/error-logs" element={<ErrorLogs />} />
              <Route path="/ai-supervision" element={<AISupervision />} />
              <Route path="/system-dashboard" element={<FullstackSystemDashboardPage />} />
              <Route path="/support-dashboard" element={<SupportDashboardPage />} />
              <Route path="/analytics-dashboard" element={<ProductionAnalyticsDashboardPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
