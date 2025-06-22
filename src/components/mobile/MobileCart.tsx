
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface MobileCartProps {
  totalItems: number;
  totalPrice: number;
  onViewCart: () => void;
}

const MobileCart: React.FC<MobileCartProps> = ({
  totalItems,
  totalPrice,
  onViewCart
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <Card className="bg-blue-600 text-white shadow-xl border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </div>
                <div className="text-sm text-blue-100">
                  €{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={onViewCart}
            >
              View Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileCart;
