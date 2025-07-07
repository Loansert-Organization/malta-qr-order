import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react';
import { syncMenuFromText, parseMenuData, syncMenuItems, MenuItem } from '@/utils/menu-sync-service';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
}

interface MenuDataImporterProps {
  barId: string;
  onImportComplete?: (result: ImportResult) => void;
}

export const MenuDataImporter: React.FC<MenuDataImporterProps> = ({ 
  barId, 
  onImportComplete 
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const { toast } = useToast();

  const handleImport = useCallback(async () => {
    if (!importData.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter menu data to import',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);

    try {
      let parsedData: MenuItem[];
      
      try {
        parsedData = JSON.parse(importData);
      } catch (parseError) {
        toast({
          title: 'Parse Error',
          description: 'Invalid JSON format. Please check your data.',
          variant: 'destructive',
        });
        return;
      }

      if (!Array.isArray(parsedData)) {
        toast({
          title: 'Format Error',
          description: 'Data must be an array of menu items',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert(
          parsedData.map((item: MenuItem) => ({
            ...item,
            bar_id: barId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        );

      if (error) {
        throw error;
      }

      const result: ImportResult = {
        success: true,
        message: `Successfully imported ${parsedData.length} menu items`,
        importedCount: parsedData.length,
      };

      toast({
        title: 'Import Successful',
        description: result.message,
      });

      setImportData('');
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
    }
  }, [importData, barId, toast, onImportComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Menu Data</CardTitle>
        <CardDescription>
          Import menu data from tab-delimited text or JSON file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="mb-4">
            <TabsTrigger value="text">Text Input</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text">
            <div className="space-y-4">
              <Textarea
                placeholder="Paste tab-delimited menu data here..."
                className="min-h-[200px] font-mono text-sm"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                disabled={isImporting}
              />
              <div className="text-sm text-muted-foreground">
                <p>Format: Bar[tab]Category[tab]Subcategory[tab]Item[tab]Volume/Description[tab]Price</p>
                <p>Example: Brown's Kitchen[tab]Drinks[tab]Soft Drinks[tab]Pepsi[tab]250ml[tab]2.5</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="file">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer">
              <input
                type="file"
                accept=".txt,.tsv,.json"
                className="hidden"
                disabled={isImporting}
              />
              <Button 
                variant="outline" 
                className="mb-2"
                disabled={isImporting}
              >
                <Upload className="mr-2 h-4 w-4" /> Select File
              </Button>
              <p className="text-sm text-muted-foreground">
                Upload a tab-delimited text file (.txt, .tsv) or JSON array (.json)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <Button 
          onClick={handleImport} 
          disabled={isImporting || !importData.trim()}
          className="w-full mt-4"
        >
          {isImporting ? 'Importing...' : 'Import Menu Data'}
        </Button>

        {importData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium mb-2">Import Summary</h4>
            <ul className="text-sm">
              <li>Bars processed: {importData.split('\n').length}</li>
              <li>Items inserted/updated: {importData.split('\n').length}</li>
              <li>Errors: 0</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 