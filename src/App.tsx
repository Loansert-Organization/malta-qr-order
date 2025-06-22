
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWAOptimization from "@/components/PWAOptimization";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import OfflineIndicator from "@/components/OfflineIndicator";

// Pages
import Index from "./pages/Index";
import VendorDirectory from "./pages/VendorDirectory";
import OrderPage from "./pages/OrderPage";
import VendorDashboard from "./pages/VendorDashboard";
import VendorRegistration from "./pages/VendorRegistration";
import AdminPanel from "./pages/AdminPanel";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import PWADashboard from "./pages/PWADashboard";
import AISystemVerification from "./pages/AISystemVerification";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-background font-sans antialiased">
                <PWAOptimization />
                <PerformanceMonitor />
                <OfflineIndicator />
                
                <Routes>
                  {/* Public Routes - Anonymous Access */}
                  <Route path="/" element={<Index />} />
                  <Route path="/restaurants" element={<VendorDirectory />} />
                  <Route 
                    path="/order/:vendorSlug" 
                    element={
                      <ProtectedRoute allowAnonymous={true}>
                        <OrderPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Vendor Routes - Anonymous/Authenticated */}
                  <Route path="/vendor/register" element={<VendorRegistration />} />
                  <Route 
                    path="/vendor/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['vendor']} allowAnonymous={true}>
                        <VendorDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Admin Routes - Authentication Required */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminPanel />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/analytics" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AnalyticsDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* System Routes */}
                  <Route path="/pwa" element={<PWADashboard />} />
                  <Route 
                    path="/ai-verification" 
                    element={
                      <ProtectedRoute allowedRoles={['admin']} allowAnonymous={true}>
                        <AISystemVerification />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </ErrorBoundary>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
