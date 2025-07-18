
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Suggestion {
  id: string;
  name: string;
  description?: string;
  price: number;
  popular?: boolean;
  action?: string;
}

interface LayoutHint {
  cardStyle?: 'horizontal' | 'vertical';
  highlight?: 'popular' | 'price';
  animation?: 'subtle' | 'none';
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available?: boolean;
}

interface AIWaiterSuggestionsProps {
  suggestions: Suggestion[];
  layoutHints: LayoutHint;
  onAddToCart: (item: MenuItem) => void;
  onSuggestionAdded: (itemName: string) => void;
  language?: 'en' | 'mt' | 'it';
}

const AIWaiterSuggestions = ({ 
  suggestions, 
  layoutHints, 
  onAddToCart, 
  onSuggestionAdded,
  language = 'en'
}: AIWaiterSuggestionsProps) => {
  if (!suggestions || suggestions.length === 0) return null;

  const addToCartTexts = {
    en: 'Add to Cart',
    mt: 'Żid fil-Cart',
    it: 'Aggiungi al Carrello'
  };

  const popularTexts = {
    en: 'Popular',
    mt: 'Popolari',
    it: 'Popolare'
  };

  const cardStyle = layoutHints?.cardStyle || 'horizontal';
  const highlight = layoutHints?.highlight || 'popular';
  const animation = layoutHints?.animation || 'subtle';

  return (
    <div className="mt-3 space-y-2">
      {suggestions.map((item) => (
        <Card 
          key={item.id} 
          className={`p-3 hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 ${
            animation === 'subtle' ? 'hover:scale-[1.02]' : ''
          }`}
        >
          <div className={`flex items-center ${cardStyle === 'vertical' ? 'flex-col' : 'justify-between'}`}>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
                {item.popular && highlight === 'popular' && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {popularTexts[language]}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-1">{item.description}</p>
              <p className={`font-bold ${highlight === 'price' ? 'text-xl text-blue-600' : 'text-blue-600'}`}>
                €{parseFloat(item.price.toString()).toFixed(2)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                onAddToCart(item);
                onSuggestionAdded(item.name);
              }}
              className="ml-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {addToCartTexts[language]}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AIWaiterSuggestions;
