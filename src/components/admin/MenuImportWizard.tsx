import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  Database, 
  Globe, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

interface ImportSource {
  type: 'file' | 'url' | 'api' | 'manual';
  name: string;
  data?: any;
}

const MenuImportWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBar, setSelectedBar] = useState('');
  const [importSource, setImportSource] = useState<ImportSource | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Mock bars data - in real app this would come from API
  const bars = [
    { id: '1', name: 'The Blue Bar', city: 'Valletta' },
    { id: '2', name: 'Harbor View Pub', city: 'Sliema' },
    { id: '3', name: 'Mediterranean Cafe', city: 'St. Julian\'s' },
  ];

  const importSources = [
    { type: 'file', name: 'CSV/Excel File', icon: FileText },
    { type: 'url', name: 'Website URL', icon: Globe },
    { type: 'api', name: 'API Endpoint', icon: Database },
    { type: 'manual', name: 'Manual Entry', icon: Plus },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportSource({ type: 'file', name: file.name, data: file });
      // Simulate file processing
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        // Mock parsed data
        setMenuItems([
          { name: 'Margarita', description: 'Classic tequila cocktail', price: 8.50, category: 'Cocktails', available: true },
          { name: 'Caesar Salad', description: 'Fresh romaine with parmesan', price: 12.00, category: 'Salads', available: true },
        ]);
      }, 2000);
    }
  };

  const handleUrlImport = async (url: string) => {
    setIsProcessing(true);
    try {
      // Simulate URL scraping
      await new Promise(resolve => setTimeout(resolve, 3000));
      setMenuItems([
        { name: 'Local Beer', description: 'Craft beer from local brewery', price: 6.00, category: 'Beer', available: true },
        { name: 'Pizza Margherita', description: 'Traditional Italian pizza', price: 15.00, category: 'Pizza', available: true },
      ]);
      setImportSource({ type: 'url', name: url });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Could not import menu from the provided URL.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApiImport = async (endpoint: string, apiKey: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      setMenuItems([
        { name: 'Wine Selection', description: 'Premium wine list', price: 25.00, category: 'Wine', available: true },
        { name: 'Cheese Board', description: 'Assorted local cheeses', price: 18.00, category: 'Appetizers', available: true },
      ]);
      setImportSource({ type: 'api', name: endpoint });
    } catch (error) {
      toast({
        title: "API Import Failed",
        description: "Could not fetch menu data from the API.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      name: '',
      description: '',
      price: 0,
      category: '',
      available: true,
    };
    setMenuItems([...menuItems, newItem]);
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    setMenuItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(prev => prev.filter((_, i) => i !== index));
  };

  const validateMenuItems = () => {
    const errors: string[] = [];
    menuItems.forEach((item, index) => {
      if (!item.name.trim()) errors.push(`Item ${index + 1}: Name is required`);
      if (item.price <= 0) errors.push(`Item ${index + 1}: Price must be greater than 0`);
      if (!item.category.trim()) errors.push(`Item ${index + 1}: Category is required`);
    });
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleImport = async () => {
    if (!validateMenuItems()) {
      toast({
        title: "Validation Errors",
        description: "Please fix the validation errors before importing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setImportProgress(0);

    // Simulate import process
    const steps = ['Validating data', 'Processing items', 'Uploading to database', 'Finalizing'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setImportProgress(((i + 1) / steps.length) * 100);
    }

    toast({
      title: "Import Successful",
      description: `Successfully imported ${menuItems.length} menu items.`,
    });

    setIsProcessing(false);
    setCurrentStep(1);
    setMenuItems([]);
    setImportSource(null);
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Select Bar
        </CardTitle>
        <CardDescription>
          Choose the bar or restaurant to import menu items for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bar-select">Select Bar *</Label>
          <Select value={selectedBar} onValueChange={setSelectedBar}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a bar..." />
            </SelectTrigger>
            <SelectContent>
              {bars.map((bar) => (
                <SelectItem key={bar.id} value={bar.id}>
                  {bar.name} - {bar.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBar && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Selected: {bars.find(b => b.id === selectedBar)?.name}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Source
        </CardTitle>
        <CardDescription>
          Choose how you want to import the menu data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {importSources.map((source) => {
            const Icon = source.icon;
            return (
              <Card
                key={source.type}
                className={`cursor-pointer transition-colors ${
                  importSource?.type === source.type ? 'border-primary' : ''
                }`}
                onClick={() => setImportSource({ type: source.type, name: source.name })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {source.type === 'file' && 'Upload CSV or Excel file'}
                        {source.type === 'url' && 'Scrape menu from website'}
                        {source.type === 'api' && 'Connect to external API'}
                        {source.type === 'manual' && 'Enter items manually'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {importSource && (
          <div className="space-y-4">
            <Separator />
            
            {importSource.type === 'file' && (
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Menu File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            )}

            {importSource.type === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="url-input">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url-input"
                    placeholder="https://example.com/menu"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        handleUrlImport(target.value);
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <Button 
                    onClick={() => {
                      const input = document.getElementById('url-input') as HTMLInputElement;
                      if (input.value) handleUrlImport(input.value);
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Import'}
                  </Button>
                </div>
              </div>
            )}

            {importSource.type === 'api' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    placeholder="https://api.example.com/menu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter API key if required"
                  />
                </div>
                <Button 
                  onClick={() => {
                    const endpoint = (document.getElementById('api-endpoint') as HTMLInputElement).value;
                    const apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
                    if (endpoint) handleApiImport(endpoint, apiKey);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Connect API'}
                </Button>
              </div>
            )}

            {importSource.type === 'manual' && (
              <div className="space-y-4">
                <Button onClick={addMenuItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
                <p className="text-sm text-muted-foreground">
                  Start adding menu items manually. You can also import from a file first and then edit.
                </p>
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <Alert>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Processing import source... Please wait.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Review & Edit Menu Items
        </CardTitle>
        <CardDescription>
          Review imported items and make any necessary adjustments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h4 className="font-medium">Menu Items ({menuItems.length})</h4>
          <Button onClick={addMenuItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h5 className="font-medium">Item {index + 1}</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMenuItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input
                    value={item.category}
                    onChange={(e) => updateMenuItem(index, 'category', e.target.value)}
                    placeholder="e.g., Drinks, Food, Desserts"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={item.description}
                  onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                  placeholder="Describe the item"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (€) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateMenuItem(index, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id={`available-${index}`}
                    checked={item.available}
                    onCheckedChange={(checked) => updateMenuItem(index, 'available', checked)}
                  />
                  <Label htmlFor={`available-${index}`}>Available</Label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No menu items to review. Add items or import from a source.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Import Summary
        </CardTitle>
        <CardDescription>
          Review the import details and complete the process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Import Details</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Bar:</strong> {bars.find(b => b.id === selectedBar)?.name}</div>
              <div><strong>Source:</strong> {importSource?.name}</div>
              <div><strong>Items:</strong> {menuItems.length}</div>
              <div><strong>Available:</strong> {menuItems.filter(item => item.available).length}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Categories</h4>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(menuItems.map(item => item.category))).map((category) => (
                <Badge key={category} variant="secondary">{category}</Badge>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Menu Items Preview</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {menuItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">€{item.price.toFixed(2)}</div>
                  <Badge variant={item.available ? "default" : "secondary"}>
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <Progress value={importProgress} />
            <p className="text-sm text-muted-foreground text-center">
              Importing menu items... {Math.round(importProgress)}%
            </p>
          </div>
        )}

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Ready to import {menuItems.length} menu items to {bars.find(b => b.id === selectedBar)?.name}.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Menu Import Wizard</h1>
        <p className="text-muted-foreground">
          Step {currentStep} of {totalSteps} - Import menu items for bars and restaurants
        </p>
      </div>

      <Progress value={progress} className="w-full" />

      <div className="space-y-6">
        {renderCurrentStep()}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedBar) ||
                (currentStep === 2 && !importSource) ||
                (currentStep === 3 && menuItems.length === 0)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleImport} 
              disabled={isProcessing || menuItems.length === 0}
              className="min-w-[120px]"
            >
              {isProcessing ? "Importing..." : "Import Menu"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuImportWizard; 