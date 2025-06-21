
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Star, Users, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaltaBar {
  id: string;
  name: string;
  address: string;
  contact_number?: string;
  rating?: number;
  review_count?: number;
  google_place_id?: string;
}

interface VendorRegistrationProps {
  onComplete?: (vendorId: string) => void;
}

const VendorRegistration: React.FC<VendorRegistrationProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'search' | 'details' | 'complete'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [maltaBars, setMaltaBars] = useState<MaltaBar[]>([]);
  const [selectedBar, setSelectedBar] = useState<MaltaBar | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    slug: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    revolut_link: '',
    stripe_link: ''
  });

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchMaltaBars();
    }
  }, [searchQuery]);

  const searchMaltaBars = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setMaltaBars(data || []);
    } catch (error) {
      console.error('Error searching bars:', error);
    }
  };

  const selectBar = (bar: MaltaBar) => {
    setSelectedBar(bar);
    setFormData(prev => ({
      ...prev,
      business_name: bar.name,
      slug: bar.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      contact_phone: bar.contact_number || ''
    }));
    setStep('details');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const submitRegistration = async () => {
    setLoading(true);
    try {
      // Create vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: formData.business_name,
          slug: formData.slug,
          location: selectedBar?.address || 'Malta',
          description: formData.description,
          revolut_link: formData.revolut_link || null,
          stripe_link: formData.stripe_link || null,
          active: false // Requires admin approval
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      // Create default menu
      const { error: menuError } = await supabase
        .from('menus')
        .insert({
          vendor_id: vendorData.id,
          name: 'Main Menu',
          active: true
        });

      if (menuError) throw menuError;

      // Create vendor config
      const { error: configError } = await supabase
        .from('vendor_config')
        .insert({
          vendor_id: vendorData.id,
          happy_hour_enabled: true,
          dynamic_ui_enabled: true,
          ai_waiter_enabled: true
        });

      if (configError) throw configError;

      toast({
        title: "Registration Submitted!",
        description: "Your venue registration is pending admin approval. You'll be notified via email once approved."
      });

      setStep('complete');
      onComplete?.(vendorData.id);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Registration Complete!</h3>
          <p className="text-gray-600 mb-6">
            Your venue registration has been submitted for review. Our team will contact you within 24 hours.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Join ICUPA Malta</h1>
        <p className="text-gray-600">Register your bar or restaurant to start accepting digital orders</p>
      </div>

      {step === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Find Your Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Search for your bar or restaurant</Label>
              <Input
                id="search"
                placeholder="Enter your business name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {maltaBars.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Found businesses:</h4>
                {maltaBars.map((bar) => (
                  <Card key={bar.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => selectBar(bar)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold">{bar.name}</h5>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{bar.address}</span>
                        </div>
                        {bar.contact_number && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>{bar.contact_number}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {bar.rating && (
                          <Badge variant="secondary" className="flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            {bar.rating}
                          </Badge>
                        )}
                        {bar.review_count && (
                          <Badge variant="outline" className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {bar.review_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center pt-4">
              <Button variant="outline" onClick={() => setStep('details')}>
                Don't see your business? Register manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            {selectedBar && (
              <div className="text-sm text-gray-600">
                Selected: {selectedBar.name}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => {
                    handleInputChange('business_name', e.target.value);
                    handleInputChange('slug', generateSlug(e.target.value));
                  }}
                  placeholder="Your bar/restaurant name"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="your-business-name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your menu will be available at: icupa.mt/{formData.slug}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+356 XXXX XXXX"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers about your business..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revolut_link">Revolut Payment Link (Optional)</Label>
                <Input
                  id="revolut_link"
                  value={formData.revolut_link}
                  onChange={(e) => handleInputChange('revolut_link', e.target.value)}
                  placeholder="https://revolut.me/yourbusiness"
                />
              </div>
              <div>
                <Label htmlFor="stripe_link">Stripe Payment Link (Optional)</Label>
                <Input
                  id="stripe_link"
                  value={formData.stripe_link}
                  onChange={(e) => handleInputChange('stripe_link', e.target.value)}
                  placeholder="https://buy.stripe.com/..."
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep('search')}>
                Back
              </Button>
              <Button 
                onClick={submitRegistration}
                disabled={loading || !formData.business_name || !formData.slug}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorRegistration;
