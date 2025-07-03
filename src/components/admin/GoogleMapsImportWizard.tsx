import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MapPin, 
  Search, 
  Plus, 
  Trash2, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BarSearchCriteria {
  id: string;
  location: string;
  searchTerms: string[];
  radius: number;
  maxResults: number;
}

interface ImportProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
  results: any[];
}

interface GoogleMapsImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoogleMapsImportWizard = ({ open, onOpenChange }: GoogleMapsImportWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<BarSearchCriteria[]>([]);
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    completed: 0,
    current: '',
    errors: [],
    results: []
  });
  const [previewData, setPreviewData] = useState<any[]>([]);

  // Initialize with one search criteria
  useEffect(() => {
    if (open && searchCriteria.length === 0) {
      addSearchCriteria();
    }
  }, [open]);

  const addSearchCriteria = () => {
    const newCriteria: BarSearchCriteria = {
      id: Date.now().toString(),
      location: '',
      searchTerms: ['bar', 'restaurant'],
      radius: 5000,
      maxResults: 20
    };
    setSearchCriteria([...searchCriteria, newCriteria]);
  };

  const removeSearchCriteria = (id: string) => {
    setSearchCriteria(searchCriteria.filter(c => c.id !== id));
  };

  const updateSearchCriteria = (id: string, field: keyof BarSearchCriteria, value: any) => {
    setSearchCriteria(searchCriteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const updateSearchTerms = (id: string, terms: string) => {
    const termArray = terms.split(',').map(t => t.trim()).filter(t => t.length > 0);
    updateSearchCriteria(id, 'searchTerms', termArray);
  };

  const validateCriteria = () => {
    const errors = [];
    searchCriteria.forEach((criteria, index) => {
      if (!criteria.location.trim()) {
        errors.push(`Search ${index + 1}: Location is required`);
      }
      if (criteria.searchTerms.length === 0) {
        errors.push(`Search ${index + 1}: At least one search term is required`);
      }
    });
    return errors;
  };

  const handlePreview = async () => {
    const errors = validateCriteria();
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call edge function to preview data
      const { data, error } = await supabase.functions.invoke('fetch-bars-from-google-maps', {
        body: { 
          searchCriteria,
          preview: true
        }
      });

      if (error) throw error;

      setPreviewData(data.bars || []);
      setStep(2);
      toast({
        title: "Preview Generated",
        description: `Found ${data.bars?.length || 0} potential bars to import`
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Error",
        description: "Failed to generate preview. Please check your search criteria.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setStep(3);
    setProgress({
      total: previewData.length,
      completed: 0,
      current: 'Starting import...',
      errors: [],
      results: []
    });

    try {
      // Call edge function to import bars
      const { data, error } = await supabase.functions.invoke('fetch-bars-from-google-maps', {
        body: { 
          searchCriteria,
          import: true,
          selectedBars: previewData.map(bar => bar.place_id)
        }
      });

      if (error) throw error;

      setProgress(prev => ({
        ...prev,
        completed: data.imported || 0,
        current: 'Import completed',
        results: data.results || []
      }));

      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.imported || 0} bars`
      });

      // Auto-close after successful import
      setTimeout(() => {
        onOpenChange(false);
        resetWizard();
      }, 3000);

    } catch (error) {
      console.error('Import error:', error);
      setProgress(prev => ({
        ...prev,
        errors: [...prev.errors, error.message]
      }));
      toast({
        title: "Import Error",
        description: "Failed to import bars. Check logs for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSearchCriteria([]);
    setPreviewData([]);
    setProgress({
      total: 0,
      completed: 0,
      current: '',
      errors: [],
      results: []
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    resetWizard();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Google Maps Bar Import Wizard
          </DialogTitle>
          <DialogDescription>
            Import bars and restaurants from Google Maps into your database
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="ml-2">Configure</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="ml-2">Preview</span>
          </div>
          <div className="w-12 h-px bg-border" />
          <div className={`flex items-center ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="ml-2">Import</span>
          </div>
        </div>

        {/* Step 1: Configure Search Criteria */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Search Configuration</h3>
              <Button onClick={addSearchCriteria} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Search
              </Button>
            </div>

            {searchCriteria.map((criteria, index) => (
              <Card key={criteria.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Search {index + 1}</CardTitle>
                    {searchCriteria.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSearchCriteria(criteria.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`location-${criteria.id}`}>Location*</Label>
                      <Input
                        id={`location-${criteria.id}`}
                        placeholder="e.g., Malta, Valletta, St. Julian's"
                        value={criteria.location}
                        onChange={(e) => updateSearchCriteria(criteria.id, 'location', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`radius-${criteria.id}`}>Search Radius (meters)</Label>
                      <Select
                        value={criteria.radius.toString()}
                        onValueChange={(value) => updateSearchCriteria(criteria.id, 'radius', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">1 km</SelectItem>
                          <SelectItem value="5000">5 km</SelectItem>
                          <SelectItem value="10000">10 km</SelectItem>
                          <SelectItem value="25000">25 km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`terms-${criteria.id}`}>Search Terms*</Label>
                    <Input
                      id={`terms-${criteria.id}`}
                      placeholder="bar, restaurant, pub, cafe (comma separated)"
                      value={criteria.searchTerms.join(', ')}
                      onChange={(e) => updateSearchTerms(criteria.id, e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`max-${criteria.id}`}>Max Results</Label>
                    <Select
                      value={criteria.maxResults.toString()}
                      onValueChange={(value) => updateSearchCriteria(criteria.id, 'maxResults', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Step 2: Preview Results */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview Results ({previewData.length} bars found)</h3>
              <Badge variant="secondary">
                <Eye className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {previewData.map((bar, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{bar.name}</h4>
                      <p className="text-sm text-muted-foreground">{bar.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {bar.rating && (
                          <Badge variant="outline">⭐ {bar.rating}</Badge>
                        )}
                        {bar.types && (
                          <Badge variant="outline">{bar.types[0]}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {bar.user_ratings_total && `${bar.user_ratings_total} reviews`}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Import Progress */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Importing Bars</h3>
              <div className="space-y-2">
                <Progress 
                  value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0} 
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  {progress.completed} of {progress.total} completed
                </p>
                <p className="text-sm">{progress.current}</p>
              </div>
            </div>

            {progress.errors.length > 0 && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {progress.errors.map((error, index) => (
                      <li key={index} className="text-destructive">• {error}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {progress.results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Successfully Imported
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>• {progress.completed} bars imported</p>
                    <p>• Data synchronized with client app</p>
                    <p>• Ready for menu population</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handlePreview} disabled={loading || searchCriteria.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Preview...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Preview Results
                  </>
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to Configure
              </Button>
              <Button onClick={handleImport} disabled={loading || previewData.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import {previewData.length} Bars
                  </>
                )}
              </Button>
            </>
          )}

          {step === 3 && (
            <Button onClick={handleClose} disabled={loading}>
              {loading ? 'Importing...' : 'Close'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleMapsImportWizard;