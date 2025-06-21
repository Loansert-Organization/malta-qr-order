
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import OrderDemo from "./pages/OrderDemo";
import VendorDashboard from "./pages/VendorDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

// Conditionally render PWA components to avoid initialization issues
const PWAInstallPrompt = React.lazy(() => import("./components/PWAInstallPrompt"));
const OfflineIndicator = React.lazy(() => import("./components/OfflineIndicator"));
const PerformanceMonitor = React.lazy(() => import("./components/PerformanceMonitor"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <React.Suspense fallback={null}>
          <OfflineIndicator />
        </React.Suspense>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order/:slug" element={<OrderDemo />} />
            <Route path="/vendor" element={<VendorDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <React.Suspense fallback={null}>
          <PWAInstallPrompt />
          <PerformanceMonitor />
        </React.Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
