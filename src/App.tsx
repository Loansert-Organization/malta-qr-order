
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import OrderDemo from "./pages/OrderDemo";
import OrderPage from "./pages/OrderPage";
import VendorDirectory from "./pages/VendorDirectory";
import VendorRegistration from "./pages/VendorRegistration";
import VendorDashboard from "./pages/VendorDashboard";
import AdminPanel from "./pages/AdminPanel";
import AISystemVerification from "./pages/AISystemVerification";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import PWADashboard from "./pages/PWADashboard";
import NotFound from "./pages/NotFound";

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary componentName="App">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vendors" element={<VendorDirectory />} />
              <Route path="/restaurants" element={<VendorDirectory />} />
              <Route path="/register" element={<VendorRegistration />} />
              <Route path="/order/:slug" element={<OrderDemo />} />
              <Route path="/order-page/:vendorSlug" element={<OrderPage />} />
              <Route path="/vendor/*" element={<VendorDashboard />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/ai-verification" element={<AISystemVerification />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/pwa" element={<PWADashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
