
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface NoDataStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  suggestions?: string[];
}

const NoDataState: React.FC<NoDataStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  suggestions
}) => {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardContent className="p-12 text-center">
        <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        
        {suggestions && (
          <div className="text-sm text-gray-400 mb-4">
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {actionText && onAction && (
          <Button onClick={onAction} variant="outline">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NoDataState;
