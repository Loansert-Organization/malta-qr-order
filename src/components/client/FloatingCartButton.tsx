import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  count: number;
  subtotal: number;
  currency: string;
}

const FloatingCartButton: React.FC<Props> = ({ count, subtotal, currency }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.div
            key={count}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.4 }}
          >
            <Button
              aria-label="Open cart"
              size="lg"
              className="shadow-lg relative bg-primary text-white hover:bg-primary/90"
              onClick={() => navigate('/order')}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {count}
              <span className="ml-2 hidden sm:inline-block text-sm font-medium">
                {currency} {subtotal.toFixed(currency === 'RWF' ? 0 : 2)}
              </span>
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartButton; 