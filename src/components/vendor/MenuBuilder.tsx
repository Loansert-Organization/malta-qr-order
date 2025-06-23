
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save,
  Eye,
  EyeOff,
  Wand2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  popular: boolean;
}

interface MenuBuilderProps {
  vendorId: string;
  menuId: string;
}

const MenuBuilder: React.FC<MenuBuilderProps> = ({
  vendorId,
  menuId
}) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    'Starters', 'Mains', 'Desserts', 'Drinks', 'Cocktails', 'Beer', 'Wine'
  ]);

  const emptyItem: MenuItem = {
    name: '',
    description: '',
    price: 0,
    category: 'Mains',
    available: true,
    popular: false
  };

  useEffect(() => {
    fetchMenuItems();
  }, [menuId]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_id', menuId)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: MenuItem) => {
    try {
      if (item.id) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image_url: item.image_url,
            available: item.available,
            popular: item.popular,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert({
            menu_id: menuId,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image_url: item.image_url,
            available: item.available,
            popular: item.popular
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Menu item ${item.id ? 'updated' : 'created'} successfully`,
      });

      setShowForm(false);
      setEditingItem(null);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });

      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const handleAIMenuExtraction = async () => {
    try {
      toast({
        title: "AI Processing",
        description: "Extracting menu items from uploaded content...",
      });

      const { data, error } = await supabase.functions.invoke('extract-menu-items', {
        body: { vendorId, menuId }
      });

      if (error) throw error;

      toast({
        title: "AI Extraction Complete",
        description: `Found ${data.itemsCount} menu items`,
      });

      fetchMenuItems();
    } catch (error) {
      console.error('Error with AI extraction:', error);
      toast({
        title: "Error",
        description: "AI menu extraction failed",
        variant: "destructive"
      });
    }
  };

  const ItemForm = ({ item, onSave, onCancel }: {
    item: MenuItem;
    onSave: (item: MenuItem) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(item);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{item.id ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this menu item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label htmlFor="available">Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="popular"
                checked={formData.popular}
                onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
              />
              <Label htmlFor="popular">Popular Item</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Item
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Menu Builder</h1>
        <div className="flex gap-2">
          <Button onClick={handleAIMenuExtraction} variant="outline" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Extract from PDF
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <ItemForm
          item={editingItem || emptyItem}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-blue-600">€{item.price.toFixed(2)}</span>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </div>
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg ml-3"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {item.available ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      Unavailable
                    </Badge>
                  )}
                  {item.popular && (
                    <Badge variant="destructive">Popular</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingItem(item);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteItem(item.id!)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {menuItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
            <p className="text-gray-600 mb-4">Start building your menu by adding items or using AI extraction</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
              <Button variant="outline" onClick={handleAIMenuExtraction}>
                <Wand2 className="h-4 w-4 mr-2" />
                Extract from PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MenuBuilder;
