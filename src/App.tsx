
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import Index from "./pages/Index";
import OrderDemo from "./pages/OrderDemo";
import VendorDashboard from "./pages/VendorDashboard";
import AdminPanel from "./pages/AdminPanel";
import VendorRegistrationPage from "./pages/VendorRegistration";
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
      <AuthProvider>
        <Toaster />
        <Sonner />
        <React.Suspense fallback={null}>
          <OfflineIndicator />
        </React.Suspense>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/order/:slug" element={<OrderDemo />} />
                <Route path="/register" element={<VendorRegistrationPage />} />
                <Route 
                  path="/vendor" 
                  element={
                    <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
        <React.Suspense fallback={null}>
          <PWAInstallPrompt />
          <PerformanceMonitor />
        </React.Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
