
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const VendorRegistration = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    location: '',
    description: '',
    revolutLink: '',
    stripeLink: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const slug = generateSlug(formData.businessName);
      
      const { error } = await supabase
        .from('vendors')
        .insert({
          business_name: formData.businessName,
          name: formData.businessName, // Add this for compatibility
          slug,
          location: formData.location,
          description: formData.description,
          revolut_link: formData.revolutLink,
          stripe_link: formData.stripeLink,
          active: false
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: "Your vendor registration has been submitted for review.",
      });

      // Reset form
      setFormData({
        businessName: '',
        slug: '',
        location: '',
        description: '',
        revolutLink: '',
        stripeLink: ''
      });

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Registration</CardTitle>
          <CardDescription>
            Register your business to start accepting orders through ICUPA Malta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Valletta, Malta"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell us about your business..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="revolutLink">Revolut Payment Link</Label>
              <Input
                id="revolutLink"
                value={formData.revolutLink}
                onChange={(e) => handleInputChange('revolutLink', e.target.value)}
                placeholder="https://revolut.me/..."
              />
            </div>

            <div>
              <Label htmlFor="stripeLink">Stripe Payment Link</Label>
              <Input
                id="stripeLink"
                value={formData.stripeLink}
                onChange={(e) => handleInputChange('stripeLink', e.target.value)}
                placeholder="https://checkout.stripe.com/..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorRegistration;
