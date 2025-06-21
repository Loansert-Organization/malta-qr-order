
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
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";
import PerformanceMonitor from "./components/PerformanceMonitor";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/order/:slug" element={<OrderDemo />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <PWAInstallPrompt />
      <PerformanceMonitor />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
