import React from 'react';
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Button } from '@/components/ui/button';

interface Favorite {
  item_id: string;
  name: string;
  image_url: string | null;
  order_count: number;
}

interface Props {
  favorites: Favorite[];
  onAdd: (itemId: string) => void;
}

const FavoritesCarousel: React.FC<Props> = ({ favorites, onAdd }) => {
  const [emblaRef] = useEmblaCarousel({ align: 'start' } as EmblaOptionsType);

  if (favorites.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">⭐ Customer Favorites</h2>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {favorites.map((fav) => (
            <div key={fav.item_id} className="w-40 flex-shrink-0">
              <div className="aspect-square mb-2">
                <ImageWithFallback
                  src={fav.image_url || '/placeholder.svg'}
                  alt={fav.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <p className="text-sm mb-1 truncate" title={fav.name}>{fav.name}</p>
              <Button size="sm" className="w-full" onClick={() => onAdd(fav.item_id)} aria-label={`Add ${fav.name}`}>
                + Add
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesCarousel; 