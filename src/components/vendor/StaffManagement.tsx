
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  Edit2, 
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Key
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface StaffMember {
  id: string;
  user_id: string;
  vendor_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: 'owner' | 'manager' | 'staff' | 'kitchen';
  permissions: {
    manage_menu: boolean;
    manage_orders: boolean;
    manage_staff: boolean;
    view_analytics: boolean;
    manage_payments: boolean;
  };
  status: 'active' | 'inactive' | 'pending';
  invited_at: string;
  last_active?: string;
  hourly_rate?: number;
  shift_schedule?: {
    monday: { start: string; end: string; } | null;
    tuesday: { start: string; end: string; } | null;
    wednesday: { start: string; end: string; } | null;
    thursday: { start: string; end: string; } | null;
    friday: { start: string; end: string; } | null;
    saturday: { start: string; end: string; } | null;
    sunday: { start: string; end: string; } | null;
  };
}

interface StaffManagementProps {
  vendorId: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ vendorId }) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaffData, setNewStaffData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    role: 'staff' as const,
    hourly_rate: 10
  });

  useEffect(() => {
    fetchStaffMembers();
  }, [vendorId]);

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_staff')
        .select(`
          *,
          staff_permissions(*),
          staff_schedules(*)
        `)
        .eq('vendor_id', vendorId)
        .order('invited_at', { ascending: false });

      if (error) throw error;

      const transformedStaff: StaffMember[] = data?.map(staff => ({
        ...staff,
        permissions: staff.staff_permissions?.[0] || {
          manage_menu: false,
          manage_orders: false,
          manage_staff: false,
          view_analytics: false,
          manage_payments: false
        },
        shift_schedule: staff.staff_schedules?.[0]?.schedule || {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null
        }
      })) || [];

      setStaffMembers(transformedStaff);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const inviteStaffMember = async () => {
    try {
      if (!newStaffData.email || !newStaffData.full_name) {
        toast.error('Email and name are required');
        return;
      }

      // Send invitation
      const { data, error } = await supabase.functions.invoke('invite-staff-member', {
        body: {
          vendorId,
          ...newStaffData,
          permissions: getDefaultPermissions(newStaffData.role)
        }
      });

      if (error) throw error;

      toast.success('Staff invitation sent successfully');
      setShowAddDialog(false);
      setNewStaffData({
        email: '',
        full_name: '',
        phone_number: '',
        role: 'staff',
        hourly_rate: 10
      });
      fetchStaffMembers();
    } catch (error) {
      console.error('Error inviting staff member:', error);
      toast.error('Failed to send invitation');
    }
  };

  const updateStaffMember = async (staffId: string, updates: Partial<StaffMember>) => {
    try {
      const { error } = await supabase
        .from('vendor_staff')
        .update(updates)
        .eq('id', staffId);

      if (error) throw error;

      // Update permissions if they changed
      if (updates.permissions) {
        await supabase
          .from('staff_permissions')
          .upsert({
            staff_id: staffId,
            ...updates.permissions
          });
      }

      toast.success('Staff member updated successfully');
      fetchStaffMembers();
      setEditingStaff(null);
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast.error('Failed to update staff member');
    }
  };

  const removeStaffMember = async (staffId: string) => {
    try {
      if (!confirm('Are you sure you want to remove this staff member?')) {
        return;
      }

      const { error } = await supabase
        .from('vendor_staff')
        .update({ status: 'inactive' })
        .eq('id', staffId);

      if (error) throw error;

      toast.success('Staff member removed successfully');
      fetchStaffMembers();
    } catch (error) {
      console.error('Error removing staff member:', error);
      toast.error('Failed to remove staff member');
    }
  };

  const resetStaffPassword = async (staffId: string) => {
    try {
      const { error } = await supabase.functions.invoke('reset-staff-password', {
        body: { staffId }
      });

      if (error) throw error;

      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'owner':
        return {
          manage_menu: true,
          manage_orders: true,
          manage_staff: true,
          view_analytics: true,
          manage_payments: true
        };
      case 'manager':
        return {
          manage_menu: true,
          manage_orders: true,
          manage_staff: false,
          view_analytics: true,
          manage_payments: false
        };
      case 'kitchen':
        return {
          manage_menu: false,
          manage_orders: true,
          manage_staff: false,
          view_analytics: false,
          manage_payments: false
        };
      default:
        return {
          manage_menu: false,
          manage_orders: true,
          manage_staff: false,
          view_analytics: false,
          manage_payments: false
        };
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
      kitchen: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[role as keyof typeof colors]}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Staff Management</h2>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Invite Staff</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address*</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="staff@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="full_name">Full Name*</Label>
                <Input
                  id="full_name"
                  value={newStaffData.full_name}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newStaffData.phone_number}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+356 1234 5678"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={newStaffData.role} onValueChange={(value: any) => setNewStaffData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="kitchen">Kitchen Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate (€)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  min="0"
                  step="0.5"
                  value={newStaffData.hourly_rate}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) }))}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={inviteStaffMember} className="flex-1">
                  Send Invitation
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{staffMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {staffMembers.filter(s => s.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {staffMembers.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-blue-600">
                  {staffMembers.filter(s => s.role === 'manager' || s.role === 'owner').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        {['all', 'active', 'pending', 'inactive'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {staffMembers
              .filter(staff => status === 'all' || staff.status === status)
              .map(staff => (
                <Card key={staff.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{staff.full_name}</h3>
                          {getRoleBadge(staff.role)}
                          {getStatusBadge(staff.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{staff.email}</span>
                          </div>
                          {staff.phone_number && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3" />
                              <span>{staff.phone_number}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              Joined {new Date(staff.invited_at).toLocaleDateString()}
                            </span>
                          </div>
                          {staff.last_active && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>
                                Last active {new Date(staff.last_active).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Permissions */}
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(staff.permissions).map(([key, value]) => (
                              value && (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key.replace('_', ' ')}
                                </Badge>
                              )
                            ))}
                          </div>
                        </div>

                        {staff.hourly_rate && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">
                              Hourly Rate: €{staff.hourly_rate}/hour
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingStaff(staff)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetStaffPassword(staff.id)}
                        >
                          <Key className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeStaffMember(staff.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
            {staffMembers.filter(staff => status === 'all' || staff.status === status).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No {status === 'all' ? '' : status} staff members found
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default StaffManagement;
