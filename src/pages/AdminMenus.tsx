import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Search, Edit, Trash, CheckCircle, Image as ImageIcon, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MenuItem {
  id: string;
  bar_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  is_available: boolean;
  is_reviewed: boolean;
}

interface Bar {
  id: string;
  name: string;
  country: string;
}

interface BarWithMenus {
  bar: Bar;
  pendingItems: MenuItem[];
  lastSubmission: string | null;
}

const AdminMenus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barsWithMenus, setBarsWithMenus] = useState<BarWithMenus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: ''
  });

  useEffect(() => {
    fetchPendingMenus();
  }, []);

  const fetchPendingMenus = async () => {
    try {
      // Get all bars
      const { data: bars, error: barsError } = await supabase
        .from('bars')
        .select('*')
        .eq('is_active', true);

      if (barsError) throw barsError;

      // Get pending menu items for each bar
      const barsWithPendingMenus: BarWithMenus[] = [];

      for (const bar of bars || []) {
        const { data: menuItems, error: menuError } = await supabase
          .from('menus')
          .select('*')
          .eq('bar_id', bar.id)
          .eq('is_reviewed', false)
          .order('created_at', { ascending: false });

        if (menuError) throw menuError;

        if (menuItems && menuItems.length > 0) {
          barsWithPendingMenus.push({
            bar,
            pendingItems: menuItems,
            lastSubmission: menuItems[0].created_at
          });
        }
      }

      setBarsWithMenus(barsWithPendingMenus);
    } catch (error) {
      console.error('Error fetching pending menus:', error);
      toast({
        title: "Error",
        description: "Failed to load pending menus",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (barWithMenus: BarWithMenus) => {
    setSelectedBar(barWithMenus.bar);
    setSelectedItems(barWithMenus.pendingItems);
    setShowReviewDialog(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setEditFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      image_url: item.image_url || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('menus')
        .update({
          name: editFormData.name,
          description: editFormData.description || null,
          price: editFormData.price,
          category: editFormData.category,
          image_url: editFormData.image_url || null
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      // Update local state
      setSelectedItems(selectedItems.map(item => 
        item.id === selectedItem.id 
          ? { ...item, ...editFormData }
          : item
      ));

      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });

      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      // Update local state
      setSelectedItems(selectedItems.filter(item => item.id !== selectedItem.id));

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });

      setShowDeleteDialog(false);
      
      // If no items left, close review dialog
      if (selectedItems.length === 1) {
        setShowReviewDialog(false);
        fetchPendingMenus();
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const handleApproveAll = async () => {
    if (!selectedBar) return;

    try {
      const { error } = await supabase
        .from('menus')
        .update({
          is_reviewed: true,
          reviewed_at: new Date().toISOString()
        })
        .eq('bar_id', selectedBar.id)
        .eq('is_reviewed', false);

      if (error) throw error;

      toast({
        title: "Success",
        description: `All menu items for ${selectedBar.name} have been approved`,
      });

      setShowReviewDialog(false);
      fetchPendingMenus();
    } catch (error) {
      console.error('Error approving menu items:', error);
      toast({
        title: "Error",
        description: "Failed to approve menu items",
        variant: "destructive"
      });
    }
  };

  const handleGenerateImage = async (item: MenuItem) => {
    try {
      // Call the AI image generation edge function
      const { data, error } = await supabase.functions.invoke('generate-menu-image', {
        body: {
          menuItemId: item.id,
          itemName: item.name,
          itemDescription: item.description
        }
      });

      if (error) throw error;

      // Update local state with the new image URL
      setSelectedItems(selectedItems.map(menuItem => 
        menuItem.id === item.id 
          ? { ...menuItem, image_url: data.imageUrl }
          : menuItem
      ));

      toast({
        title: "Success",
        description: "AI-generated image created successfully",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Fallback to placeholder if AI generation fails
      const placeholderUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`;
      
      const { error: updateError } = await supabase
        .from('menus')
        .update({ image_url: placeholderUrl })
        .eq('id', item.id);

      if (!updateError) {
        setSelectedItems(selectedItems.map(menuItem => 
          menuItem.id === item.id 
            ? { ...menuItem, image_url: placeholderUrl }
            : menuItem
        ));
      }

      toast({
        title: "Warning",
        description: "AI generation failed, using placeholder image",
        variant: "destructive"
      });
    }
  };

  const filteredBars = barsWithMenus.filter(item =>
    item.bar.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Menu Moderation</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by bar name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pending Menus */}
        <Card>
          <CardHeader>
            <CardTitle>Bars with Pending Menus ({filteredBars.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBars.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending menus to review
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bar Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Pending Items</TableHead>
                      <TableHead>Last Submission</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBars.map((item) => (
                      <TableRow key={item.bar.id}>
                        <TableCell className="font-medium">{item.bar.name}</TableCell>
                        <TableCell>{item.bar.country}</TableCell>
                        <TableCell>
                          <Badge className="bg-orange-100 text-orange-800">
                            {item.pendingItems.length} items
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.lastSubmission 
                            ? new Date(item.lastSubmission).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleReview(item)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Menu - {selectedBar?.name}</DialogTitle>
            <DialogDescription>
              Review and approve menu items for this bar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                          <div className="flex gap-4 mt-2">
                            <Badge variant="secondary">{item.category}</Badge>
                            <span className="font-semibold">
                              {selectedBar?.country === 'Rwanda' ? 'RWF' : '€'} {item.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!item.image_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateImage(item)}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveAll}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={editFormData.image_url}
                onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMenus; 