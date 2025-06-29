import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({ icon: Icon, title, description, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-4 max-w-xs">{description}</p>}
    {actionText && onAction && (
      <Button onClick={onAction}>{actionText}</Button>
    )}
  </div>
);

export default EmptyState; 