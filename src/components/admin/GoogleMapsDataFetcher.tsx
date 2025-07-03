import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Camera, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

interface FetchResult {
  status: string;
  uploaded: number;
  message?: string;
}

export default function GoogleMapsDataFetcher() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [barIdentifier, setBarIdentifier] = useState('');
  const [barsToFetch, setBarsToFetch] = useState<any[] | null>(null);

  const checkBarsWithoutPhotos = async () => {
    const { data, error } = await supabase
      .from('bars')
      .select('id, name')
      .is('website_url', null) // A proxy for missing photos in this context
    
    if (!error && data) {
      setBarsToFetch(data);
    }
  };

  React.useEffect(() => {
    checkBarsWithoutPhotos();
  }, []);

  const fetchPhotos = async (barId?: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    const barsToProcess = barId ? [{ id: barId }] : barsToFetch;

    if (!barsToProcess || barsToProcess.length === 0) {
      setError("No bars to process or ID not found.");
      setIsLoading(false);
      return;
    }

    try {
      let count = 0;
      for (const bar of barsToProcess) {
        count++;
        setProgress(Math.round((count / barsToProcess.length) * 100));

        const response = await fetch('https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/fetch-bar-photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Edge function handles its own authorization via SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ barId: bar.id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch for bar ${bar.id}. Status: ${response.status}`);
        }
        
        const data: FetchResult = await response.json();
        // For simplicity, we only show the result of the last processed bar in a bulk operation
        setResult(data);
      }
      
      await checkBarsWithoutPhotos(); // Refresh count

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleFetchSingle = async () => {
    if (!barIdentifier) {
      setError("Please provide a bar name or ID.");
      return;
    }
    // Simple check if it's a UUID, otherwise assume it's a name
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(barIdentifier);
    if (isUuid) {
      fetchPhotos(barIdentifier);
    } else {
      const { data, error } = await supabase.from('bars').select('id').ilike('name', `%${barIdentifier}%`).limit(1).single();
      if (error || !data) {
        setError(`Bar "${barIdentifier}" not found.`);
        return;
      }
      fetchPhotos(data.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Google Maps Photo Fetcher
        </CardTitle>
        <CardDescription>
          Manually fetch photos and data for bars from Google Maps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bars without Photos</span>
            <span className="text-2xl font-bold text-blue-500">
              {barsToFetch?.length ?? '...'}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2"
            disabled={isLoading || !barsToFetch || barsToFetch.length === 0}
            onClick={() => fetchPhotos()}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            Fetch For All Missing
          </Button>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm font-medium mb-2">Fetch for a specific bar</p>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter Bar Name or ID" 
              value={barIdentifier}
              onChange={(e) => setBarIdentifier(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleFetchSingle} disabled={isLoading || !barIdentifier}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Fetching photos...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {result && (
          <Alert className={result.status === 'done' || result.status === 'skipped' ? 'border-green-500' : 'border-orange-500'}>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Fetch Result: {result.status}</p>
              <p>• Photos uploaded: {result.uploaded}</p>
              {result.message && <p>• Message: {result.message}</p>}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground">
          <p>• Uses Google Places API to find and download photos</p>
          <p>• Photos are stored in Supabase Storage</p>
        </div>
      </CardContent>
    </Card>
  );
} 