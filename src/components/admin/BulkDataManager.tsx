import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Building2, Loader2, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { bulkDataPopulation } from '@/services/bulkDataPopulation';
import { useToast } from '@/hooks/use-toast';

const BulkDataManager: React.FC = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [stats, setStats] = useState<{ malta: number; kigali: number; total: number }>({ malta: 0, kigali: 0, total: 0 });
  const { toast } = useToast();

  const handlePopulateData = async () => {
    setIsPopulating(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await bulkDataPopulation.populateAllEstablishments();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(result);

      // Update stats
      const newStats = await bulkDataPopulation.getEstablishmentStats();
      setStats(newStats);

      if (result.success) {
        toast({
          title: "Data Population Complete! ��",
          description: `Added ${result.total_added} establishments (Malta: ${result.malta_bars}, Kigali: ${result.kigali_bars})`,
        });
      } else {
        toast({
          title: "Population Issues",
          description: `Some errors occurred. Check details below.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Population Failed",
        description: "There was an error populating the database.",
        variant: "destructive"
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleGetStats = async () => {
    const newStats = await bulkDataPopulation.getEstablishmentStats();
    setStats(newStats);
    
    toast({
      title: "Stats Updated",
      description: `Found ${newStats.total} total establishments`,
    });
  };

  const StatusBadge: React.FC<{ status: boolean; label: string }> = ({ status, label }) => (
    <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
      {status ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bulk Data Population Manager
          </CardTitle>
          <CardDescription>
            Populate the database with 200+ Malta bars/restaurants and 100+ Kigali establishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.malta}</div>
                  <div className="text-sm text-gray-600">Malta Establishments</div>
                  <MapPin className="h-4 w-4 mx-auto mt-1 text-blue-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.kigali}</div>
                  <div className="text-sm text-gray-600">Kigali Establishments</div>
                  <MapPin className="h-4 w-4 mx-auto mt-1 text-green-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Establishments</div>
                  <BarChart3 className="h-4 w-4 mx-auto mt-1 text-purple-500" />
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handlePopulateData}
                disabled={isPopulating}
                className="flex items-center gap-2"
                size="lg"
              >
                {isPopulating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                {isPopulating ? 'Populating...' : 'Populate 300+ Establishments'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleGetStats}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Refresh Stats
              </Button>
            </div>

            {/* Progress Bar */}
            {isPopulating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Population Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Results */}
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Population Results
                    <StatusBadge 
                      status={results.success} 
                      label={results.success ? "Success" : "Issues"} 
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Added Establishments</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            🏝️ Malta Establishments
                          </span>
                          <Badge variant="outline">{results.malta_bars}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            🇷🇼 Kigali Establishments
                          </span>
                          <Badge variant="outline">{results.kigali_bars}</Badge>
                        </div>
                        <div className="flex items-center justify-between font-semibold">
                          <span>Total Added</span>
                          <Badge>{results.total_added}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Status Summary</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Success Rate</span>
                          <Badge variant={results.errors.length === 0 ? "default" : "secondary"}>
                            {results.errors.length === 0 ? "100%" : "Partial"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Errors</span>
                          <Badge variant={results.errors.length === 0 ? "default" : "destructive"}>
                            {results.errors.length}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {results.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <h5 className="font-semibold text-red-800 mb-2">Errors ({results.errors.length})</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {results.errors.slice(0, 5).map((error: string, index: number) => (
                          <p key={index} className="text-sm text-red-600">• {error}</p>
                        ))}
                        {results.errors.length > 5 && (
                          <p className="text-sm text-red-500 italic">
                            + {results.errors.length - 5} more errors...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Information Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 mb-2">What This Will Add:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-700">🏝️ Malta (200+ establishments)</h5>
                    <ul className="text-blue-600 space-y-1 mt-1">
                      <li>• Valletta, Sliema, St. Julian's</li>
                      <li>• Mdina, Rabat, Mosta</li>
                      <li>• Marsaxlokk, Mellieha, Gozo</li>
                      <li>• Restaurants, bars, cafes, pubs</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700">🇷🇼 Kigali (100+ establishments)</h5>
                    <ul className="text-blue-600 space-y-1 mt-1">
                      <li>• CBD, Kimihurura, Remera</li>
                      <li>• Nyarutarama, Kacyiru, Gasabo</li>
                      <li>• Local & international cuisine</li>
                      <li>• All establishment categories</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkDataManager;
