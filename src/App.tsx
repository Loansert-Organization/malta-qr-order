
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConsolidatedSessionProvider } from "@/providers/ConsolidatedSessionProvider";
import Index from "./pages/Index";
import ClientOrder from "./pages/ClientOrder";
import VendorDashboard from "./pages/VendorDashboard";
import VendorOnboarding from "./pages/VendorOnboarding";
import AdminPanel from "./pages/AdminPanel";
import ProductionAudit from "./pages/ProductionAudit";
import OrderTracking from "./pages/OrderTracking";
import OrderRating from "./pages/OrderRating";
import PaymentSuccess from "./pages/PaymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Landing Page */}
          <Route path="/" element={<Index />} />
          
          {/* Client App Routes */}
          <Route path="/order/:vendorSlug" element={<ClientOrder />} />
          <Route path="/order/tracking/:orderId" element={<OrderTracking />} />
          <Route path="/rate-order/:orderId" element={<OrderRating />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Vendor App Routes */}
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
          
          {/* Admin Panel Routes */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/audit" element={<ProductionAudit />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
