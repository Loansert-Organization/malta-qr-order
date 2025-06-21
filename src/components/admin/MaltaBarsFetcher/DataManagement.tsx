
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Download, Upload, Loader2 } from 'lucide-react';

interface DataManagementProps {
  isLoading: boolean;
  onExportData: () => void;
  onCleanupDuplicates: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  isLoading,
  onExportData,
  onCleanupDuplicates
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management & Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export & Backup
            </h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExportData}
                className="w-full justify-start"
              >
                Export Bars to CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {}}
                className="w-full justify-start"
              >
                Create Database Backup
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Data Quality
            </h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCleanupDuplicates}
                disabled={isLoading}
                className="w-full justify-start"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Remove Duplicates
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full justify-start"
              >
                Validate Data Quality
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
