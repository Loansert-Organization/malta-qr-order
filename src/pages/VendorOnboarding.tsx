
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Upload,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const VendorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    logo: null as File | null
  });

  const steps = [
    { number: 1, title: 'Business Info', description: 'Tell us about your business' },
    { number: 2, title: 'Contact Details', description: 'How customers can reach you' },
    { number: 3, title: 'Branding', description: 'Upload your logo and customize' },
    { number: 4, title: 'Review', description: 'Review and submit' }
  ];

  const categories = [
    'Restaurant', 'Cafe', 'Bar', 'Fast Food', 'Fine Dining', 
    'Pizzeria', 'Bakery', 'Ice Cream', 'Food Truck', 'Other'
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName && formData.category && formData.location;
      case 2:
        return formData.phone && formData.email;
      case 3:
        return true; // Logo is optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Here you would submit to your backend
      console.log('Submitting vendor application:', formData);
      
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 24 hours.",
      });
      
      // Redirect to vendor dashboard or success page
      navigate('/vendor');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your business..."
                className="bg-gray-700 border-gray-600"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Business Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Valletta, Malta"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+356 XXXX XXXX"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="business@example.com"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                {formData.logo ? (
                  <img 
                    src={URL.createObjectURL(formData.logo)} 
                    alt="Logo preview" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <Store className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Business Logo (Optional)</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="bg-gray-700 border-gray-600"
                />
                <p className="text-sm text-gray-400">
                  Upload a square image for best results (JPG, PNG)
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                AI-Powered Features Coming Soon
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Automatic menu optimization</li>
                <li>• Smart pricing suggestions</li>
                <li>• Customer behavior insights</li>
                <li>• Dynamic layout generation</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review Your Information</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Store className="h-4 w-4 mr-2" />
                  Business Information
                </h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong>Name:</strong> {formData.businessName}</p>
                  <p><strong>Category:</strong> {formData.category}</p>
                  <p><strong>Location:</strong> {formData.location}</p>
                  {formData.description && <p><strong>Description:</strong> {formData.description}</p>}
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Details
                </h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  {formData.website && <p><strong>Website:</strong> {formData.website}</p>}
                </div>
              </div>
              
              {formData.logo && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Logo</h4>
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(formData.logo)} 
                      alt="Logo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-900/50 border border-blue-700 p-4 rounded-lg">
              <h4 className="font-medium text-blue-300 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• We'll review your application within 24 hours</li>
                <li>• You'll receive an email confirmation</li>
                <li>• Once approved, you can start building your digital menu</li>
                <li>• Get access to QR code generation and analytics</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join ICUPA Malta</h1>
          <p className="text-gray-400">Let's get your business set up on our platform</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
          
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  step.number <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <p className="text-xs text-gray-400 mt-1">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {currentStep === 1 && <Store className="h-5 w-5" />}
              {currentStep === 2 && <Phone className="h-5 w-5" />}
              {currentStep === 3 && <Upload className="h-5 w-5" />}
              {currentStep === 4 && <Check className="h-5 w-5" />}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <p className="text-gray-400">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-300"
          >
            Previous
          </Button>
          
          <Button
            onClick={nextStep}
            disabled={!validateStep()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === steps.length ? 'Submit Application' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Need help? Contact us at{' '}
            <a href="mailto:support@icupa.mt" className="text-blue-400 hover:underline">
              support@icupa.mt
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
