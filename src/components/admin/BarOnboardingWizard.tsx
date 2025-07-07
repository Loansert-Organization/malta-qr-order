import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Globe, 
  Image as ImageIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from './AdminLayout';

interface BarData {
  id?: string;
  name: string;
  address: string;
  phone: string;
  website?: string;
  logo?: string;
  country: string;
  city: string;
  latitude?: number;
  longitude?: number;
  categories: string[];
  tags: string[];
  confirmed: boolean;
  created_at?: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  phone_number?: string;
  website?: string;
  photos?: Array<{ photo_reference: string }>;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

const countries = [
  { code: 'MT', name: 'Malta' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
];

const categories = [
  'Restaurant', 'Bar', 'Cafe', 'Lounge', 'Pub', 'Club', 'Wine Bar', 'Cocktail Bar',
  'Beer Garden', 'Sports Bar', 'Irish Pub', 'Gastropub', 'Brewery', 'Distillery'
];

const tags = [
  'Live Music', 'DJ', 'Karaoke', 'Sports TV', 'Outdoor Seating', 'Rooftop',
  'Waterfront', 'Historic', 'Modern', 'Casual', 'Fine Dining', 'Family Friendly',
  'Pet Friendly', 'Wheelchair Accessible', 'Free WiFi', 'Parking Available'
];

const steps = [
  { id: 1, title: 'Select Country', description: 'Choose the country/region' },
  { id: 2, title: 'Search Bars', description: 'Find bars using Google Places' },
  { id: 3, title: 'Preview Results', description: 'Review and select bars' },
  { id: 4, title: 'Edit Details', description: 'Manual editing and customization' },
  { id: 5, title: 'Review & Submit', description: 'Final review and confirmation' },
];

const BarOnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [selectedBars, setSelectedBars] = useState<BarData[]>([]);
  const [editingBar, setEditingBar] = useState<BarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock Google Places API search
  const searchGooglePlaces = async (query: string, country: string) => {
    setSearching(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results
      const mockResults: GooglePlace[] = [
        {
          place_id: '1',
          name: 'The Blue Bar',
          formatted_address: '123 Main Street, Valletta, Malta',
          phone_number: '+356 2123 4567',
          website: 'https://thebluebar.mt',
          photos: [{ photo_reference: 'mock1' }],
          geometry: { location: { lat: 35.8989, lng: 14.5146 } },
          types: ['bar', 'establishment']
        },
        {
          place_id: '2',
          name: 'Cafe Luna',
          formatted_address: '456 Republic Street, Sliema, Malta',
          phone_number: '+356 2123 4568',
          website: 'https://cafeluna.mt',
          photos: [{ photo_reference: 'mock2' }],
          geometry: { location: { lat: 35.9128, lng: 14.5029 } },
          types: ['cafe', 'establishment']
        },
        {
          place_id: '3',
          name: 'The Grand Hotel Bar',
          formatted_address: '789 St. Julian\'s Bay, St. Julian\'s, Malta',
          phone_number: '+356 2123 4569',
          website: 'https://grandhotel.mt',
          photos: [{ photo_reference: 'mock3' }],
          geometry: { location: { lat: 35.9225, lng: 14.4884 } },
          types: ['bar', 'restaurant', 'establishment']
        }
      ];
      
      setSearchResults(mockResults);
      toast({
        title: "Search completed",
        description: `Found ${mockResults.length} bars in ${country}`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search Google Places API",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !selectedCountry) {
      toast({
        title: "Missing information",
        description: "Please enter a search query and select a country",
        variant: "destructive"
      });
      return;
    }
    searchGooglePlaces(searchQuery, selectedCountry);
  };

  const selectBar = (place: GooglePlace) => {
    const barData: BarData = {
      name: place.name,
      address: place.formatted_address,
      phone: place.phone_number || '',
      website: place.website || '',
      country: selectedCountry,
      city: place.formatted_address.split(',')[1]?.trim() || '',
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      categories: place.types.filter(type => categories.includes(type.charAt(0).toUpperCase() + type.slice(1))),
      tags: [],
      confirmed: false,
    };
    
    setSelectedBars(prev => [...prev, barData]);
    toast({
      title: "Bar selected",
      description: `${place.name} added to selection`,
    });
  };

  const removeBar = (index: number) => {
    setSelectedBars(prev => prev.filter((_, i) => i !== index));
  };

  const editBar = (index: number) => {
    setEditingBar({ ...selectedBars[index], id: index.toString() });
  };

  const saveBarEdit = () => {
    if (!editingBar) return;
    
    setSelectedBars(prev => 
      prev.map((bar, index) => 
        index.toString() === editingBar.id ? editingBar : bar
      )
    );
    setEditingBar(null);
    toast({
      title: "Bar updated",
      description: "Bar details have been saved",
    });
  };

  const saveToDatabase = async () => {
    setSaving(true);
    try {
      // Simulate database save
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would call your Supabase/Firestore API
      console.log('Saving bars:', selectedBars);
      
      toast({
        title: "Success!",
        description: `${selectedBars.length} bars have been onboarded successfully`,
      });
      
      navigate('/admin/bars');
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save bars to database",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-4
                ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Select Country/Region</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={nextStep} 
            disabled={!selectedCountry}
            className="flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Search Bars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Query</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                placeholder="e.g., bars in Valletta, restaurants in Sliema"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={searching || !searchQuery.trim()}
                className="flex items-center gap-2"
              >
                {searching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Search Results</h3>
            <div className="grid gap-4">
              {searchResults.map((place) => (
                <Card key={place.place_id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{place.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {place.formatted_address}
                      </p>
                      {place.phone_number && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {place.phone_number}
                        </p>
                      )}
                      {place.website && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {place.website}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => selectBar(place)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={selectedBars.length === 0}
            className="flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Preview Selected Bars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {selectedBars.map((bar, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{bar.name}</h4>
                    <Badge variant="outline">{bar.country}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{bar.address}</p>
                  {bar.phone && (
                    <p className="text-sm text-gray-600">{bar.phone}</p>
                  )}
                  {bar.categories.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {bar.categories.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => editBar(index)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeBar(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={nextStep} 
            disabled={selectedBars.length === 0}
            className="flex items-center gap-2"
          >
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {editingBar ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Bar Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingBar.name}
                  onChange={(e) => setEditingBar({ ...editingBar, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editingBar.phone}
                  onChange={(e) => setEditingBar({ ...editingBar, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editingBar.address}
                onChange={(e) => setEditingBar({ ...editingBar, address: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editingBar.website || ''}
                onChange={(e) => setEditingBar({ ...editingBar, website: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={editingBar.categories.includes(cat) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newCategories = editingBar.categories.includes(cat)
                        ? editingBar.categories.filter(c => c !== cat)
                        : [...editingBar.categories, cat];
                      setEditingBar({ ...editingBar, categories: newCategories });
                    }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant={editingBar.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      const newTags = editingBar.tags.includes(tag)
                        ? editingBar.tags.filter(t => t !== tag)
                        : [...editingBar.tags, tag];
                      setEditingBar({ ...editingBar, tags: newTags });
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={saveBarEdit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingBar(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manual Editing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Click the edit button on any bar to modify its details, categories, and tags.
            </p>
            <div className="space-y-4">
              {selectedBars.map((bar, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{bar.name}</h4>
                        <Badge variant="outline">{bar.country}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{bar.address}</p>
                      {bar.categories.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {bar.categories.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {bar.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {bar.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editBar(index)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={selectedBars.length === 0}
          className="flex items-center gap-2"
        >
          Next Step
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
          <p className="text-blue-700">
            You are about to onboard {selectedBars.length} bar{selectedBars.length !== 1 ? 's' : ''} to the ICUPA platform.
          </p>
        </div>

        <div className="space-y-4">
          {selectedBars.map((bar, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{bar.name}</h4>
                    <Badge variant="outline">{bar.country}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{bar.address}</p>
                  {bar.phone && (
                    <p className="text-sm text-gray-600">{bar.phone}</p>
                  )}
                  {bar.categories.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {bar.categories.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {bar.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {bar.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  Ready
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={saveToDatabase} 
            disabled={saving || selectedBars.length === 0}
            className="flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Submit to Database'}
          </Button>
        </div>
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
    <AdminLayout 
      title="Bar Onboarding Wizard" 
      subtitle={`Step ${currentStep} of ${steps.length}`}
      showBackButton
    >
      <div className="max-w-4xl mx-auto">
        {renderStepIndicator()}
        {renderCurrentStep()}
      </div>
    </AdminLayout>
  );
};

export default BarOnboardingWizard; 