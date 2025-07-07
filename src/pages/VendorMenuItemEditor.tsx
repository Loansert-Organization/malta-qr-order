import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Clock
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  bar_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  preparation_time?: number;
  allergens?: string[];
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  created_at: string;
  updated_at: string;
}

const VendorMenuItemEditor = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewItem, setIsNewItem] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    available: true,
    preparation_time: 15,
    allergens: [] as string[],
    nutritional_info: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });

  const categories = [
    'Appetizers',
    'Main Course',
    'Desserts',
    'Beverages',
    'Alcoholic Drinks',
    'Snacks',
    'Sides',
    'Specials'
  ];

  const allergenOptions = [
    'Gluten',
    'Dairy',
    'Eggs',
    'Fish',
    'Shellfish',
    'Tree Nuts',
    'Peanuts',
    'Soy',
    'Wheat'
  ];

  useEffect(() => {
    if (itemId === 'new') {
      setIsNewItem(true);
      setLoading(false);
    } else {
      fetchMenuItem();
    }
  }, [itemId]);

  const fetchMenuItem = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get the bar_id for the current vendor
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (barError || !barData) {
        setError('Bar not found');
        setLoading(false);
        return;
      }

      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemId)
        .eq('bar_id', barData.id)
        .single();

      if (itemError) {
        if (itemError.code === 'PGRST116') {
          setError('Menu item not found');
        } else {
          setError(`Failed to load menu item: ${itemError.message}`);
        }
        setLoading(false);
        return;
      }

      setMenuItem(itemData);
      setFormData({
        name: itemData.name || '',
        description: itemData.description || '',
        price: itemData.price || 0,
        category: itemData.category || '',
        image_url: itemData.image_url || '',
        available: itemData.available ?? true,
        preparation_time: itemData.preparation_time || 15,
        allergens: itemData.allergens || [],
        nutritional_info: itemData.nutritional_info || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      });
    } catch (error) {
      console.error('Error fetching menu item:', error);
      setError('Failed to load menu item');
    } finally {
      setLoading(false);
    }
  };

  const saveMenuItem = async () => {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Get the bar_id for the current vendor
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (barError || !barData) {
        toast({
          title: "Error",
          description: "Bar not found",
          variant: "destructive"
        });
        return;
      }

      const menuItemData = {
        bar_id: barData.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image_url: formData.image_url,
        available: formData.available,
        preparation_time: formData.preparation_time,
        allergens: formData.allergens,
        nutritional_info: formData.nutritional_info,
        updated_at: new Date().toISOString()
      };

      let result;
      if (isNewItem) {
        result = await supabase
          .from('menu_items')
          .insert([menuItemData])
          .select()
          .single();
      } else {
        result = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', itemId)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: `Menu item ${isNewItem ? 'created' : 'updated'} successfully`,
      });

      navigate('/vendor/menu');
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNewItem ? 'create' : 'update'} menu item`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteMenuItem = async () => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });

      navigate('/vendor/menu');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const updateNutritionalInfo = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutritional_info: {
        ...prev.nutritional_info,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => navigate('/vendor/menu')}
            >
              Back to Menu
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/vendor/menu')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {isNewItem ? 'Add New Menu Item' : 'Edit Menu Item'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isNewItem ? 'Create a new menu item for your establishment' : 'Update menu item details'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isNewItem && (
                <Button
                  variant="destructive"
                  onClick={deleteMenuItem}
                  disabled={saving}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                onClick={saveMenuItem}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your menu item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Margherita Pizza"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your menu item..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preparation_time">Preparation Time (minutes)</Label>
                    <Input
                      id="preparation_time"
                      type="number"
                      min="0"
                      value={formData.preparation_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, preparation_time: parseInt(e.target.value) || 0 }))}
                      placeholder="15"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Available</Label>
                      <p className="text-xs text-gray-600">Is this item currently available?</p>
                    </div>
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Item Image</CardTitle>
                <CardDescription>
                  Add a photo of your menu item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  {formData.image_url && (
                    <div className="flex items-center justify-center p-4 border rounded-lg">
                      <img 
                        src={formData.image_url} 
                        alt="Menu item preview"
                        className="max-w-full max-h-48 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Allergens */}
            <Card>
              <CardHeader>
                <CardTitle>Allergens</CardTitle>
                <CardDescription>
                  Select any allergens present in this item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allergenOptions.map(allergen => (
                    <Button
                      key={allergen}
                      variant={formData.allergens.includes(allergen) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleAllergen(allergen)}
                      className="justify-start"
                    >
                      {formData.allergens.includes(allergen) && (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {allergen}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutritional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Information</CardTitle>
                <CardDescription>
                  Optional nutritional details (per serving)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      value={formData.nutritional_info.calories}
                      onChange={(e) => updateNutritionalInfo('calories', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritional_info.protein}
                      onChange={(e) => updateNutritionalInfo('protein', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritional_info.carbs}
                      onChange={(e) => updateNutritionalInfo('carbs', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.nutritional_info.fat}
                      onChange={(e) => updateNutritionalInfo('fat', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  How your menu item will appear to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.image_url && (
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={formData.image_url} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-lg">{formData.name || 'Item Name'}</h3>
                    <p className="text-gray-600 text-sm">{formData.description || 'Description'}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">€{formData.price.toFixed(2)}</span>
                    <Badge variant={formData.available ? 'default' : 'secondary'}>
                      {formData.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  {formData.category && (
                    <Badge variant="outline">{formData.category}</Badge>
                  )}
                  
                  {formData.preparation_time && formData.preparation_time > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formData.preparation_time} min
                    </div>
                  )}
                  
                  {formData.allergens.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Allergens:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.allergens.map(allergen => (
                          <Badge key={allergen} variant="destructive" className="text-xs">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/vendor/menu')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Menu
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                      category: '',
                      image_url: '',
                      available: true,
                      preparation_time: 15,
                      allergens: [],
                      nutritional_info: {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0
                      }
                    });
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Form
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorMenuItemEditor; 