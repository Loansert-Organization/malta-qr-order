
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Search } from 'lucide-react';

interface NotFoundStateProps {
  title?: string;
  description?: string;
  suggestions?: string[];
  onRetry?: () => void;
  showHomeButton?: boolean;
}

const NotFoundState: React.FC<NotFoundStateProps> = ({
  title = "Content Not Found",
  description = "The content you're looking for could not be found.",
  suggestions = [],
  onRetry,
  showHomeButton = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Available options:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center">
                    <Search className="h-3 w-3 mr-2 text-gray-400" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col space-y-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="w-full">
                Try Again
              </Button>
            )}
            {showHomeButton && (
              <Button 
                onClick={() => window.location.href = '/'} 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundState;
