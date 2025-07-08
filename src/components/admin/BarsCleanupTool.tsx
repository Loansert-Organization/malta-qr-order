import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CleanupDetails {
  duplicate_groups?: Array<{
    bars: Array<{
      id: string;
      name: string;
      address: string;
    }>;
    kept_bar: string;
  }>;
  sample_bars_with_images?: Array<{
    id: string;
    name: string;
    photo_url: string;
  }>;
}

interface CleanupResult {
  success: boolean;
  duplicates_removed: number;
  duplicate_groups: number;
  images_restored: number;
  remaining_bars: number;
  bars_with_images: number;
  details?: CleanupDetails;
}

const BarsCleanupTool = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runCleanupAndImageRestore = async () => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      toast({
        title: "Starting Cleanup",
        description: "Removing duplicates and restoring images...",
      });

      const response = await supabase.functions.invoke('fix-bars-duplicates-images');

      clearInterval(progressInterval);
      setProgress(100);

      if (response.error) {
        throw response.error;
      }

      const cleanupResult = response.data as CleanupResult;
      setResult(cleanupResult);

      if (cleanupResult.success) {
        toast({
          title: "✅ Cleanup Complete!",
          description: `Removed ${cleanupResult.duplicates_removed} duplicates, restored ${cleanupResult.images_restored} images`,
        });
      } else {
        throw new Error('Cleanup operation failed');
      }

    } catch (error) {
      console.error('Error running cleanup:', error);
      setResult({
        success: false,
        duplicates_removed: 0,
        duplicate_groups: 0,
        images_restored: 0,
        remaining_bars: 0,
        bars_with_images: 0
      });
      
      toast({
        title: "❌ Cleanup Failed",
        description: error.message || "An error occurred during cleanup",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getDatabaseStats = async () => {
    try {
      const { count: totalBars } = await supabase
        .from('bars')
        .select('*', { count: 'exact', head: true });

      const { count: barsWithImages } = await supabase
        .from('bars')
        .select('*', { count: 'exact', head: true })
        .not('photo_url', 'is', null);

      return { totalBars: totalBars || 0, barsWithImages: barsWithImages || 0 };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { totalBars: 0, barsWithImages: 0 };
    }
  };

  const [stats, setStats] = useState({ totalBars: 0, barsWithImages: 0 });

  React.useEffect(() => {
    getDatabaseStats().then(setStats);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Bars Database Cleanup & Image Restoration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalBars}</div>
              <div className="text-sm text-blue-800">Total Bars</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.barsWithImages}</div>
              <div className="text-sm text-green-800">With Images</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.totalBars - stats.barsWithImages}</div>
              <div className="text-sm text-orange-800">Missing Images</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalBars > 0 ? Math.round((stats.barsWithImages / stats.totalBars) * 100) : 0}%
              </div>
              <div className="text-sm text-purple-800">Image Coverage</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center space-y-4">
            <Button 
              onClick={runCleanupAndImageRestore}
              disabled={isRunning}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Running Cleanup...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Remove Duplicates & Restore Images
                </>
              )}
            </Button>

            {isRunning && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full max-w-md mx-auto" />
                <p className="text-sm text-gray-600">Processing... {progress}%</p>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">What this tool does:</p>
                <ul className="space-y-1">
                  <li>• Removes duplicate bars based on Google Place ID and name/address similarity</li>
                  <li>• Restores missing images from Google Maps for bars that have a place_id</li>
                  <li>• Updates photo_url field with Google Maps photo URLs</li>
                  <li>• Logs all operations for audit purposes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <Card className={`border-2 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Cleanup Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{result.duplicates_removed}</div>
                    <div className="text-sm text-gray-600">Duplicates Removed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.images_restored}</div>
                    <div className="text-sm text-gray-600">Images Restored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.remaining_bars}</div>
                    <div className="text-sm text-gray-600">Remaining Bars</div>
                  </div>
                </div>

                {result.details?.duplicate_groups && result.details.duplicate_groups.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Duplicate Groups Removed:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.details.duplicate_groups.slice(0, 10).map((group: any, index: number) => (
                        <div key={index} className="text-sm bg-white p-2 rounded border">
                          <div className="font-medium">{group.name}</div>
                          <div className="text-gray-600">{group.reason}</div>
                          <div className="text-xs text-gray-500">
                            Removed {group.duplicateIds.length} duplicates
                          </div>
                        </div>
                      ))}
                      {result.details.duplicate_groups.length > 10 && (
                        <div className="text-sm text-gray-500 text-center">
                          ... and {result.details.duplicate_groups.length - 10} more groups
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.details?.sample_bars_with_images && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Sample Bars with Images:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.details.sample_bars_with_images.map((bar: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {bar.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BarsCleanupTool;
