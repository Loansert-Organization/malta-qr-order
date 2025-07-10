import React from 'react';
import { MenuMT1Importer } from '@/components/admin/MenuMT1Importer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Euro,
  Clock,
  MapPin
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
  barsProcessed?: string[];
}

export default function AdminMenuMT1Import() {
  const handleImportComplete = (result: ImportResult) => {
    console.log('Import completed:', result);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MenuMT1 CSV Import</h1>
          <p className="text-gray-600 mt-2">
            Import the complete MenuMT1 dataset with 2,534 menu items from Malta restaurants
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <FileText className="w-3 h-3 mr-1" />
          CSV Import
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MenuMT1Importer onImportComplete={handleImportComplete} />
        </div>
        
        <div className="space-y-6">
          {/* Dataset Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dataset Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2,534</div>
                  <div className="text-sm text-gray-600">Menu Items</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">4</div>
                  <div className="text-sm text-gray-600">Restaurants</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span>Multiple categories per restaurant</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="h-4 w-4 text-gray-500" />
                  <span>Price range: €2.60 - €59.00</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>All locations in Malta</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expected Restaurants */}
          <Card>
            <CardHeader>
              <CardTitle>Included Restaurants</CardTitle>
              <CardDescription>
                The following restaurants are included in the MenuMT1 dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  name: 'The Londoner British Pub Sliema',
                  items: '~100 items',
                  categories: 'STARTERS, BURGERS, GRILLS, DESSERTS, BEERS'
                },
                {
                  name: 'Mamma Mia',
                  items: '~80 items',
                  categories: 'RIBS & DIPPERS, SALADS, PASTA, PIZZA'
                },
                {
                  name: 'The Brew Bar Grill',
                  items: '~60 items',
                  categories: 'APPETIZERS, BURGERS, GRILL, HOMEMADE BEER'
                },
                {
                  name: 'Okurama Asian Fusion',
                  items: '~40 items',
                  categories: 'SUSHI NIGIRI, SUSHI GUNKAN, CHEF\'S SPECIALS'
                }
              ].map((restaurant, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{restaurant.name}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    {restaurant.items} • {restaurant.categories}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Import Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Import Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Before Import</AlertTitle>
                <AlertDescription>
                  Ensure you have the MenuMT1 - Sheet1.csv file ready. The import will:
                </AlertDescription>
              </Alert>
              
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Create/update restaurant records</li>
                <li>• Generate vendor profiles</li>
                <li>• Create menu structures</li>
                <li>• Import all 2,534 menu items</li>
                <li>• Map categories to subcategories</li>
                <li>• Generate placeholder images</li>
              </ul>
            </CardContent>
          </Card>

          {/* CSV Format */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p><strong>Header:</strong> Bar name,Category,Item name,Description,Price</p>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  The Londoner British Pub Sliema,STARTERS,Vegetable Spring Rolls (V),Served with sweet chilli dip,7.95
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 