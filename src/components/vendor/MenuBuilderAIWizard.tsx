
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, Image, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface ExtractedItem {
  name: string;
  price: number;
  category: string;
  description?: string;
  allergens?: string[];
  selected: boolean;
}

interface MenuBuilderAIWizardProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  onSuccess: () => void;
}

const MenuBuilderAIWizard: React.FC<MenuBuilderAIWizardProps> = ({
  isOpen,
  onClose,
  vendorId,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const processMenu = async () => {
    if (!uploadedFile) return;

    setProcessing(true);
    setCurrentStep('processing');
    setProgress(0);

    try {
      // Step 1: Upload file
      setProgress(25);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('vendor_id', vendorId);

      // Step 2: Extract menu items
      setProgress(50);
      const { data, error } = await supabase.functions.invoke('extract-menu-items', {
        body: formData
      });

      if (error) throw error;

      // Step 3: Process AI response
      setProgress(75);
      const items = data.items.map((item: any, index: number) => ({
        ...item,
        selected: true,
        id: `temp-${index}`
      }));

      setExtractedItems(items);
      setProgress(100);
      setCurrentStep('review');

    } catch (error) {
      console.error('Error processing menu:', error);
      toast.error('Failed to process menu. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    setExtractedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const selectAll = () => {
    setExtractedItems(prev => prev.map(item => ({ ...item, selected: true })));
  };

  const deselectAll = () => {
    setExtractedItems(prev => prev.map(item => ({ ...item, selected: false })));
  };

  const saveMenu = async () => {
    const selectedItems = extractedItems.filter(item => item.selected);
    
    try {
      setProcessing(true);
      
      // Create menu items in database
      const menuItems = selectedItems.map(item => ({
        vendor_id: vendorId,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        allergens: item.allergens || [],
        available: true
      }));

      const { error } = await supabase
        .from('menu_items')
        .insert(menuItems);

      if (error) throw error;

      setCurrentStep('complete');
      toast.success(`Successfully added ${selectedItems.length} menu items!`);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error saving menu:', error);
      toast.error('Failed to save menu items. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderUploadStep = () => (
    <div className="text-center space-y-6">
      <div>
        <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">AI Menu Extraction</h3>
        <p className="text-gray-600">Upload your menu and let AI extract all items automatically</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            id="menu-upload"
          />
          <label htmlFor="menu-upload" className="cursor-pointer">
            <div className="space-y-2">
              <Upload className="h-10 w-10 text-gray-400 mx-auto" />
              <p className="text-gray-600">Click to upload your menu</p>
              <p className="text-sm text-gray-500">PDF, JPG, or PNG files supported</p>
            </div>
          </label>
        </div>

        {uploadedFile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {uploadedFile.type.includes('pdf') ? (
                  <FileText className="h-8 w-8 text-red-600" />
                ) : (
                  <Image className="h-8 w-8 text-blue-600" />
                )}
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Button
        onClick={processMenu}
        disabled={!uploadedFile || processing}
        className="w-full"
      >
        Extract Menu Items
      </Button>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <div>
        <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold">Processing Your Menu</h3>
        <p className="text-gray-600">AI is extracting items, prices, and categories...</p>
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="text-sm text-gray-600 space-y-1">
          {progress >= 25 && <p>✓ File uploaded successfully</p>}
          {progress >= 50 && <p>✓ Analyzing menu structure</p>}
          {progress >= 75 && <p>✓ Extracting items and prices</p>}
          {progress >= 100 && <p>✓ Processing complete!</p>}
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Review Extracted Items</h3>
        <p className="text-gray-600">Select which items to add to your menu</p>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Found {extractedItems.length} items • {extractedItems.filter(i => i.selected).length} selected
        </p>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
          <Button size="sm" variant="outline" onClick={deselectAll}>Deselect All</Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {extractedItems.map((item, index) => (
          <Card key={index} className={`cursor-pointer transition-colors ${
            item.selected ? 'ring-2 ring-blue-500' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={item.selected}
                  onCheckedChange={() => toggleItemSelection(index)}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.allergens?.map(allergen => (
                          <Badge key={allergen} variant="outline" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="font-semibold text-lg">€{item.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={saveMenu}
        disabled={processing || extractedItems.filter(i => i.selected).length === 0}
        className="w-full"
      >
        Add {extractedItems.filter(i => i.selected).length} Items to Menu
      </Button>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div>
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">Menu Import Complete!</h3>
        <p className="text-gray-600">Your menu items have been successfully added</p>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <p className="text-green-800 text-sm">
          You can now edit individual items, add images, and manage availability from the Menu Builder.
        </p>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (currentStep) {
      case 'upload': return renderUploadStep();
      case 'processing': return renderProcessingStep();
      case 'review': return renderReviewStep();
      case 'complete': return renderCompleteStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Menu Builder</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {getStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuBuilderAIWizard;
