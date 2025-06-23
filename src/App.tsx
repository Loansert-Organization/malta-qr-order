
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
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
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary componentName="App">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/vendors" element={<VendorDirectory />} />
              <Route path="/register" element={<VendorRegistration />} />
              <Route path="/order/:slug" element={<OrderDemo />} />
              <Route path="/order-page/:vendorSlug" element={<OrderPage />} />
              
              {/* Vendor routes - allow anonymous access for demo purposes */}
              <Route
                path="/vendor/*"
                element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} allowAnonymous={true}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin routes - require authentication */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/ai-verification" element={<AISystemVerification />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/pwa" element={<PWADashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
