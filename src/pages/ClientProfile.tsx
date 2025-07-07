import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Bell, 
  Settings, 
  Heart,
  Clock,
  Star,
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    country: string;
    language: string;
  };
  created_at: string;
  updated_at: string;
}

interface OrderHistory {
  id: string;
  bar_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

interface FavoriteBar {
  id: string;
  name: string;
  address: string;
  rating?: number;
  photo_url?: string;
}

const ClientProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteBar[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserProfile();
    fetchOrderHistory();
    fetchFavorites();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        setError('Failed to load profile');
      } else {
        const userProfile: UserProfile = {
          id: user.id,
          email: user.email || undefined,
          phone: user.phone || undefined,
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          avatar_url: profileData?.avatar_url || undefined,
          preferences: profileData?.preferences || {
            notifications: true,
            marketing: false,
            country: 'Malta',
            language: 'en'
          },
          created_at: user.created_at,
          updated_at: profileData?.updated_at || user.created_at
        };
        
        setProfile(userProfile);
        setEditForm({
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          phone: userProfile.phone || '',
          email: userProfile.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          bars(name),
          order_items(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        const formattedOrders: OrderHistory[] = (orders || []).map(order => ({
          id: order.id,
          bar_name: order.bars?.name || 'Unknown Bar',
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          items_count: order.order_items?.length || 0
        }));
        setOrderHistory(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch favorites from localStorage for now (could be moved to database)
      const favoritesData = JSON.parse(localStorage.getItem('icupa_favorites') || '[]');
      
      if (favoritesData.length > 0) {
        const { data: bars, error } = await supabase
          .from('bars')
          .select('id, name, address, rating, photo_url')
          .in('id', favoritesData);

        if (!error && bars) {
          setFavorites(bars);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const saveProfile = async () => {
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

      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
        updated_at: new Date().toISOString()
      } : null);

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (key: string, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const newPreferences = {
        ...profile?.preferences,
        [key]: value
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        setProfile(prev => prev ? {
          ...prev,
          preferences: newPreferences
        } : null);
      }
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const removeFavorite = (barId: string) => {
    const newFavorites = favorites.filter(bar => bar.id !== barId);
    setFavorites(newFavorites);
    localStorage.setItem('icupa_favorites', JSON.stringify(newFavorites.map(bar => bar.id)));
    toast({
      title: "Removed from favorites",
      description: "Bar removed from your favorites",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
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
              onClick={fetchUserProfile}
            >
              Retry
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
                onClick={() => navigate('/client')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">My Profile</h1>
                <p className="text-sm text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
            
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Name</Label>
                        <p className="text-lg">
                          {profile?.first_name && profile?.last_name 
                            ? `${profile.first_name} ${profile.last_name}`
                            : 'Not set'
                          }
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="text-lg">{profile?.email || 'Not set'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="text-lg">{profile?.phone || 'Not set'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                        <p className="text-lg">
                          {profile?.created_at 
                            ? new Date(profile.created_at).toLocaleDateString()
                            : 'Unknown'
                          }
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input
                            value={editForm.first_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="First name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input
                            value={editForm.last_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Last name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={editForm.email}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Email"
                          type="email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Orders</span>
                    <Badge variant="secondary">{orderHistory.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Favorites</span>
                    <Badge variant="secondary">{favorites.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString()
                        : 'Unknown'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Order History
                </CardTitle>
                <CardDescription>
                  Your recent orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{order.bar_name}</h4>
                          <p className="text-sm text-gray-600">
                            {order.items_count} items • €{order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            'destructive'
                          }>
                            {order.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/order-status/${order.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring bars and restaurants to place your first order</p>
                    <Button onClick={() => navigate('/client')}>
                      Browse Bars
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Favorite Bars
                </CardTitle>
                <CardDescription>
                  Bars and restaurants you've saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((bar) => (
                      <div key={bar.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {bar.photo_url ? (
                            <img 
                              src={bar.photo_url} 
                              alt={bar.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{bar.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{bar.address}</p>
                          {bar.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{bar.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/bars/${bar.id}`)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFavorite(bar.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring and save your favorite bars</p>
                    <Button onClick={() => navigate('/client')}>
                      Browse Bars
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your experience and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Order Updates</Label>
                        <p className="text-xs text-gray-600">Get notified about order status changes</p>
                      </div>
                      <Button
                        variant={profile?.preferences?.notifications ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updatePreference('notifications', !profile?.preferences?.notifications)}
                      >
                        {profile?.preferences?.notifications ? 'On' : 'Off'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Marketing</Label>
                        <p className="text-xs text-gray-600">Receive promotional offers and updates</p>
                      </div>
                      <Button
                        variant={profile?.preferences?.marketing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updatePreference('marketing', !profile?.preferences?.marketing)}
                      >
                        {profile?.preferences?.marketing ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Location</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Default Country</Label>
                      <Select 
                        value={profile?.preferences?.country || 'Malta'} 
                        onValueChange={(value) => updatePreference('country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Malta">Malta</SelectItem>
                          <SelectItem value="Rwanda">Rwanda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Language</Label>
                      <Select 
                        value={profile?.preferences?.language || 'en'} 
                        onValueChange={(value) => updatePreference('language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="mt">Maltese</SelectItem>
                          <SelectItem value="rw">Kinyarwanda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientProfile; 