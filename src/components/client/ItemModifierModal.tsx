import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface Modifier {
  id: string;
  name: string;
  price: number;
  type: 'single' | 'multiple';
  required?: boolean;
  options?: { id: string; name: string; price: number }[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  modifiers?: Modifier[];
}

interface ItemModifierModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, modifiers: Array<{ id: string; value: unknown }>, quantity: number) => void;
}

const ItemModifierModal: React.FC<ItemModifierModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, unknown>>({});
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const handleModifierChange = (modifierId: string, value: unknown) => {
    setSelectedModifiers(prev => ({
      ...prev,
      [modifierId]: value
    }));
  };

  const calculateTotal = () => {
    let total = item.price * quantity;
    
    Object.entries(selectedModifiers).forEach(([modifierId, value]) => {
      const modifier = item.modifiers?.find(m => m.id === modifierId);
      if (modifier) {
        if (modifier.type === 'multiple' && Array.isArray(value)) {
          value.forEach(optionId => {
            const option = modifier.options?.find(o => o.id === optionId);
            if (option) total += option.price * quantity;
          });
        } else if (modifier.type === 'single' && value) {
          const option = modifier.options?.find(o => o.id === value);
          if (option) total += option.price * quantity;
        }
      }
    });
    
    return total;
  };

  const handleAddToCart = () => {
    const modifiersArray = Object.entries(selectedModifiers).map(([id, value]) => ({
      id,
      value
    }));
    
    onAddToCart(item, modifiersArray, quantity);
    onClose();
    setSelectedModifiers({});
    setQuantity(1);
  };

  const canAddToCart = () => {
    if (!item.modifiers) return true;
    
    return item.modifiers.every(modifier => {
      if (modifier.required) {
        const selected = selectedModifiers[modifier.id];
        return selected && (
          (modifier.type === 'single' && selected) ||
          (modifier.type === 'multiple' && Array.isArray(selected) && selected.length > 0)
        );
      }
      return true;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize {item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Item Image and Info */}
          <div className="flex items-center space-x-4">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">€{item.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Modifiers */}
          {item.modifiers?.map(modifier => (
            <div key={modifier.id} className="space-y-3">
              <div>
                <h4 className="font-medium">{modifier.name}</h4>
                {modifier.required && (
                  <p className="text-sm text-red-600">Required</p>
                )}
              </div>

              {modifier.type === 'single' ? (
                <RadioGroup
                  value={selectedModifiers[modifier.id] || ''}
                  onValueChange={(value) => handleModifierChange(modifier.id, value)}
                >
                  {modifier.options?.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span>+€{option.price.toFixed(2)}</span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {modifier.options?.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={(selectedModifiers[modifier.id] || []).includes(option.id)}
                        onCheckedChange={(checked) => {
                          const current = selectedModifiers[modifier.id] || [];
                          const updated = checked
                            ? [...current, option.id]
                            : current.filter((id: string) => id !== option.id);
                          handleModifierChange(modifier.id, updated);
                        }}
                      />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>{option.name}</span>
                          {option.price > 0 && (
                            <span>+€{option.price.toFixed(2)}</span>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total and Add to Cart */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>€{calculateTotal().toFixed(2)}</span>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart()}
              className="w-full"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemModifierModal;
