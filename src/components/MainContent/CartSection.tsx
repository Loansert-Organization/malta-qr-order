
import React from 'react';
import CartSidebar from '@/components/CartSidebar';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  popular: boolean;
  prep_time?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartSectionProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  vendorId: string;
  guestSessionId: string;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  getTotalPrice,
  getTotalItems,
  vendorId,
  guestSessionId
}) => {
  return (
    <CartSidebar
      cart={cart}
      onAddToCart={onAddToCart}
      onRemoveFromCart={onRemoveFromCart}
      getTotalPrice={getTotalPrice}
      getTotalItems={getTotalItems}
      vendorId={vendorId}
      guestSessionId={guestSessionId}
    />
  );
};

export default CartSection;
