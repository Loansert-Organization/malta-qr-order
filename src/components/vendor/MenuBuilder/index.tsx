
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Plus, Edit, Trash2, Save, Image, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  popular: boolean;
  prep_time?: string;
}

interface MenuBuilderProps {
  vendorId: string;
  menuId: string;
  initialItems?: MenuItem[];
}

const MenuBuilder: React.FC<MenuBuilderProps> = ({ vendorId, menuId, initialItems = [] }) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vendor_id', vendorId);

      const { data, error } = await supabase.functions.invoke('extract-menu-items', {
        body: formData
      });

      if (error) throw error;

      if (data?.items) {
        setMenuItems(prev => [...prev, ...data.items]);
        toast({
          title: "Menu extracted successfully",
          description: `${data.items.length} items extracted from ${file.name}`,
        });
      }
    } catch (error) {
      console.error('Error extracting menu:', error);
      toast({
        title: "Extraction failed",
        description: "Could not extract menu items from the file",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
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
            prep_time: item.prep_time
          })
          .eq('id', item.id);

        if (error) throw error;
        
        setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('menu_items')
          .insert({
            menu_id: menuId,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image_url: item.image_url,
            available: item.available,
            popular: item.popular,
            prep_time: item.prep_time
          })
          .select()
          .single();

        if (error) throw error;
        
        setMenuItems(prev => [...prev, data]);
      }

      setEditingItem(null);
      toast({
        title: "Item saved",
        description: "Menu item has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Save failed",
        description: "Could not save menu item",
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

      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item deleted",
        description: "Menu item has been removed",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete menu item",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const newItems = [...menuItems];
    const draggedItemData = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(targetIndex, 0, draggedItemData);
    
    setMenuItems(newItems);
    setDraggedItem(null);
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            AI Menu Extraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              {isExtracting ? (
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              ) : (
                <>
                  <FileText className="h-12 w-12 text-gray-400" />
                  <Image className="h-8 w-8 text-gray-400" />
                </>
              )}
              <div>
                <h3 className="text-lg font-medium">Upload Menu PDF or Image</h3>
                <p className="text-gray-500">AI will extract menu items automatically</p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="menu-upload"
                disabled={isExtracting}
              />
              <Button asChild disabled={isExtracting}>
                <label htmlFor="menu-upload" className="cursor-pointer">
                  {isExtracting ? 'Extracting...' : 'Choose File'}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Menu Items</CardTitle>
            <Button onClick={() => setEditingItem({
              name: '',
              description: '',
              price: 0,
              category: '',
              available: true,
              popular: false
            })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 text-blue-600">{category}</h3>
                <div className="grid gap-4">
                  {menuItems
                    .filter(item => item.category === category)
                    .map((item, index) => (
                      <div
                        key={item.id || index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-move"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              {item.popular && <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>}
                              {!item.available && <Badge variant="secondary">Out of Stock</Badge>}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-medium text-green-600">€{item.price.toFixed(2)}</span>
                              {item.prep_time && <span>⏱️ {item.prep_time}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => item.id && handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingItem.id ? 'Edit Item' : 'Add New Item'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  placeholder="Item description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                    placeholder="e.g., Mains, Drinks, Desserts"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prep Time</label>
                  <Input
                    value={editingItem.prep_time || ''}
                    onChange={(e) => setEditingItem({...editingItem, prep_time: e.target.value})}
                    placeholder="e.g., 15 min"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingItem.available}
                    onChange={(e) => setEditingItem({...editingItem, available: e.target.checked})}
                  />
                  <span className="text-sm">Available</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingItem.popular}
                    onChange={(e) => setEditingItem({...editingItem, popular: e.target.checked})}
                  />
                  <span className="text-sm">Popular Item</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveItem(editingItem)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MenuBuilder;
