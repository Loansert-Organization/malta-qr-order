
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnonymousAuthProvider } from "@/components/auth/AnonymousAuthProvider";
import Index from "./pages/Index";
import OrderPage from "./pages/OrderPage";
import VendorOrderManagement from "./pages/VendorOrderManagement";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AnonymousAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/order/:vendorSlug" element={<OrderPage />} />
            <Route path="/vendor" element={<VendorOrderManagement />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </AnonymousAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
