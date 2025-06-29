import React from 'react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { Button } from '@/components/ui/button';

interface Props {
  itemName: string;
  reason: string;
  imageUrl?: string | null;
  onAdd: () => void;
}

const SuggestionCard: React.FC<Props> = ({ itemName, reason, imageUrl, onAdd }) => (
  <div className="flex gap-3 bg-accent/10 p-3 rounded-lg">
    {imageUrl && (
      <ImageWithFallback src={imageUrl} alt={itemName} className="h-12 w-12 rounded object-cover" />
    )}
    <div className="flex-1 text-sm">
      <p className="font-medium mb-1">{itemName}</p>
      <p className="text-xs text-gray-600">{reason}</p>
    </div>
    <Button size="sm" onClick={onAdd}>Add</Button>
  </div>
);
export default SuggestionCard; 