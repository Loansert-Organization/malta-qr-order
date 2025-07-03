import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportSummary {
  barsCreated: number;
  menusCreated: number;
  itemsInserted: number;
  itemsUpdated: number;
  errors: Array<{ item: string; error: string }>;
  totalProcessed: number;
}

const MenuImporter: React.FC = () => {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    summary?: ImportSummary;
    message?: string;
    error?: string;
  } | null>(null);

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste the menu JSON data first",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setLastResult(null);

    try {
      // Parse JSON to validate it
      let menuData;
      try {
        menuData = JSON.parse(jsonInput);
      } catch (parseError) {
        throw new Error(`Invalid JSON format: ${parseError}`);
      }

      // Validate that it's an array
      if (!Array.isArray(menuData)) {
        throw new Error('Menu data must be an array of menu items');
      }

      // Call the import edge function
      const { data, error } = await supabase.functions.invoke('import-menu-json', {
        body: { menuData }
      });

      if (error) {
        throw error;
      }

      setLastResult(data);
      
      if (data.success) {
        toast({
          title: "Import successful!",
          description: data.message,
        });
      } else {
        toast({
          title: "Import failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLastResult({
        success: false,
        error: errorMessage
      });
      
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file",
        variant: "destructive"
      });
    }
  };

  const sampleData = [
    {
      "bar": "Sample Restaurant",
      "category": "Food",
      "subcategory": "Appetizers",
      "item": "Caesar Salad",
      "description": "Fresh romaine lettuce with parmesan cheese",
      "volume": null,
      "price": 12.50
    },
    {
      "bar": "Sample Restaurant",
      "category": "Drinks",
      "subcategory": "Soft Drinks",
      "item": "Coca Cola",
      "volume": "330ml",
      "price": 2.50
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Menu JSON Importer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Or Paste JSON Data
            </label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your menu JSON data here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={isImporting || !jsonInput.trim()}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? 'Importing...' : 'Import Menu Data'}
            </Button>

            <Button 
              variant="outline"
              onClick={() => setJsonInput(JSON.stringify(sampleData, null, 2))}
            >
              Load Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastResult.success && lastResult.summary ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {lastResult.message}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {lastResult.summary.barsCreated}
                    </div>
                    <div className="text-sm text-blue-600">Bars Created</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {lastResult.summary.menusCreated}
                    </div>
                    <div className="text-sm text-green-600">Menus Created</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {lastResult.summary.itemsInserted}
                    </div>
                    <div className="text-sm text-purple-600">Items Inserted</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {lastResult.summary.itemsUpdated}
                    </div>
                    <div className="text-sm text-orange-600">Items Updated</div>
                  </div>
                </div>

                {lastResult.summary.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">
                      Errors ({lastResult.summary.errors.length}):
                    </h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {lastResult.summary.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <strong>{error.item}:</strong> {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {lastResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Prepare your menu data as a JSON array with the following structure:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{JSON.stringify(sampleData[0], null, 2)}
          </pre>
          <p>2. Either upload a .json file or paste the data directly into the text area</p>
          <p>3. Click "Import Menu Data" to process the data</p>
          <p>4. The system will automatically:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Create bars if they don't exist</li>
            <li>Create menus for each bar</li>
            <li>Insert new menu items or update existing ones</li>
            <li>Set image_url to null for future image generation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuImporter;