
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
import ErrorBoundary from "./components/ErrorBoundary";

// PWA components with proper error boundaries
const PWAInstallPrompt = React.lazy(() => 
  import("./components/PWAInstallPrompt").catch(() => ({ default: () => null }))
);
const OfflineIndicator = React.lazy(() => 
  import("./components/OfflineIndicator").catch(() => ({ default: () => null }))
);
const PerformanceMonitor = React.lazy(() => 
  import("./components/PerformanceMonitor").catch(() => ({ default: () => null }))
);

// Enhanced QueryClient with proper error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry if offline or authentication error
        if (!navigator.onLine || error?.status === 401) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on auth errors
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

// Global error handler
queryClient.setMutationDefaults(['*'], {
  onError: (error) => {
    console.error('Mutation error:', error);
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="relative">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/order/:slug" element={<OrderDemo />} />
                    <Route path="/register" element={<VendorRegistrationPage />} />
                    <Route 
                      path="/vendor" 
                      element={
                        <ProtectedRoute allowedRoles={['vendor', 'admin']} allowAnonymous={true}>
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
                </ErrorBoundary>
              </main>
            </div>
            
            {/* PWA Components with Error Boundaries */}
            <React.Suspense fallback={null}>
              <ErrorBoundary fallback={null}>
                <PWAInstallPrompt />
              </ErrorBoundary>
            </React.Suspense>
            
            <React.Suspense fallback={null}>
              <ErrorBoundary fallback={null}>
                <PerformanceMonitor />
              </ErrorBoundary>
            </React.Suspense>
          </BrowserRouter>
          
          {/* Offline Indicator */}
          <React.Suspense fallback={null}>
            <ErrorBoundary fallback={null}>
              <OfflineIndicator />
            </ErrorBoundary>
          </React.Suspense>
          
          {/* Toast Notifications */}
          <ErrorBoundary fallback={null}>
            <Toaster />
          </ErrorBoundary>
          
          <ErrorBoundary fallback={null}>
            <Sonner />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
