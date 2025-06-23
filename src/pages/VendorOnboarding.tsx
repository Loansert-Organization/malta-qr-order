
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const VendorOnboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    location: '',
    description: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.businessName.trim()) {
        toast({
          title: "Required Field",
          description: "Business name is required",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue",
            variant: "destructive"
          });
          return;
        }

        // Create vendor
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            name: formData.businessName,
            business_name: formData.businessName,
            category: formData.category,
            location: formData.location,
            description: formData.description,
            slug: formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            active: true
          })
          .select()
          .single();

        if (vendorError) throw vendorError;

        // Update user profile to link to vendor
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            vendor_id: vendor.id,
            role: 'vendor'
          })
          .eq('user_id', user.id);

        if (profileError) throw profileError;

        // Create default menu
        const { data: menu, error: menuError } = await supabase
          .from('menus')
          .insert({
            vendor_id: vendor.id,
            name: 'Main Menu',
            active: true
          })
          .select()
          .single();

        if (menuError) throw menuError;

        toast({
          title: "Success!",
          description: "Your venue has been created successfully.",
        });

        setStep(3);
      } catch (error) {
        console.error('Error creating vendor:', error);
        toast({
          title: "Error",
          description: "Failed to create venue. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      navigate('/vendor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Welcome to ICUPA!</CardTitle>
          <CardDescription className="text-gray-300">
            {step === 1 && "Let's set up your venue"}
            {step === 2 && "Tell us more about your business"}
            {step === 3 && "You're all set!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="businessName" className="text-white">Business Name *</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="e.g., Malta Bistro"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Valletta, Malta"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="category" className="text-white">Category</Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="bistro">Bistro</SelectItem>
                    <SelectItem value="pizzeria">Pizzeria</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your venue"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2 text-white">Congratulations!</h3>
              <p className="text-gray-300 mb-4">
                Your venue "{formData.businessName}" has been created successfully.
              </p>
              <p className="text-sm text-gray-400">
                You can now start building your menu and generating QR codes.
              </p>
            </div>
          )}

          <Button 
            onClick={handleNext}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Creating...' : step === 3 ? 'Go to Dashboard' : 'Next'}
          </Button>

          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOnboarding;
