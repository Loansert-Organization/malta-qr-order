
import React from 'react';
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

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AnonymousAuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/order/:vendorSlug" element={<OrderPage />} />
                <Route path="/vendor" element={<VendorOrderManagement />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </AnonymousAuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
