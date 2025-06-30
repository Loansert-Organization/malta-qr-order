import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';

interface CartBarProps {
  className?: string;
}

export const CartBar: React.FC<CartBarProps> = ({ className = "" }) => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Don't show if cart is empty
  if (!cart || cart.itemCount === 0) {
    return null;
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      <Card className="bg-orange-500 border-orange-600 shadow-lg shadow-orange-500/25">
        <div className="p-4">
          <Button
            onClick={handleViewCart}
            className="w-full bg-white text-orange-600 hover:bg-gray-50 font-semibold flex items-center justify-between group"
            size="lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cart.itemCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0"
                  >
                    {cart.itemCount}
                  </Badge>
                )}
              </div>
              
              <div className="text-left">
                <div className="text-sm font-medium">
                  {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''}
                </div>
                <div className="text-lg font-bold">
                  {formatPrice(cart.total, cart.currency)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">View Cart</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Button>
        </div>

        {/* Pulse animation for new items */}
        <div className="absolute inset-0 bg-orange-400 rounded-lg animate-pulse opacity-20 pointer-events-none" />
      </Card>
    </div>
  );
};

export default CartBar;
