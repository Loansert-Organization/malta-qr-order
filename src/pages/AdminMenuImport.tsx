import React from 'react';
import { MenuDataImporter } from '@/components/admin/MenuDataImporter';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronLeft, Database } from 'lucide-react';

export default function AdminMenuImport() {
  const handleImportComplete = (summary: any) => {
    console.log('Import completed:', summary);
    // You could add additional logic here, like notifications or redirects
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Data Import</h1>
          <p className="text-gray-500">Import menu data for bars and restaurants</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/admin/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MenuDataImporter onImportComplete={handleImportComplete} />
        </div>
        
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Import Instructions
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Tab-Delimited Format</h3>
                <p className="text-sm text-gray-600">
                  Your data should be formatted with tabs separating each column:
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-x-auto">
                  Bar Name[tab]Category[tab]Subcategory[tab]Item Name[tab]Volume/Description[tab]Price
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">JSON Format</h3>
                <p className="text-sm text-gray-600">
                  Alternatively, you can upload a JSON array with this structure:
                </p>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`[
  {
    "bar": "Bar Name",
    "category": "Category",
    "subcategory": "Subcategory",
    "item": "Item Name",
    "volume": "250ml",
    "price": 2.5,
    "description": "Item description"
  },
  ...
]`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Volume vs Description</h3>
                <p className="text-sm text-gray-600">
                  For tab-delimited data, the system will automatically detect if the 5th column is a volume (e.g., "250ml") or a description.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Duplicate Handling</h3>
                <p className="text-sm text-gray-600">
                  Items with the same name in the same menu will be updated rather than duplicated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 