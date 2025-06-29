import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Search, Plus, Edit, Power, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminLogger } from '@/services/adminLoggingService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Bar {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  is_onboarded: boolean;
  google_rating: number | null;
  momo_code: string | null;
  revolut_link: string | null;
  created_at: string;
}

const AdminBars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bars, setBars] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    momo_code: '',
    revolut_link: ''
  });

  useEffect(() => {
    fetchBars();
  }, [countryFilter]);

  const fetchBars = async () => {
    try {
      let query = supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false });

      if (countryFilter !== 'all') {
        query = query.eq('country', countryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBars(data || []);
    } catch (error) {
      console.error('Error fetching bars:', error);
      toast({
        title: "Error",
        description: "Failed to load bars",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bar: Bar) => {
    setSelectedBar(bar);
    setFormData({
      name: bar.name,
      country: bar.country,
      momo_code: bar.momo_code || '',
      revolut_link: bar.revolut_link || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedBar) return;

    try {
      const { error } = await supabase
        .from('bars')
        .update({
          name: formData.name,
          country: formData.country,
          momo_code: formData.momo_code || null,
          revolut_link: formData.revolut_link || null
        })
        .eq('id', selectedBar.id);

      if (error) throw error;

      // Log the action
      await adminLogger.logBarAction('update', selectedBar.id, formData);

      toast({
        title: "Success",
        description: "Bar updated successfully",
      });

      setShowEditDialog(false);
      fetchBars();
    } catch (error) {
      console.error('Error updating bar:', error);
      toast({
        title: "Error",
        description: "Failed to update bar",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (bar: Bar) => {
    if (!bar.is_active) {
      // Activating
      try {
        const { error } = await supabase
          .from('bars')
          .update({ is_active: true })
          .eq('id', bar.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${bar.name} has been activated`,
        });

        fetchBars();
      } catch (error) {
        console.error('Error activating bar:', error);
        toast({
          title: "Error",
          description: "Failed to activate bar",
          variant: "destructive"
        });
      }
    } else {
      // Deactivating - show confirmation
      setSelectedBar(bar);
      setShowDeactivateDialog(true);
    }
  };

  const confirmDeactivate = async () => {
    if (!selectedBar) return;

    try {
      const { error } = await supabase
        .from('bars')
        .update({ is_active: false })
        .eq('id', selectedBar.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedBar.name} has been deactivated`,
      });

      setShowDeactivateDialog(false);
      fetchBars();
    } catch (error) {
      console.error('Error deactivating bar:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate bar",
        variant: "destructive"
      });
    }
  };

  const handleConfirmOnboarding = async (bar: Bar) => {
    try {
      const { error } = await supabase
        .from('bars')
        .update({ is_onboarded: true })
        .eq('id', bar.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${bar.name} onboarding confirmed`,
      });

      fetchBars();
    } catch (error) {
      console.error('Error confirming onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to confirm onboarding",
        variant: "destructive"
      });
    }
  };

  const filteredBars = bars.filter(bar =>
    bar.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bars...</p>
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
              <h1 className="text-2xl font-bold">Bar Management</h1>
            </div>
            <Button onClick={() => navigate('/admin/bars/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Bar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by bar name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="country">Country</Label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="Malta">Malta</SelectItem>
                    <SelectItem value="Rwanda">Rwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bars Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bars ({filteredBars.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bar Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBars.map((bar) => (
                    <TableRow key={bar.id}>
                      <TableCell className="font-medium">{bar.name}</TableCell>
                      <TableCell>{bar.country}</TableCell>
                      <TableCell>
                        <Badge className={bar.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {bar.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={bar.is_onboarded ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                          {bar.is_onboarded ? 'Completed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{bar.google_rating || 'N/A'}</TableCell>
                      <TableCell>
                        {bar.country === 'Rwanda' 
                          ? (bar.momo_code ? 'MoMo ✓' : 'MoMo ✗')
                          : (bar.revolut_link ? 'Revolut ✓' : 'Revolut ✗')
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(bar)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={bar.is_active ? "outline" : "default"}
                            onClick={() => handleToggleActive(bar)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          {!bar.is_onboarded && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleConfirmOnboarding(bar)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bar</DialogTitle>
            <DialogDescription>
              Update bar information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Bar Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-country">Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger id="edit-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Malta">Malta</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.country === 'Rwanda' ? (
              <div>
                <Label htmlFor="edit-momo">MoMo Code</Label>
                <Input
                  id="edit-momo"
                  value={formData.momo_code}
                  onChange={(e) => setFormData({ ...formData, momo_code: e.target.value })}
                  placeholder="182*1*1001"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="edit-revolut">Revolut Link</Label>
                <Input
                  id="edit-revolut"
                  value={formData.revolut_link}
                  onChange={(e) => setFormData({ ...formData, revolut_link: e.target.value })}
                  placeholder="https://revolut.me/barname"
                />
              </div>
            )}
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

      {/* Deactivate Confirmation */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Bar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate "{selectedBar?.name}"? 
              This will prevent customers from viewing and ordering from this bar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-red-600 hover:bg-red-700">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBars; 