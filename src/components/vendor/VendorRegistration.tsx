
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    location: '',
    description: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!formData.businessName.trim()) {
      toast({
        title: "Required Field",
        description: "Business name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/vendor`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create vendor record with correct field names
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            business_name: formData.businessName, // Fixed: using business_name instead of name
            name: formData.businessName, // Keep both for compatibility
            slug: formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category: formData.category,
            location: formData.location,
            description: formData.description,
            owner_id: authData.user.id,
            active: true,
            is_active: true
          })
          .select()
          .single();

        if (vendorError) throw vendorError;

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            vendor_id: vendor.id,
            role: 'vendor'
          })
          .eq('user_id', authData.user.id);

        if (profileError) throw profileError;

        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account, then you can access your vendor dashboard.",
        });

        // Reset form
        setFormData({
          businessName: '',
          category: '',
          location: '',
          description: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join ICUPA Malta</CardTitle>
            <CardDescription>
              Register your venue and start serving customers with AI-powered tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="e.g., Malta Bistro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Valletta, Malta"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your venue"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register Venue'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    // Handle login redirect
                    window.location.href = '/vendor';
                  }}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRegistration;
