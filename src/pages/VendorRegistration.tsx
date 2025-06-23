
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Camera,
  Check,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

const VendorRegistration = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    logoUrl: '',
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '09:00', close: '22:00', closed: false }
    },
    paymentMethods: [],
    agreesToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Restaurant', 'Bar', 'Cafe', 'Fast Food', 'Fine Dining', 
    'Pizzeria', 'Bakery', 'Ice Cream', 'Food Truck', 'Other'
  ];

  const paymentOptions = [
    { id: 'stripe', label: 'Stripe', description: 'Credit/Debit Cards' },
    { id: 'revolut', label: 'Revolut', description: 'Bank Transfer' },
    { id: 'cash', label: 'Cash', description: 'Cash on Delivery' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handlePaymentMethodToggle = (methodId: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(methodId)
        ? prev.paymentMethods.filter(id => id !== methodId)
        : [...prev.paymentMethods, methodId]
    }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.businessName && formData.category && formData.description;
      case 2:
        return formData.location && formData.phone && formData.email;
      case 3:
        return true; // Opening hours are optional
      case 4:
        return formData.paymentMethods.length > 0;
      case 5:
        return formData.agreesToTerms;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          business_name: formData.businessName,
          name: formData.businessName,
          slug: formData.businessName.toLowerCase().replace(/\s+/g, '-'),
          category: formData.category,
          description: formData.description,
          location: formData.location,
          phone_number: formData.phone,
          email: formData.email,
          website: formData.website,
          contact_person: formData.contactPerson,
          logo_url: formData.logoUrl,
          opening_hours: formData.openingHours,
          active: false // Requires admin approval
        });

      if (error) throw error;

      toast.success('Registration submitted successfully! We will review your application and contact you soon.');
      
      // Reset form
      setStep(1);
      setFormData({
        businessName: '',
        category: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        website: '',
        contactPerson: '',
        logoUrl: '',
        openingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '22:00', closed: false },
          saturday: { open: '09:00', close: '22:00', closed: false },
          sunday: { open: '09:00', close: '22:00', closed: false }
        },
        paymentMethods: [],
        agreesToTerms: false
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-8">
      {[1, 2, 3, 4, 5].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            stepNumber <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {stepNumber < step ? <Check className="h-4 w-4" /> : stepNumber}
          </div>
          {stepNumber < 5 && (
            <div className={`w-12 h-1 mx-2 ${
              stepNumber < step ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span>Business Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Enter your business name"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your business, cuisine, atmosphere..."
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input
            id="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => handleInputChange('logoUrl', e.target.value)}
            placeholder="https://example.com/logo.png"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Contact Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Valletta, Malta"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+356 1234 5678"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="info@yourbusiness.com"
          />
        </div>
        
        <div>
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            placeholder="https://yourbusiness.com"
          />
        </div>
        
        <div>
          <Label htmlFor="contactPerson">Contact Person (Optional)</Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            placeholder="Manager or owner name"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Opening Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(formData.openingHours).map(([day, hours]) => (
          <div key={day} className="flex items-center space-x-4">
            <div className="w-20 capitalize">{day}</div>
            <Checkbox
              checked={hours.closed}
              onCheckedChange={(checked) => handleHoursChange(day, 'closed', !!checked)}
            />
            <span className="text-sm">Closed</span>
            {!hours.closed && (
              <>
                <Input
                  type="time"
                  value={hours.open}
                  onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                  className="w-24"
                />
                <span>to</span>
                <Input
                  type="time"
                  value={hours.close}
                  onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                  className="w-24"
                />
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Select the payment methods you want to accept through ICUPA:
        </p>
        {paymentOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <Checkbox
              checked={formData.paymentMethods.includes(option.id)}
              onCheckedChange={() => handlePaymentMethodToggle(option.id)}
            />
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </div>
          </div>
        ))}
        {formData.paymentMethods.length === 0 && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Please select at least one payment method</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Business Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {formData.businessName}</div>
            <div><strong>Category:</strong> {formData.category}</div>
            <div><strong>Location:</strong> {formData.location}</div>
            <div><strong>Phone:</strong> {formData.phone}</div>
            <div><strong>Email:</strong> {formData.email}</div>
            <div><strong>Payment Methods:</strong> {formData.paymentMethods.join(', ')}</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox
            checked={formData.agreesToTerms}
            onCheckedChange={(checked) => handleInputChange('agreesToTerms', !!checked)}
          />
          <div className="text-sm">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
        
        {!formData.agreesToTerms && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Please accept the terms and conditions</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join ICUPA Malta
          </h1>
          <p className="text-gray-600">
            Register your restaurant or bar and start accepting orders today
          </p>
        </div>

        {renderStepIndicator()}

        <div className="mb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < 5 ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(step)}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(5) || isSubmitting}
              className="flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
