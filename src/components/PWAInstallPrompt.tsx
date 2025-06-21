
import React from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt = () => {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isOnline } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Install ICUPA Malta</h3>
                <p className="text-sm text-blue-700">Get the full app experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissInstallPrompt}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Faster access to menus</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Offline menu browsing</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Push notifications for orders</span>
            </div>
          </div>

          {!isOnline && (
            <div className="bg-amber-100 border border-amber-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-amber-800">
                You're offline. Install now to access cached content!
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              onClick={installApp}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button
              variant="outline"
              onClick={dismissInstallPrompt}
              size="sm"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
