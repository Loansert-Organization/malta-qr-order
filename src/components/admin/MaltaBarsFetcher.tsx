
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Star, Phone } from 'lucide-react';

export const MaltaBarsFetcher = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bars, setBars] = useState<any[]>([]);
  const [lastFetchResult, setLastFetchResult] = useState<string>('');
  const { toast } = useToast();

  const fetchBarsFromGoogle = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-malta-bars');
      
      if (error) {
        throw error;
      }

      if (data.success) {
        setLastFetchResult(data.message);
        toast({
          title: "Success!",
          description: data.message,
        });
        
        // Refresh the bars list
        await loadBars();
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching bars:', error);
      toast({
        title: "Error",
        description: `Failed to fetch bars: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setBars(data || []);
    } catch (error) {
      console.error('Error loading bars:', error);
      toast({
        title: "Error",
        description: "Failed to load bars from database",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    loadBars();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Malta Bars Data Fetcher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchBarsFromGoogle}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching bars...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Fetch Bars from Google Maps
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={loadBars}
              disabled={isLoading}
            >
              Refresh List
            </Button>
          </div>

          {lastFetchResult && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{lastFetchResult}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bars ({bars.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bars.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No bars found. Click "Fetch Bars from Google Maps" to get started.
              </p>
            ) : (
              bars.map((bar) => (
                <div key={bar.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{bar.name}</h3>
                    {bar.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{bar.rating}</span>
                        {bar.review_count && (
                          <span className="text-gray-500">({bar.review_count})</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {bar.address && (
                    <p className="text-gray-600 text-sm flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {bar.address}
                    </p>
                  )}
                  
                  {bar.contact_number && (
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {bar.contact_number}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Added: {new Date(bar.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
