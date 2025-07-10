import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { ConsolidatedSessionProvider } from "@/providers/ConsolidatedSessionProvider";
import { lazy, Suspense, useEffect } from "react";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { CartProvider } from '@/contexts/CartContext';

// Lazy load all route components
const WelcomeWizard = lazy(() => import("./components/WelcomeWizard"));
const Index = lazy(() => import("./pages/Index"));
const ClientHome = lazy(() => import("./pages/ClientHome"));
const BarDetail = lazy(() => import("./pages/BarDetail"));
const MenuCategory = lazy(() => import("./pages/MenuCategory"));
// const ClientOrder = lazy(() => import("./pages/ClientOrder")); // DEPRECATED
const MenuPage = lazy(() => import("./pages/MenuPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderReview = lazy(() => import("./pages/OrderReview"));
const OrderPayment = lazy(() => import("./pages/OrderPayment"));
const ConfirmPage = lazy(() => import("./pages/ConfirmPage"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
// const OrderSuccess = lazy(() => import("./pages/OrderSuccess")); // Unused - removed
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
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const OrderRating = lazy(() => import("./pages/OrderRating"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const VendorOrderDetail = lazy(() => import("./pages/VendorOrderDetail"));
// const UserProfile = lazy(() => import("./pages/UserProfile")); // Unused - removed
const SupplierDirectory = lazy(() => import("./components/marketplace/SupplierDirectory"));
const EntertainerDirectory = lazy(() => import("./components/marketplace/EntertainerDirectory"));
const BarOnboardingWizard = lazy(() => import("./components/admin/BarOnboardingWizard"));
const MenuImportWizard = lazy(() => import("./components/admin/MenuImportWizard"));
const AdminMenuMT1Import = lazy(() => import("./pages/AdminMenuMT1Import"));

// New missing pages
const BarList = lazy(() => import("./pages/BarList"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const ClientSettings = lazy(() => import("./pages/ClientSettings"));
const FAQHelp = lazy(() => import("./pages/FAQHelp"));
const VendorMenuItemEditor = lazy(() => import("./pages/VendorMenuItemEditor"));

// Admin Agent Pages
const AdminAgentTasks = lazy(() => import("./pages/AdminAgentTasks"));
const AdminAgentPersona = lazy(() => import("./pages/AdminAgentPersona"));
const AdminAgentLearning = lazy(() => import("./pages/AdminAgentLearning"));
const AdminSystemLogs = lazy(() => import("./pages/AdminSystemLogs"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const AdminEntertainers = lazy(() => import("./pages/AdminEntertainers"));
const AdminSuppliers = lazy(() => import("./pages/AdminSuppliers"));

// Additional admin pages
const AdminBarList = lazy(() => import("./pages/AdminBarList"));

// TEMPORARY: Import new admin components for manual client-side testing
import MenuImageGenerator from "@/components/admin/MenuImageGenerator";
import GoogleMapsDataFetcher from "@/components/admin/GoogleMapsDataFetcher";

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

// Bar Onboarding Pages
const TempAdminToolsPage = () => (
  <PageTransition>
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Temporary Admin Tools</h1>
      <p className="text-sm text-red-500 font-semibold">NOTE: This page is for temporary testing only and should be removed once the main admin panel is accessible.</p>
      <MenuImageGenerator />
      <GoogleMapsDataFetcher />
    </div>
  </PageTransition>
);
const UploadMenuCSV = lazy(() => import('./pages/admin/bar-onboarding/UploadMenuCSV'));
// const BarPaymentsForm = lazy(() => import('./pages/admin/bar-onboarding/BarPaymentsForm')); // File deleted
const BarMenuQR = lazy(() => import('./pages/admin/bar-onboarding/BarMenuQR'));
const RoutesWithAnimation = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main Landing Page - Now shows WelcomeWizard */}
        <Route path="/" element={<PageTransition><WelcomeWizard /></PageTransition>} />
        {/* Landing page moved to /landing */}
        <Route path="/landing" element={<PageTransition><Index /></PageTransition>} />
        {/* Client App Routes */}
        <Route path="/basket" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/home" element={<PageTransition><ClientHome /></PageTransition>} />
        <Route path="/client" element={<PageTransition><ClientHome /></PageTransition>} />
        <Route path="/client/home" element={<PageTransition><ClientHome /></PageTransition>} />
        <Route path="/bars" element={<PageTransition><BarList /></PageTransition>} />
        <Route path="/bars/:barId" element={<PageTransition><BarDetail /></PageTransition>} />
        <Route path="/bars/:barId/menu/:category" element={<PageTransition><MenuCategory /></PageTransition>} />
        <Route path="/menu/:barId" element={<PageTransition><MenuPage /></PageTransition>} />
        <Route path="/checkout/:barId" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/order" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/order/review" element={<PageTransition><OrderReview /></PageTransition>} />
        <Route path="/order/payment" element={<PageTransition><OrderPayment /></PageTransition>} />
        <Route path="/confirm/:orderId" element={<PageTransition><ConfirmPage /></PageTransition>} />
        {/* Order status primary route */}
        <Route path="/order-status/:orderId" element={<PageTransition><OrderStatus /></PageTransition>} />
        {/* Alias route for legacy deep links */}
        <Route path="/order/:orderId/status" element={<PageTransition><OrderStatus /></PageTransition>} />
        {/* <Route path="/order/:vendorSlug" element={<PageTransition><ClientOrder /></PageTransition>} /> */} {/* DEPRECATED */}
        <Route path="/order/tracking/:orderId" element={<PageTransition><OrderTracking /></PageTransition>} />
        <Route path="/admin/bar-onboarding/upload-menu" element={<PageTransition><UploadMenuCSV /></PageTransition>} />
        {/* <Route path="/admin/bar-onboarding/payments" element={<PageTransition><BarPaymentsForm /></PageTransition>} /> */}
        <Route path="/admin/bar-onboarding/qrcode" element={<PageTransition><BarMenuQR /></PageTransition>} />
        <Route path="/orders/history" element={<PageTransition><OrderHistory /></PageTransition>} />
        <Route path="/rate-order/:orderId" element={<PageTransition><OrderRating /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
        <Route path="/favorites" element={<PageTransition><FavoritesPage /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/order-confirmation/:orderId" element={<PageTransition><OrderConfirmationPage /></PageTransition>} />
        <Route path="/help" element={<PageTransition><FAQHelp /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQHelp /></PageTransition>} />

        {/* Vendor App Routes */}
        <Route path="/vendor" element={<PageTransition><VendorDashboard /></PageTransition>} />
        <Route path="/vendor/orders" element={<PageTransition><VendorOrders /></PageTransition>} />
        <Route path="/vendor/orders/incoming" element={<PageTransition><VendorOrders /></PageTransition>} />
        <Route path="/vendor/orders/:orderId" element={<PageTransition><VendorOrderDetail /></PageTransition>} />
        <Route path="/vendor/menu" element={<PageTransition><VendorMenu /></PageTransition>} />
        <Route path="/vendor/menu/:itemId/edit" element={<PageTransition><VendorMenuItemEditor /></PageTransition>} />
        <Route path="/vendor/menu/new" element={<PageTransition><VendorMenuItemEditor /></PageTransition>} />
        <Route path="/vendor/payments" element={<PageTransition><VendorPayments /></PageTransition>} />
        <Route path="/vendor/settings" element={<PageTransition><VendorSettings /></PageTransition>} />
        <Route path="/vendor/onboarding" element={<PageTransition><VendorOnboarding /></PageTransition>} />
        <Route path="/vendor/marketplace/suppliers" element={<PageTransition><SupplierDirectory /></PageTransition>} />
        <Route path="/vendor/marketplace/entertainers" element={<PageTransition><EntertainerDirectory /></PageTransition>} />
        <Route path="/vendor/profile" element={<PageTransition><ClientProfile /></PageTransition>} />

        {/* Admin Panel Routes */}
        <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
        <Route path="/admin/audit" element={<PageTransition><ProductionAudit /></PageTransition>} />
        <Route path="/admin/bars" element={<PageTransition><AdminBars /></PageTransition>} />
        <Route path="/admin/bars/list" element={<PageTransition><AdminBarList /></PageTransition>} />
        <Route path="/admin/menus" element={<PageTransition><AdminMenus /></PageTransition>} />
        <Route path="/admin/orders" element={<PageTransition><AdminOrders /></PageTransition>} />
        <Route path="/admin/payments" element={<PageTransition><AdminPayments /></PageTransition>} />
        <Route path="/admin/tools" element={<PageTransition><AdminTools /></PageTransition>} />
        <Route path="/admin/accessibility" element={<PageTransition><AdminAccessibility /></PageTransition>} />
        <Route path="/admin/bar-onboarding" element={<PageTransition><BarOnboardingWizard /></PageTransition>} />
        <Route path="/admin/menu-import" element={<PageTransition><MenuImportWizard /></PageTransition>} />
        <Route path="/admin/menumt1-import" element={<PageTransition><AdminMenuMT1Import /></PageTransition>} />
        
        {/* New Admin Routes */}
        <Route path="/admin/agents/tasks" element={<PageTransition><AdminAgentTasks /></PageTransition>} />
        <Route path="/admin/agents/persona" element={<PageTransition><AdminAgentPersona /></PageTransition>} />
        <Route path="/admin/agents/learning" element={<PageTransition><AdminAgentLearning /></PageTransition>} />
        <Route path="/admin/logs" element={<PageTransition><AdminSystemLogs /></PageTransition>} />
        <Route path="/admin/settings" element={<PageTransition><AdminSettings /></PageTransition>} />
        <Route path="/admin/entertainers" element={<PageTransition><AdminEntertainers /></PageTransition>} />
        <Route path="/admin/suppliers" element={<PageTransition><AdminSuppliers /></PageTransition>} />

        {/* Marketplace Routes */}
        <Route path="/marketplace/suppliers" element={<PageTransition><SupplierDirectory /></PageTransition>} />
        <Route path="/marketplace/entertainers" element={<PageTransition><EntertainerDirectory /></PageTransition>} />

        {/* User Profile Routes */}
        <Route path="/profile" element={<PageTransition><ClientProfile /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><ClientSettings /></PageTransition>} />
        <Route path="/client/profile" element={<PageTransition><ClientProfile /></PageTransition>} />
        <Route path="/client/settings" element={<PageTransition><ClientSettings /></PageTransition>} />

        {/* TEMPORARY: Route for testing admin tools */} 
        <Route path="/temp-admin-tools" element={<TempAdminToolsPage />} />

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
            <CartProvider>
              <Suspense fallback={<LoadingState />}>
                {/* TEMPORARY: Link to access the temporary admin tools from the WelcomeWizard */}
                <div className="fixed bottom-4 right-4 z-50">
                  <Link to="/temp-admin-tools" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg">
                    Test Admin Tools
                  </Link>
                </div>
                <RoutesWithAnimation />
              </Suspense>
            </CartProvider>
          </ConsolidatedSessionProvider>
        </AnonymousAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
