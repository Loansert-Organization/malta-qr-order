// ✨ Refactored by Cursor – Audit Phase 1: Type Safety & Hook Fixes
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  Bar, 
  MenuItem, 
  Order, 
  Vendor, 
  CartItem,
  ErrorHandler,
  ClickHandler 
} from '@/types/api';
import CartSection from './CartSidebar';
import AIWaiterButton from './AIWaiterButton';
import Header from './MainContent/Header';
import LeftColumn from './MainContent/LeftColumn';
import AIModals from './MainContent/AIModals';

interface MainContentProps {
  // Core required props with proper typing
  vendor: Vendor;
  layout: Record<string, unknown>;
  weatherData: Record<string, unknown>;
  menuItems: MenuItem[];
  cart: CartItem[];
  searchQuery: string;
  contextData: Record<string, unknown>;
  handleHeroCtaClick: ClickHandler;
  handleSearch: (query: string) => void;
  addToCart: (item: MenuItem) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  guestSessionId: string;

  // Optional enhanced props
  bars?: Bar[];
  selectedBar?: Bar | null;
  searchTerm?: string;
  nearestBar?: Bar | null;
  onBarSelect?: (bar: Bar) => void;
  onOrderComplete?: (order: Order) => void;
  cartItems?: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  onRemoveFromCart?: (itemId: string) => void;
}

interface CartSummaryItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const MainContent: React.FC<MainContentProps> = ({
  vendor,
  layout,
  weatherData,
  menuItems,
  cart,
  searchQuery,
  contextData,
  handleHeroCtaClick,
  handleSearch,
  addToCart,
  removeFromCart,
  getTotalPrice,
  getTotalItems,
  guestSessionId,
  // Enhanced props with defaults
  bars = [],
  selectedBar = null,
  searchTerm = '',
  nearestBar = null,
  onBarSelect,
  onOrderComplete,
  cartItems = [],
  onAddToCart,
  onRemoveFromCart
}) => {
  const navigate = useNavigate();
  const [showAIWaiter, setShowAIWaiter] = useState(false);
  const [showAIVerification, setShowAIVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummaryItem[]>([]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleOrderComplete = useCallback((orderId: string): void => {
    console.log('Order completed:', orderId);
    if (onOrderComplete) {
      // Create a properly typed order object
      const order: Order = {
        id: orderId,
        vendor_id: vendor.id,
        order_number: `ORD-${Date.now()}`,
        items: cart.map(item => ({
          id: `item-${item.id}`,
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          modifiers: item.modifiers?.map(mod => ({
            id: `mod-${mod.modifier_id}`,
            modifier_id: mod.modifier_id,
            name: mod.name,
            price: mod.price,
            quantity: 1
          })) || []
        })),
        subtotal: getTotalPrice(),
        tax_amount: 0,
        service_fee: 0,
        delivery_fee: 0,
        discount_amount: 0,
        total_amount: getTotalPrice(),
        currency: 'EUR',
        country: 'Malta',
        order_status: 'pending',
        payment_status: 'pending',
        customer_info: {},
        agreed_to_terms: true,
        whatsapp_consent: false,
        marketing_consent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onOrderComplete(order);
    }
  }, [onOrderComplete, vendor.id, cart, getTotalPrice]);

  // Type-safe addToCart wrapper
  const handleAddToCart = useCallback(async (item: MenuItem): Promise<void> => {
    try {
      await addToCart(item);
      if (onAddToCart) {
        onAddToCart(item);
      }
      toast.success(`Added ${item.name} to cart`);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  }, [addToCart, onAddToCart]);

  // Type-safe removeFromCart wrapper
  const handleRemoveFromCart = useCallback((itemId: string): void => {
    try {
      removeFromCart(itemId);
      if (onRemoveFromCart) {
        onRemoveFromCart(itemId);
      }
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  }, [removeFromCart, onRemoveFromCart]);

  // Memoized bar selection handler
  const handleBarSelect = useCallback((bar: Bar): void => {
    if (onBarSelect) {
      onBarSelect(bar);
    }
    // Navigate to bar's menu if available
    navigate(`/menu/${bar.id}`);
  }, [onBarSelect, navigate]);

  // Memoized order navigation
  const handleOrderNow = useCallback((): void => {
    if (selectedBar) {
      navigate(`/menu/${selectedBar.id}`);
    } else {
      navigate(`/menu/${vendor.id}`);
    }
  }, [selectedBar, vendor.id, navigate]);

  // Error handler for component
  const handleError: ErrorHandler = useCallback((error: Error) => {
    console.error('MainContent error:', error);
    toast.error(error.message || 'An unexpected error occurred');
  }, []);

  // Filtered bars computation
  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bar.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update cart summary when items change - FIXED: proper dependencies
  useEffect(() => {
    try {
      const items = cartItems.length > 0 ? cartItems : cart;
      const summary: CartSummaryItem[] = items.reduce((acc: CartSummaryItem[], item) => {
        // Type guard to ensure we have the required properties
        if ('id' in item && 'name' in item && 'price' in item) {
          const existingItem = acc.find(summaryItem => summaryItem.id === item.id);
          if (existingItem) {
            existingItem.quantity += item.quantity || 1;
          } else {
            acc.push({
              id: item.id,
              name: item.name,
              price: typeof item.price === 'number' ? item.price : 0,
              quantity: item.quantity || 1
            });
          }
        }
        return acc;
      }, []);
      setCartSummary(summary);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to update cart summary'));
    }
  }, [cartItems, cart, handleError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        vendor={vendor}
        onAIWaiterClick={() => setShowAIWaiter(true)}
        onAIVerificationClick={() => setShowAIVerification(true)}
      />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Menu and Content */}
          <LeftColumn
            layout={layout}
            vendor={vendor}
            weatherData={weatherData}
            contextData={contextData}
            searchQuery={searchQuery}
            menuItems={menuItems}
            handleHeroCtaClick={handleHeroCtaClick}
            handleSearch={handleSearch}
            addToCart={handleAddToCart}
          />

          {/* Right Column - Cart */}
          <CartSection
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            getTotalPrice={getTotalPrice}
            getTotalItems={getTotalItems}
            vendorId={vendor.id}
            vendorName={vendor.name}
            guestSessionId={guestSessionId}
            onOrderComplete={handleOrderComplete}
          />
        </div>
      </div>

      {/* Enhanced Bar Selection (if bars provided) */}
      {bars.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          {/* Nearest Bar Section */}
          {nearestBar && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Nearest Bar</h2>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200"
                onClick={() => handleBarSelect(nearestBar)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{nearestBar.name}</h3>
                      <p className="text-gray-600 text-sm">{nearestBar.address}</p>
                      {nearestBar.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm">{nearestBar.rating}</span>
                          {nearestBar.review_count && (
                            <span className="text-gray-500 text-sm">({nearestBar.review_count})</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">Nearest</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Bars Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">All Bars in Malta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBars.map((bar) => (
                <Card 
                  key={bar.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedBar?.id === bar.id ? 'border-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleBarSelect(bar)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{bar.name}</h3>
                        <p className="text-gray-600 text-sm">{bar.address}</p>
                        {bar.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm">{bar.rating}</span>
                            {bar.review_count && (
                              <span className="text-gray-500 text-sm">({bar.review_count})</span>
                            )}
                          </div>
                        )}
                      </div>
                      {bar.id === nearestBar?.id && (
                        <Badge variant="secondary">Nearest</Badge>
                      )}
                    </div>
                    {selectedBar?.id === bar.id && (
                      <div className="mt-3">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderNow();
                          }}
                          className="w-full"
                        >
                          View Menu & Order
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Modals */}
      <AIModals
        showAIWaiter={showAIWaiter}
        showAIVerification={showAIVerification}
        onCloseAIWaiter={() => setShowAIWaiter(false)}
        onCloseAIVerification={() => setShowAIVerification(false)}
        onAddToCart={handleAddToCart}
        vendorId={vendor.id}
        vendorName={vendor.name}
        guestSessionId={guestSessionId}
      />

      {/* AI Waiter Button */}
      <AIWaiterButton onClick={() => setShowAIWaiter(true)} />

      {/* Cart Summary */}
      {cartSummary.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold mb-2">Cart Summary</h3>
          {cartSummary.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm mb-1">
              <span>{item.name} x{item.quantity}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>
                €{cartSummary.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
          </div>
          <Button 
            className="w-full mt-2" 
            onClick={() => navigate('/checkout')}
          >
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
};

export default MainContent;
