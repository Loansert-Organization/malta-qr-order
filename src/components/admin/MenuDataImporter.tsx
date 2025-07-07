import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Upload, FileText } from 'lucide-react';
import { syncMenuFromText, parseMenuData, syncMenuItems, MenuItem } from '@/utils/menu-sync-service';

interface MenuDataImporterProps {
  onImportComplete?: (summary: any) => void;
}

export function MenuDataImporter({ onImportComplete }: MenuDataImporterProps) {
  const [menuText, setMenuText] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [summary, setSummary] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextImport = async () => {
    if (!menuText.trim()) {
      setImportStatus('error');
      setStatusMessage('Please enter menu data');
      return;
    }

    setIsImporting(true);
    setImportStatus('idle');
    setStatusMessage('');

    try {
      const response = await syncMenuFromText(menuText);
      
      if (response.success) {
        setImportStatus('success');
        setStatusMessage(`Successfully imported ${response.summary?.itemsInserted || 0} menu items`);
        setSummary(response.summary);
        if (onImportComplete) {
          onImportComplete(response.summary);
        }
      } else {
        setImportStatus('error');
        setStatusMessage(response.error || 'Failed to import menu data');
        console.error('Import error details:', response.details);
      }
    } catch (error) {
      setImportStatus('error');
      setStatusMessage('An unexpected error occurred');
      console.error('Import exception:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    setStatusMessage('');

    try {
      // Read file as text
      const text = await file.text();
      
      // If it's a JSON file
      if (file.type === 'application/json') {
        try {
          const menuItems = JSON.parse(text) as MenuItem[];
          if (!Array.isArray(menuItems)) {
            throw new Error('JSON file must contain an array of menu items');
          }
          
          const response = await syncMenuItems(menuItems);
          handleImportResponse(response);
        } catch (jsonError) {
          setImportStatus('error');
          setStatusMessage(`Invalid JSON format: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
      } 
      // If it's a text file (tab-delimited)
      else {
        const response = await syncMenuFromText(text);
        handleImportResponse(response);
      }
    } catch (error) {
      setImportStatus('error');
      setStatusMessage('Failed to read or process file');
      console.error('File import error:', error);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportResponse = (response: any) => {
    if (response.success) {
      setImportStatus('success');
      setStatusMessage(`Successfully imported ${response.summary?.itemsInserted || 0} menu items`);
      setSummary(response.summary);
      if (onImportComplete) {
        onImportComplete(response.summary);
      }
    } else {
      setImportStatus('error');
      setStatusMessage(response.error || 'Failed to import menu data');
      console.error('Import error details:', response.details);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent) => {
    const text = event.clipboardData.getData('text');
    setMenuText(text);
  };

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
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                onPaste={handlePaste}
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
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.tsv,.json"
                className="hidden"
                disabled={isImporting}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="mb-2"
              >
                <Upload className="mr-2 h-4 w-4" /> Select File
              </Button>
              <p className="text-sm text-muted-foreground">
                Upload a tab-delimited text file (.txt, .tsv) or JSON array (.json)
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {importStatus === 'success' && (
          <Alert className="mt-4 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {importStatus === 'error' && (
          <Alert className="mt-4 bg-red-50" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {summary && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium mb-2">Import Summary</h4>
            <ul className="text-sm">
              <li>Bars processed: {summary.barsAdded?.length || 0}</li>
              <li>Items inserted/updated: {summary.itemsInserted || 0}</li>
              <li>Errors: {summary.errors?.length || 0}</li>
            </ul>
            {summary.errors?.length > 0 && (
              <details className="mt-2">
                <summary className="text-sm text-red-600 cursor-pointer">View Errors</summary>
                <ul className="text-xs mt-2 list-disc pl-5 space-y-1">
                  {summary.errors.map((err: any, idx: number) => (
                    <li key={idx}>{err.item}: {err.error}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTextImport} 
          disabled={isImporting || !menuText.trim()}
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Import Menu Data'}
        </Button>
      </CardFooter>
    </Card>
  );
} 