import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  Link,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Download,
  Search,
  Camera,
  FileImage,
  FilePdf,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './AdminLayout';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  allergens?: string[];
  dietary_tags?: string[];
}

interface MenuData {
  id?: string;
  bar_id: string;
  bar_name: string;
  name: string;
  description?: string;
  items: MenuItem[];
  categories: string[];
  confirmed: boolean;
  created_at?: string;
}

interface ImportSource {
  type: 'file' | 'url' | 'api' | 'manual';
  data?: File | string;
  name?: string;
}

const steps = [
  { id: 1, title: 'Select Source', description: 'Choose import method' },
  { id: 2, title: 'Upload & Process', description: 'Upload and OCR processing' },
  { id: 3, title: 'Preview & Edit', description: 'Review and edit extracted data' },
  { id: 4, title: 'Generate Images', description: 'Create missing images' },
  { id: 5, title: 'Review & Submit', description: 'Final review and save' },
];

const categories = [
  'Appetizers', 'Starters', 'Main Course', 'Desserts', 'Drinks', 'Cocktails',
  'Beer', 'Wine', 'Coffee', 'Tea', 'Snacks', 'Sides', 'Salads', 'Soups'
];

const bars = [
  { id: '1', name: 'The Blue Bar', location: 'Valletta, Malta' },
  { id: '2', name: 'Cafe Luna', location: 'Sliema, Malta' },
  { id: '3', name: 'The Grand Hotel Bar', location: 'St. Julian\'s, Malta' },
];

const MenuImportWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBar, setSelectedBar] = useState('');
  const [importSource, setImportSource] = useState<ImportSource | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock OCR processing
  const processMenuFile = async (file: File) => {
    setProcessing(true);
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted data
      const mockItems: MenuItem[] = [
        {
          id: '1',
          name: 'Margherita Pizza',
          description: 'Fresh tomato sauce, mozzarella, basil',
          price: 12.50,
          category: 'Main Course',
          available: true,
          allergens: ['gluten', 'dairy'],
          dietary_tags: ['vegetarian']
        },
        {
          id: '2',
          name: 'Caesar Salad',
          description: 'Romaine lettuce, parmesan, croutons, caesar dressing',
          price: 8.90,
          category: 'Salads',
          available: true,
          allergens: ['gluten', 'dairy', 'eggs'],
          dietary_tags: ['vegetarian']
        },
        {
          id: '3',
          name: 'Espresso',
          description: 'Single shot of premium Italian coffee',
          price: 2.50,
          category: 'Coffee',
          available: true,
          allergens: [],
          dietary_tags: ['vegan', 'gluten-free']
        },
        {
          id: '4',
          name: 'Aperol Spritz',
          description: 'Aperol, prosecco, soda water, orange slice',
          price: 7.50,
          category: 'Cocktails',
          available: true,
          allergens: [],
          dietary_tags: ['vegan', 'gluten-free']
        }
      ];

      const extractedData: MenuData = {
        bar_id: selectedBar,
        bar_name: bars.find(b => b.id === selectedBar)?.name || '',
        name: `${file.name.split('.')[0]} Menu`,
        description: `Menu imported from ${file.name}`,
        items: mockItems,
        categories: [...new Set(mockItems.map(item => item.category))],
        confirmed: false,
      };

      setMenuData(extractedData);
      toast({
        title: "Processing complete",
        description: `Extracted ${mockItems.length} items from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process menu file",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const processMenuUrl = async (url: string) => {
    setProcessing(true);
    try {
      // Simulate URL processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data from URL
      const mockItems: MenuItem[] = [
        {
          id: '1',
          name: 'Burger Deluxe',
          description: 'Angus beef, cheddar, bacon, special sauce',
          price: 15.90,
          category: 'Main Course',
          available: true,
          allergens: ['gluten', 'dairy', 'eggs'],
          dietary_tags: []
        },
        {
          id: '2',
          name: 'Fish & Chips',
          description: 'Fresh cod, beer batter, hand-cut fries',
          price: 13.50,
          category: 'Main Course',
          available: true,
          allergens: ['gluten', 'fish'],
          dietary_tags: []
        }
      ];

      const extractedData: MenuData = {
        bar_id: selectedBar,
        bar_name: bars.find(b => b.id === selectedBar)?.name || '',
        name: 'Online Menu',
        description: `Menu imported from ${url}`,
        items: mockItems,
        categories: [...new Set(mockItems.map(item => item.category))],
        confirmed: false,
      };

      setMenuData(extractedData);
      toast({
        title: "Processing complete",
        description: `Extracted ${mockItems.length} items from URL`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process menu URL",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportSource({ type: 'file', data: file, name: file.name });
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (url.trim()) {
      setImportSource({ type: 'url', data: url, name: 'URL Import' });
    }
  };

  const handleProcess = async () => {
    if (!importSource || !selectedBar) {
      toast({
        title: "Missing information",
        description: "Please select a bar and import source",
        variant: "destructive"
      });
      return;
    }

    if (importSource.type === 'file' && importSource.data instanceof File) {
      await processMenuFile(importSource.data);
    } else if (importSource.type === 'url' && typeof importSource.data === 'string') {
      await processMenuUrl(importSource.data);
    }
  };

  const generateMissingImages = async () => {
    if (!menuData) return;
    
    setGeneratingImages(true);
    try {
      // Simulate image generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedItems = menuData.items.map(item => ({
        ...item,
        image: item.image || `https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=${encodeURIComponent(item.name)}`
      }));

      setMenuData({ ...menuData, items: updatedItems });
      toast({
        title: "Images generated",
        description: "All missing images have been created",
      });
    } catch (error) {
      toast({
        title: "Image generation failed",
        description: "Failed to generate some images",
        variant: "destructive"
      });
    } finally {
      setGeneratingImages(false);
    }
  };

  const saveToDatabase = async () => {
    if (!menuData) return;
    
    setSaving(true);
    try {
      // Simulate database save
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call your Supabase/Firestore API
      console.log('Saving menu:', menuData);
      
      toast({
        title: "Success!",
        description: `Menu with ${menuData.items.length} items has been saved`,
      });
      
      navigate('/admin/menus');
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save menu to database",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const editMenuItem = (item: MenuItem) => {
    setEditingItem({ ...item });
  };

  const saveMenuItem = () => {
    if (!editingItem || !menuData) return;
    
    setMenuData({
      ...menuData,
      items: menuData.items.map(item => 
        item.id === editingItem.id ? editingItem : item
      )
    });
    setEditingItem(null);
    toast({
      title: "Item updated",
      description: "Menu item has been saved",
    });
  };

  const addMenuItem = () => {
    if (!menuData) return;
    
    const newItem: MenuItem = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      category: 'Main Course',
      available: true,
      allergens: [],
      dietary_tags: []
    };
    
    setMenuData({
      ...menuData,
      items: [...menuData.items, newItem]
    });
    setEditingItem(newItem);
  };

  const removeMenuItem = (itemId: string) => {
    if (!menuData) return;
    
    setMenuData({
      ...menuData,
      items: menuData.items.filter(item => item.id !== itemId)
    });
    toast({
      title: "Item removed",
      description: "Menu item has been deleted",
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-4
                ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Bar</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBar} onValueChange={setSelectedBar}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a bar" />
            </SelectTrigger>
            <SelectContent>
              {bars.map(bar => (
                <SelectItem key={bar.id} value={bar.id}>
                  <div>
                    <div className="font-medium">{bar.name}</div>
                    <div className="text-sm text-gray-500">{bar.location}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose Import Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileImage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Upload Menu File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload PDF or image files (JPG, PNG, PDF)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
            {importSource?.type === 'file' && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {importSource.name}
              </p>
            )}
          </div>

          {/* URL Import */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Import from URL</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter menu URL"
                onChange={(e) => handleUrlSubmit(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline"
                onClick={() => handleUrlSubmit('https://example.com/menu')}
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Manual Entry</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Create menu items manually
            </p>
            <Button 
              variant="outline"
              onClick={() => setImportSource({ type: 'manual' })}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Start Manual Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={nextStep} 
          disabled={!selectedBar || !importSource}
          className="flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Process Menu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!menuData ? (
          <div className="text-center py-8">
            <div className="mb-4">
              {processing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              ) : (
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
              )}
            </div>
            <h3 className="font-medium mb-2">
              {processing ? 'Processing Menu...' : 'Ready to Process'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {processing 
                ? 'Extracting menu items using AI OCR...' 
                : 'Click process to extract menu items from your source'
              }
            </p>
            {!processing && (
              <Button 
                onClick={handleProcess}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Process Menu
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Processing Complete!</h4>
              <p className="text-green-700">
                Successfully extracted {menuData.items.length} items from {importSource?.name}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Menu Summary</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Items Found:</strong> {menuData.items.length}</div>
                  <div><strong>Categories:</strong> {menuData.categories.length}</div>
                  <div><strong>Price Range:</strong> €{Math.min(...menuData.items.map(i => i.price)).toFixed(2)} - €{Math.max(...menuData.items.map(i => i.price)).toFixed(2)}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Categories Found</h4>
                <div className="flex flex-wrap gap-1">
                  {menuData.categories.map(cat => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={!menuData}
            className="flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {editingItem ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Menu Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name">Name</Label>
                <Input
                  id="item-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="item-price">Price (€)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="item-category">Category</Label>
              <Select 
                value={editingItem.category} 
                onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={saveMenuItem} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Preview & Edit Menu Items</CardTitle>
              <Button onClick={addMenuItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menuData?.items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">€{item.price.toFixed(2)}</span>
                        {item.allergens && item.allergens.length > 0 && (
                          <span className="text-red-600">
                            Allergens: {item.allergens.join(', ')}
                          </span>
                        )}
                        {item.dietary_tags && item.dietary_tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.dietary_tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => editMenuItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMenuItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={!menuData || menuData.items.length === 0}
          className="flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Generate Missing Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Image Generation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Generate AI-powered images for menu items that don't have photos
          </p>
          <Button 
            onClick={generateMissingImages}
            disabled={generatingImages}
            className="flex items-center gap-2"
          >
            {generatingImages ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {generatingImages ? 'Generating...' : 'Generate Images'}
          </Button>
        </div>

        {menuData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuData.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No image</p>
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-sm">{item.name}</h4>
                <p className="text-xs text-gray-600">€{item.price.toFixed(2)}</p>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={!menuData}
            className="flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Menu Summary</h4>
          <p className="text-blue-700">
            You are about to save a menu with {menuData?.items.length} items to {menuData?.bar_name}.
          </p>
        </div>

        {menuData && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{menuData.items.length}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{menuData.categories.length}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  €{menuData.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Menu Items Preview</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {menuData.items.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€{item.price.toFixed(2)}</div>
                      <Badge variant={item.available ? "default" : "secondary"} className="text-xs">
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {menuData.items.length > 5 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    ... and {menuData.items.length - 5} more items
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={saveToDatabase} 
            disabled={saving || !menuData}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save to Database'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  return (
    <AdminLayout 
      title="Menu Import Wizard" 
      subtitle={`Step ${currentStep} of ${steps.length}`}
      showBackButton
    >
      <div className="max-w-4xl mx-auto">
        {renderStepIndicator()}
        {renderCurrentStep()}
      </div>
    </AdminLayout>
  );
};

export default MenuImportWizard; 