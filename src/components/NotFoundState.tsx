
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotFoundStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionTo?: string;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({
  title,
  description,
  actionText = "Go Home",
  actionTo = "/"
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 max-w-md">{description}</p>
        </div>
        <Link to={actionTo}>
          <Button size="lg">{actionText}</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundState;
