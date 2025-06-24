
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Store, MapPin, User } from 'lucide-react';

interface VenueDetails {
  name: string;
  category: string;
  location: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface AnonymousOnboardingWizardProps {
  onComplete: (details: VenueDetails) => void;
  onAuthenticate: () => void;
}

const AnonymousOnboardingWizard: React.FC<AnonymousOnboardingWizardProps> = ({
  onComplete,
  onAuthenticate
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [venueDetails, setVenueDetails] = useState<VenueDetails>({
    name: '',
    category: '',
    location: '',
    description: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const categories = [
    'Restaurant',
    'Bar',
    'Cafe',
    'Fast Food',
    'Fine Dining',
    'Pizzeria',
    'Bakery',
    'Ice Cream Shop',
    'Food Truck',
    'Other'
  ];

  const maltaLocations = [
    'Valletta',
    'Sliema',
    'St. Julians',
    'Msida',
    'Gzira',
    'Hamrun',
    'Birkirkara',
    'Mosta',
    'Qormi',
    'Zabbar',
    'Zejtun',
    'Rabat',
    'Mdina',
    'Mellieha',
    'Bugibba',
    'Qawra',
    'Marsaskala',
    'Marsaxlokk',
    'Birzebbuga',
    'Gozo - Victoria',
    'Gozo - Xlendi',
    'Gozo - Marsalforn',
    'Other'
  ];

  const updateField = (field: keyof VenueDetails, value: string) => {
    setVenueDetails(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return venueDetails.name && venueDetails.category && venueDetails.location;
      case 2:
        return venueDetails.description;
      case 3:
        return venueDetails.contactPerson && venueDetails.email;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(venueDetails);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Store className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Tell us about your venue</h2>
              <p className="text-gray-600">Basic information to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="venue-name">Venue Name *</Label>
                <Input
                  id="venue-name"
                  placeholder="e.g., Ta' Kris Restaurant"
                  value={venueDetails.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={venueDetails.category} onValueChange={(value) => updateField('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Select value={venueDetails.location} onValueChange={(value) => updateField('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location in Malta" />
                  </SelectTrigger>
                  <SelectContent>
                    {maltaLocations.map(location => (
                      <SelectItem key={location} value={location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Describe your venue</h2>
              <p className="text-gray-600">Help customers know what to expect</p>
            </div>

            <div>
              <Label htmlFor="description">Venue Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your cuisine, atmosphere, specialties, etc."
                rows={4}
                value={venueDetails.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                This will appear on your venue page. Make it inviting!
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <p className="text-gray-600">So we can reach you about your venue</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-person">Contact Person *</Label>
                <Input
                  id="contact-person"
                  placeholder="Your name"
                  value={venueDetails.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={venueDetails.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+356 1234 5678"
                  value={venueDetails.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Next:</strong> Create an account to save your progress and access advanced features.
                Don't worry - all your information will be preserved!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Setup Your Venue</span>
            <span className="text-sm font-normal text-gray-500">
              Step {currentStep} of {totalSteps}
            </span>
          </CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex space-x-3">
              {currentStep === totalSteps && (
                <Button variant="outline" onClick={onAuthenticate}>
                  Create Account First
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
                {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnonymousOnboardingWizard;
