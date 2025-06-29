import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ConsolidatedSessionProvider } from "@/providers/ConsolidatedSessionProvider";
import { lazy, Suspense, useEffect } from "react";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

// Lazy load all route components
const Index = lazy(() => import("./pages/Index"));
const ClientHome = lazy(() => import("./pages/ClientHome"));
// const ClientOrder = lazy(() => import("./pages/ClientOrder")); // DEPRECATED
const MenuPage = lazy(() => import("./pages/MenuPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ConfirmPage = lazy(() => import("./pages/ConfirmPage"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorOrders = lazy(() => import("./pages/VendorOrders"));
const VendorMenu = lazy(() => import("./pages/VendorMenu"));
const VendorPayments = lazy(() => import("./pages/VendorPayments"));
const VendorSettings = lazy(() => import("./pages/VendorSettings"));
const VendorOnboarding = lazy(() => import("./pages/VendorOnboarding"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminBars = lazy(() => import("./pages/AdminBars"));
const AdminMenus = lazy(() => import("./pages/AdminMenus"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminTools = lazy(() => import("./pages/AdminTools"));
const AdminAccessibility = lazy(() => import("./pages/AdminAccessibility"));
const ProductionAudit = lazy(() => import("./pages/ProductionAudit"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderRating = lazy(() => import("./pages/OrderRating"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Anonymous auth initialization component
const AnonymousAuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const initAnonymousAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Sign in anonymously
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.warn('Anonymous auth failed, using guest session fallback:', error);
        }
      }
    };
    
    initAnonymousAuth();
  }, []);
  
  return <>{children}</>;
};

const RoutesWithAnimation = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Landing Page */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        {/* Client App Routes */}
        <Route path="/home" element={<PageTransition><ClientHome /></PageTransition>} />
        <Route path="/client" element={<PageTransition><ClientHome /></PageTransition>} />
        <Route path="/menu/:barId" element={<PageTransition><MenuPage /></PageTransition>} />
        <Route path="/checkout/:barId" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/order" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/confirm/:orderId" element={<PageTransition><ConfirmPage /></PageTransition>} />
        <Route path="/confirmed/:orderId" element={<PageTransition><ConfirmPage /></PageTransition>} />
        {/* <Route path="/order/:vendorSlug" element={<PageTransition><ClientOrder /></PageTransition>} /> */} {/* DEPRECATED */}
        <Route path="/order/tracking/:orderId" element={<PageTransition><OrderTracking /></PageTransition>} />
        <Route path="/rate-order/:orderId" element={<PageTransition><OrderRating /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />

        {/* Vendor App Routes */}
        <Route path="/vendor" element={<PageTransition><VendorDashboard /></PageTransition>} />
        <Route path="/vendor/orders" element={<PageTransition><VendorOrders /></PageTransition>} />
        <Route path="/vendor/menu" element={<PageTransition><VendorMenu /></PageTransition>} />
        <Route path="/vendor/payments" element={<PageTransition><VendorPayments /></PageTransition>} />
        <Route path="/vendor/settings" element={<PageTransition><VendorSettings /></PageTransition>} />
        <Route path="/vendor/onboarding" element={<PageTransition><VendorOnboarding /></PageTransition>} />

        {/* Admin Panel Routes */}
        <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
        <Route path="/admin/audit" element={<PageTransition><ProductionAudit /></PageTransition>} />
        <Route path="/admin/bars" element={<PageTransition><AdminBars /></PageTransition>} />
        <Route path="/admin/menus" element={<PageTransition><AdminMenus /></PageTransition>} />
        <Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
        <Route path="/admin/payments" element={<PageTransition><AdminPayments /></PageTransition>} />
        <Route path="/admin/tools" element={<PageTransition><AdminTools /></PageTransition>} />
        <Route path="/admin/accessibility" element={<PageTransition><AdminAccessibility /></PageTransition>} />

        {/* Catch all route */}
        <Route path="*" element={<PageTransition><Index /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnonymousAuthProvider>
          <ConsolidatedSessionProvider>
            <Suspense fallback={<LoadingState />}>
              <RoutesWithAnimation />
            </Suspense>
          </ConsolidatedSessionProvider>
        </AnonymousAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
