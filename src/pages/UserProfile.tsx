import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  History,
  Star,
  Edit,
  Camera,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing: boolean;
    };
    dietary: string[];
    favoriteCategories: string[];
  };
  avatar?: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock user data
  const [userData, setUserData] = useState<UserProfileData>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+356 2123 4567',
    dateOfBirth: '1990-05-15',
    address: {
      street: '123 Republic Street',
      city: 'Valletta',
      postalCode: 'VLT 1111',
      country: 'Malta'
    },
    preferences: {
      language: 'English',
      currency: 'EUR',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: true
      },
      dietary: ['Vegetarian', 'No Nuts'],
      favoriteCategories: ['Cocktails', 'Mediterranean Food', 'Wine']
    },
    memberSince: '2023-01-15',
    totalOrders: 47,
    totalSpent: 1250.75,
    loyaltyPoints: 1250
  });

  const [editData, setEditData] = useState<UserProfileData>(userData);

  const languages = ['English', 'Maltese', 'Italian', 'French', 'German'];
  const currencies = ['EUR', 'USD', 'GBP'];
  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'No Nuts', 
    'Halal', 'Kosher', 'Low-Sodium', 'Low-Sugar'
  ];
  const categoryOptions = [
    'Cocktails', 'Beer', 'Wine', 'Mediterranean Food', 'Italian Food',
    'Seafood', 'Pizza', 'Pasta', 'Desserts', 'Coffee', 'Tea'
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData(editData);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const updateEditData = (field: string, value: any) => {
    setEditData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const toggleNotification = (type: keyof typeof userData.preferences.notifications) => {
    updateEditData(`preferences.notifications.${type}`, !editData.preferences.notifications[type]);
  };

  const toggleDietary = (diet: string) => {
    const current = editData.preferences.dietary;
    const updated = current.includes(diet)
      ? current.filter(d => d !== diet)
      : [...current, diet];
    updateEditData('preferences.dietary', updated);
  };

  const toggleCategory = (category: string) => {
    const current = editData.preferences.favoriteCategories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updateEditData('preferences.favoriteCategories', updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      {userData.avatar ? (
                        <img 
                          src={userData.avatar} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardTitle>
                    {userData.firstName} {userData.lastName}
                  </CardTitle>
                  <CardDescription>Member since {new Date(userData.memberSince).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{userData.totalOrders}</div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">€{userData.totalSpent.toFixed(0)}</div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{userData.loyaltyPoints}</div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={isEditing ? editData.firstName : userData.firstName}
                        onChange={(e) => updateEditData('firstName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={isEditing ? editData.lastName : userData.lastName}
                        onChange={(e) => updateEditData('lastName', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editData.email : userData.email}
                        onChange={(e) => updateEditData('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editData.phone : userData.phone}
                        onChange={(e) => updateEditData('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={isEditing ? editData.dateOfBirth : userData.dateOfBirth}
                      onChange={(e) => updateEditData('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={isEditing ? editData.address.street : userData.address.street}
                      onChange={(e) => updateEditData('address.street', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={isEditing ? editData.address.city : userData.address.city}
                        onChange={(e) => updateEditData('address.city', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={isEditing ? editData.address.postalCode : userData.address.postalCode}
                        onChange={(e) => updateEditData('address.postalCode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={isEditing ? editData.address.country : userData.address.country}
                        onChange={(e) => updateEditData('address.country', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={isEditing ? editData.preferences.language : userData.preferences.language}
                    onValueChange={(value) => updateEditData('preferences.language', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={isEditing ? editData.preferences.currency : userData.preferences.currency}
                    onValueChange={(value) => updateEditData('preferences.currency', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>
                  Help us recommend better options for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map((diet) => (
                    <div key={diet} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={diet}
                        checked={isEditing 
                          ? editData.preferences.dietary.includes(diet)
                          : userData.preferences.dietary.includes(diet)
                        }
                        onChange={() => toggleDietary(diet)}
                        disabled={!isEditing}
                        className="rounded"
                      />
                      <Label htmlFor={diet} className="text-sm">{diet}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Favorite Categories</CardTitle>
                <CardDescription>
                  Categories you're most interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((category) => (
                    <Badge
                      key={category}
                      variant={
                        (isEditing 
                          ? editData.preferences.favoriteCategories.includes(category)
                          : userData.preferences.favoriteCategories.includes(category)
                        ) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => isEditing && toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive order updates and promotions via email
                    </p>
                  </div>
                  <Switch
                    checked={isEditing 
                      ? editData.preferences.notifications.email
                      : userData.preferences.notifications.email
                    }
                    onCheckedChange={() => toggleNotification('email')}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Get real-time updates on your device
                    </p>
                  </div>
                  <Switch
                    checked={isEditing 
                      ? editData.preferences.notifications.push
                      : userData.preferences.notifications.push
                    }
                    onCheckedChange={() => toggleNotification('push')}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive order status updates via SMS
                    </p>
                  </div>
                  <Switch
                    checked={isEditing 
                      ? editData.preferences.notifications.sms
                      : userData.preferences.notifications.sms
                    }
                    onCheckedChange={() => toggleNotification('sms')}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Communications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional offers and updates
                    </p>
                  </div>
                  <Switch
                    checked={isEditing 
                      ? editData.preferences.notifications.marketing
                      : userData.preferences.notifications.marketing
                    }
                    onCheckedChange={() => toggleNotification('marketing')}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recent orders</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No saved payment methods</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile; 