import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database,
  BarChart3,
  Euro,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MenuMT1Item {
  bar_name: string;
  category: string;
  item_name: string;
  description: string;
  price: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
  barsProcessed?: string[];
}

interface MenuMT1ImporterProps {
  onImportComplete?: (result: ImportResult) => void;
}

export const MenuMT1Importer: React.FC<MenuMT1ImporterProps> = ({ 
  onImportComplete 
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStats, setImportStats] = useState<{
    totalItems: number;
    barsFound: number;
    categoriesFound: number;
  } | null>(null);
  const { toast } = useToast();

  const parseCSV = (csvContent: string): MenuMT1Item[] => {
    const lines = csvContent.trim().split('\n');
    const items: MenuMT1Item[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',');
      
      if (parts.length >= 5) {
        // Handle quoted fields that may contain commas
        let barName = parts[0].replace(/^"|"$/g, '');
        let category = parts[1].replace(/^"|"$/g, '');
        let itemName = parts[2].replace(/^"|"$/g, '');
        let description = parts[3].replace(/^"|"$/g, '');
        let priceStr = parts[4].replace(/^"|"$/g, '');
        
        const price = parseFloat(priceStr);
        
        if (barName && itemName && !isNaN(price)) {
          items.push({
            bar_name: barName,
            category: category,
            item_name: itemName,
            description: description,
            price: price
          });
        }
      }
    }
    
    return items;
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().includes('menumt1') && !file.name.toLowerCase().includes('csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please select the MenuMT1 CSV file',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    try {
      // Read file content
      const fileContent = await file.text();
      const menuItems = parseCSV(fileContent);
      
      if (menuItems.length === 0) {
        throw new Error('No valid menu items found in CSV');
      }

      // Calculate stats
      const bars = [...new Set(menuItems.map(item => item.bar_name))];
      const categories = [...new Set(menuItems.map(item => item.category))];
      
      setImportStats({
        totalItems: menuItems.length,
        barsFound: bars.length,
        categoriesFound: categories.length
      });

      setProgress(10);

      // Process in batches
      const batchSize = 50;
      let processedCount = 0;
      const errors: string[] = [];
      const barsProcessed: string[] = [];

      for (let i = 0; i < menuItems.length; i += batchSize) {
        const batch = menuItems.slice(i, i + batchSize);
        
        try {
          // Process batch
          const { data, error } = await supabase.functions.invoke('import-menumt1-csv', {
            body: { menuItems: batch }
          });

          if (error) {
            errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          } else {
            processedCount += batch.length;
            // Track unique bars processed
            batch.forEach(item => {
              if (!barsProcessed.includes(item.bar_name)) {
                barsProcessed.push(item.bar_name);
              }
            });
          }

          // Update progress
          const progressPercent = Math.min(90, 10 + (processedCount / menuItems.length) * 80);
          setProgress(progressPercent);

        } catch (batchError) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
        }
      }

      setProgress(100);

      const result: ImportResult = {
        success: errors.length === 0,
        message: `Successfully imported ${processedCount} menu items from ${barsProcessed.length} bars`,
        importedCount: processedCount,
        errors: errors.length > 0 ? errors : undefined,
        barsProcessed
      };

      toast({
        title: result.success ? 'Import Successful' : 'Import Completed with Errors',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });

      onImportComplete?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const result: ImportResult = {
        success: false,
        message: `Import failed: ${errorMessage}`,
        errors: [errorMessage],
      };

      toast({
        title: 'Import Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      onImportComplete?.(result);
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  }, [toast, onImportComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          MenuMT1 CSV Importer
        </CardTitle>
        <CardDescription>
          Import the complete MenuMT1 CSV file with 2,534 menu items from Malta restaurants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            id="menumt1-upload"
            disabled={isImporting}
          />
          <label htmlFor="menumt1-upload" className="cursor-pointer">
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">Upload MenuMT1 CSV File</p>
                <p className="text-sm text-gray-500">
                  Select the MenuMT1 - Sheet1.csv file containing 2,534 menu items
                </p>
              </div>
              <Button 
                variant="outline" 
                disabled={isImporting}
                className="mt-4"
              >
                {isImporting ? 'Importing...' : 'Choose File'}
              </Button>
            </div>
          </label>
        </div>

        {/* Progress */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing menu items...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Import Stats */}
        {importStats && (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertTitle>Import Statistics</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importStats.totalItems}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importStats.barsFound}</div>
                  <div className="text-sm text-gray-600">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{importStats.categoriesFound}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Expected CSV Format:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Header:</strong> Bar name,Category,Item name,Description,Price</p>
            <p><strong>Example:</strong> The Londoner British Pub Sliema,STARTERS,Vegetable Spring Rolls (V),Served with sweet chilli dip,7.95</p>
          </div>
        </div>

        {/* Expected Restaurants */}
        <div>
          <h4 className="font-medium mb-2">Expected Restaurants:</h4>
          <div className="flex flex-wrap gap-2">
            {['The Londoner British Pub Sliema', 'Mamma Mia', 'The Brew Bar Grill', 'Okurama Asian Fusion'].map(restaurant => (
              <Badge key={restaurant} variant="secondary">
                {restaurant}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 