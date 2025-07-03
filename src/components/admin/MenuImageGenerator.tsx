import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Image, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

interface GenerationResult {
  success: boolean;
  total_processed: number;
  generated: number;
  failed: number;
}

export default function MenuImageGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [missingCount, setMissingCount] = useState<number | null>(null);
  const [batchSize, setBatchSize] = useState(10);

  // Check how many items are missing images
  const checkMissingImages = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact' })
      .is('image_url', null);
    
    if (!error && data) {
      setMissingCount(data.length);
    }
  };

  React.useEffect(() => {
    checkMissingImages();
  }, []);

  const generateImages = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 2000);

      const response = await fetch('https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/fill-menu-item-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Edge function handles its own authorization via SERVICE_ROLE_KEY
        },
        body: JSON.stringify({ batchSize }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Refresh missing count
      await checkMissingImages();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Menu Image Generator
        </CardTitle>
        <CardDescription>
          Automatically generate high-quality images for menu items using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Items Missing Images</span>
              <span className="text-2xl font-bold text-orange-500">
                {missingCount ?? '...'}
              </span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Batch Size</span>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="text-xl font-bold px-2 py-1 border rounded"
                disabled={isGenerating}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Generating images...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Result Alert */}
        {result && (
          <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">Generation Complete!</p>
                <p>• Processed: {result.total_processed} items</p>
                <p>• Successfully generated: {result.generated} images</p>
                {result.failed > 0 && (
                  <p>• Failed: {result.failed} items</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-500">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={generateImages}
            disabled={isGenerating || missingCount === 0}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Image className="mr-2 h-4 w-4" />
                Generate Images
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={checkMissingImages}
            disabled={isGenerating}
          >
            Refresh Count
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-muted-foreground">
          <p>• Images are generated using DALL-E 3 AI</p>
          <p>• Each image is optimized for menu display</p>
          <p>• Process runs automatically every night at 3 AM UTC</p>
        </div>
      </CardContent>
    </Card>
  );
} 