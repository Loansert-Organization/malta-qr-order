import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface Props {
  title: string;
  description: string;
  imageUrl?: string;
  onAdd: () => void;
}

const SmartSuggestionCard: React.FC<Props> = ({ title, description, imageUrl, onAdd }) => (
  <Card className="flex gap-4 p-3 items-center bg-accent/10 border-accent">
    {imageUrl && (
      <ImageWithFallback src={imageUrl} alt={title} className="h-16 w-16 rounded object-cover" />
    )}
    <CardContent className="flex-1 p-0">
      <h4 className="font-medium mb-1 text-sm">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </CardContent>
    <Button size="sm" onClick={onAdd} aria-label="Add suggested item">
      Add
    </Button>
  </Card>
);

export default SmartSuggestionCard; 