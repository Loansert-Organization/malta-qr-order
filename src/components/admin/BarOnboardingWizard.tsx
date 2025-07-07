import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Menu, 
  Upload, 
  Settings, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarData {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  website: string;
  email: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  categories: string[];
  features: string[];
  photos: string[];
  menuItems: MenuItem[];
}

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

const BarOnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [barData, setBarData] = useState<BarData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    website: '',
    email: '',
    openingHours: {
      monday: { open: '09:00', close: '23:00', closed: false },
      tuesday: { open: '09:00', close: '23:00', closed: false },
      wednesday: { open: '09:00', close: '23:00', closed: false },
      thursday: { open: '09:00', close: '23:00', closed: false },
      friday: { open: '09:00', close: '00:00', closed: false },
      saturday: { open: '10:00', close: '00:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false },
    },
    categories: [],
    features: [],
    photos: [],
    menuItems: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const categories = [
    'Bar', 'Restaurant', 'Cafe', 'Pub', 'Nightclub', 'Wine Bar', 'Cocktail Bar', 'Sports Bar'
  ];

  const features = [
    'Live Music', 'DJ', 'Karaoke', 'Sports TV', 'Outdoor Seating', 'Private Events', 
    'Food Service', 'Craft Beer', 'Wine Selection', 'Cocktails', 'Happy Hour'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement bar creation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Bar Created Successfully",
        description: `${barData.name} has been added to the platform.`,
      });
      
      // Reset form or redirect
      setCurrentStep(1);
      setBarData({
        name: '',
        description: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        website: '',
        email: '',
        openingHours: {
          monday: { open: '09:00', close: '23:00', closed: false },
          tuesday: { open: '09:00', close: '23:00', closed: false },
          wednesday: { open: '09:00', close: '23:00', closed: false },
          thursday: { open: '09:00', close: '23:00', closed: false },
          friday: { open: '09:00', close: '00:00', closed: false },
          saturday: { open: '10:00', close: '00:00', closed: false },
          sunday: { open: '10:00', close: '22:00', closed: false },
        },
        categories: [],
        features: [],
        photos: [],
        menuItems: [],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBarData = (field: keyof BarData, value: any) => {
    setBarData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    setBarData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleFeature = (feature: string) => {
    setBarData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      name: '',
      description: '',
      price: 0,
      category: '',
      available: true,
    };
    setBarData(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem]
    }));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    setBarData(prev => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeMenuItem = (index: number) => {
    setBarData(prev => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index)
    }));
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Enter the basic details about the bar or restaurant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bar Name *</Label>
            <Input
              id="name"
              value={barData.name}
              onChange={(e) => updateBarData('name', e.target.value)}
              placeholder="Enter bar name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={barData.city}
              onChange={(e) => updateBarData('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={barData.description}
            onChange={(e) => updateBarData('description', e.target.value)}
            placeholder="Describe the bar, its atmosphere, and specialties"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={barData.address}
            onChange={(e) => updateBarData('address', e.target.value)}
            placeholder="Enter full address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={barData.phone}
              onChange={(e) => updateBarData('phone', e.target.value)}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={barData.email}
              onChange={(e) => updateBarData('email', e.target.value)}
              placeholder="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={barData.website}
              onChange={(e) => updateBarData('website', e.target.value)}
              placeholder="Website URL"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Opening Hours
        </CardTitle>
        <CardDescription>
          Set the opening and closing times for each day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(barData.openingHours).map(([day, hours]) => (
          <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
            <div className="w-24 font-medium capitalize">{day}</div>
            <Checkbox
              checked={!hours.closed}
              onCheckedChange={(checked) => {
                updateBarData('openingHours', {
                  ...barData.openingHours,
                  [day]: { ...hours, closed: !checked }
                });
              }}
            />
            {!hours.closed ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={hours.open}
                  onChange={(e) => {
                    updateBarData('openingHours', {
                      ...barData.openingHours,
                      [day]: { ...hours, open: e.target.value }
                    });
                  }}
                  className="w-32"
                />
                <span>to</span>
                <Input
                  type="time"
                  value={hours.close}
                  onChange={(e) => {
                    updateBarData('openingHours', {
                      ...barData.openingHours,
                      [day]: { ...hours, close: e.target.value }
                    });
                  }}
                  className="w-32"
                />
              </div>
            ) : (
              <Badge variant="secondary">Closed</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Menu className="h-5 w-5" />
          Categories & Features
        </CardTitle>
        <CardDescription>
          Select categories and features that describe the establishment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={barData.categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label htmlFor={category} className="text-sm">{category}</Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-base font-medium">Features & Amenities</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={barData.features.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <Label htmlFor={feature} className="text-sm">{feature}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Menu Items
        </CardTitle>
        <CardDescription>
          Add menu items that customers can order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={addMenuItem} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>

        {barData.menuItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Item {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMenuItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                  placeholder="Item name"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={item.category}
                  onChange={(e) => updateMenuItem(index, 'category', e.target.value)}
                  placeholder="e.g., Drinks, Food, Desserts"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={item.description}
                onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                placeholder="Describe the item"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (€) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateMenuItem(index, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id={`available-${index}`}
                  checked={item.available}
                  onCheckedChange={(checked) => updateMenuItem(index, 'available', checked)}
                />
                <Label htmlFor={`available-${index}`}>Available</Label>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Review & Submit
        </CardTitle>
        <CardDescription>
          Review all information before creating the bar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {barData.name}</div>
              <div><strong>City:</strong> {barData.city}</div>
              <div><strong>Address:</strong> {barData.address}</div>
              <div><strong>Phone:</strong> {barData.phone}</div>
              <div><strong>Email:</strong> {barData.email}</div>
              <div><strong>Website:</strong> {barData.website}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Categories & Features</h4>
            <div className="space-y-2">
              <div><strong>Categories:</strong></div>
              <div className="flex flex-wrap gap-1">
                {barData.categories.map((category) => (
                  <Badge key={category} variant="secondary">{category}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div><strong>Features:</strong></div>
              <div className="flex flex-wrap gap-1">
                {barData.features.map((feature) => (
                  <Badge key={feature} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Menu Items ({barData.menuItems.length})</h4>
          <div className="space-y-2">
            {barData.menuItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">€{item.price.toFixed(2)}</div>
                  <Badge variant={item.available ? "default" : "secondary"}>
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All information has been reviewed. Click "Create Bar" to add this establishment to the platform.
          </AlertDescription>
        </Alert>
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Bar Onboarding Wizard</h1>
        <p className="text-muted-foreground">
          Step {currentStep} of {totalSteps} - Complete the setup for a new bar or restaurant
        </p>
      </div>

      <Progress value={progress} className="w-full" />

      <div className="space-y-6">
        {renderCurrentStep()}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Creating..." : "Create Bar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarOnboardingWizard; 