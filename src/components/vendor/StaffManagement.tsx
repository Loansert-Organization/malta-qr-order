import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'manager' | 'waiter' | 'chef' | 'cashier';
  status: 'active' | 'inactive' | 'pending';
  hire_date: string;
  last_login?: string;
  permissions: string[];
  shift_schedule?: {
    monday?: { start: string; end: string; };
    tuesday?: { start: string; end: string; };
    wednesday?: { start: string; end: string; };
    thursday?: { start: string; end: string; };
    friday?: { start: string; end: string; };
    saturday?: { start: string; end: string; };
    sunday?: { start: string; end: string; };
  };
}

interface StaffManagementProps {
  vendorId: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ vendorId }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'waiter' as StaffMember['role']
  });

  useEffect(() => {
    fetchStaff();

    // Set up real-time subscription
    const channel = supabase
      .channel(`vendor-staff-${vendorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_members',
          filter: `vendor_id=eq.${vendorId}`
        },
        (payload) => {
          console.log('Staff change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMember = payload.new as any;
            setStaff(prev => [transformStaffMember(newMember), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedMember = payload.new as any;
            setStaff(prev => prev.map(member => 
              member.id === updatedMember.id ? transformStaffMember(updatedMember) : member
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedMember = payload.old as any;
            setStaff(prev => prev.filter(member => member.id !== deletedMember.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      // Fetch real staff data from database
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to match component interface
      const staffMembers: StaffMember[] = (data || []).map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role as StaffMember['role'],
        status: member.status as StaffMember['status'],
        hire_date: member.hire_date,
        last_login: member.last_login,
        permissions: member.permissions || [],
        shift_schedule: member.shift_schedule || undefined
      }));

      setStaff(staffMembers);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      if (!newStaff.name || !newStaff.email) {
        toast.error('Name and email are required');
        return;
      }

      // Insert into database
      const { data, error } = await supabase
        .from('staff_members')
        .insert({
          vendor_id: vendorId,
          name: newStaff.name,
          email: newStaff.email,
          phone: newStaff.phone || null,
          role: newStaff.role,
          status: 'pending',
          permissions: newStaff.role === 'manager' ? ['orders', 'staff', 'menu', 'analytics'] : ['orders']
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const staffMember: StaffMember = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as StaffMember['role'],
        status: data.status as StaffMember['status'],
        hire_date: data.hire_date,
        last_login: data.last_login,
        permissions: data.permissions || [],
        shift_schedule: data.shift_schedule
      };

      setStaff(prev => [staffMember, ...prev]);
      setNewStaff({ name: '', email: '', phone: '', role: 'waiter' });
      setShowAddModal(false);
      toast.success('Staff member added successfully');
    } catch (error: any) {
      console.error('Error adding staff member:', error);
      toast.error(error.message || 'Failed to add staff member');
    }
  };

  const handleUpdateStaffStatus = async (staffId: string, status: StaffMember['status']) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('staff_members')
        .update({ status })
        .eq('id', staffId)
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Update local state
      setStaff(prev => prev.map(member => 
        member.id === staffId ? { ...member, status } : member
      ));
      toast.success(`Staff member ${status === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error updating staff status:', error);
      toast.error(error.message || 'Failed to update staff status');
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      // Delete from database
      const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', staffId)
        .eq('vendor_id', vendorId);

      if (error) throw error;

      // Update local state
      setStaff(prev => prev.filter(member => member.id !== staffId));
      toast.success('Staff member removed');
    } catch (error: any) {
      console.error('Error deleting staff member:', error);
      toast.error(error.message || 'Failed to remove staff member');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'chef':
        return 'bg-orange-100 text-orange-800';
      case 'waiter':
        return 'bg-blue-100 text-blue-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const getScheduleSummary = (schedule?: StaffMember['shift_schedule']) => {
    if (!schedule) return 'No schedule set';
    
    const activeDays = Object.keys(schedule).length;
    return `${activeDays} days/week`;
  };

  // Helper function to transform database data
  const transformStaffMember = (dbMember: any): StaffMember => ({
    id: dbMember.id,
    name: dbMember.name,
    email: dbMember.email,
    phone: dbMember.phone,
    role: dbMember.role as StaffMember['role'],
    status: dbMember.status as StaffMember['status'],
    hire_date: dbMember.hire_date,
    last_login: dbMember.last_login,
    permissions: dbMember.permissions || [],
    shift_schedule: dbMember.shift_schedule
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff...</p>
        </div>
      </div>
    );
  }

  const activeStaff = staff.filter(member => member.status === 'active');
  const pendingStaff = staff.filter(member => member.status === 'pending');
  const inactiveStaff = staff.filter(member => member.status === 'inactive');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-gray-600">Manage your restaurant team</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add Staff Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+356 1234 5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select 
                  value={newStaff.role} 
                  onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value as StaffMember['role'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleAddStaff} className="flex-1">
                  Add Staff Member
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{staff.length}</p>
            <p className="text-sm text-gray-600">Total Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{activeStaff.length}</p>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{pendingStaff.length}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{inactiveStaff.length}</p>
            <p className="text-sm text-gray-600">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Staff ({staff.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeStaff.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingStaff.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveStaff.length})</TabsTrigger>
        </TabsList>

        {['all', 'active', 'pending', 'inactive'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {(tab === 'all' ? staff : staff.filter(member => 
              tab === 'active' ? member.status === 'active' :
              tab === 'pending' ? member.status === 'pending' :
              member.status === 'inactive'
            )).map(member => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                          {getStatusBadge(member.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Since {new Date(member.hire_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Schedule: {getScheduleSummary(member.shift_schedule)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>Permissions: {member.permissions.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {member.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStaffStatus(member.id, 'active')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Activate
                        </Button>
                      )}
                      
                      {member.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStaffStatus(member.id, 'inactive')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Deactivate
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStaff(member)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Permissions and Schedule Details */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {member.shift_schedule && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Schedule</h4>
                        <div className="text-xs text-gray-600">
                          {Object.entries(member.shift_schedule).map(([day, times]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}:</span>
                              <span>{times.start} - {times.end}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default StaffManagement;
