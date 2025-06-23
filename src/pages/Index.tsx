
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          setProfile(profile);
          // Auto-redirect based on role
          if (profile.role === 'admin') {
            navigate('/admin');
            return;
          } else if (profile.role === 'vendor') {
            navigate('/vendor');
            return;
          }
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleScanQR = () => {
    // Simulate QR scan - in real app this would open camera
    const vendorSlug = 'demo-restaurant'; // This would come from QR code
    navigate(`/order/${vendorSlug}`);
  };

  const handleVendorLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/vendor`
        }
      });
      
      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login Error", 
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const handleAdminAccess = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to access admin panel",
        variant: "destructive"
      });
      return;
    }

    if (profile?.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive"
      });
      return;
    }

    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ICUPA Malta
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered hospitality platform revolutionizing bars and restaurants across Malta
          </p>
          {user && (
            <p className="mt-4 text-sm text-gray-500">
              Welcome back, {user.email}! Role: {profile?.role || 'guest'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center">For Guests</CardTitle>
              <CardDescription className="text-center">
                Scan QR codes and order seamlessly with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" size="lg" onClick={handleScanQR}>
                Scan QR Code
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Demo: Experience our AI-powered ordering system
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center">For Vendors</CardTitle>
              <CardDescription className="text-center">
                Manage your restaurant with AI-powered tools and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" size="lg" variant="outline" onClick={handleVendorLogin}>
                Vendor Login
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                AI menu builder • QR generator • Live orders
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Admin Panel</CardTitle>
              <CardDescription className="text-center">
                System management, analytics, and AI monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full" size="lg" variant="secondary" onClick={handleAdminAccess}>
                Admin Access
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Live heatmap • AI monitoring • Menu QA
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                🤖
              </div>
              <h3 className="font-semibold">AI Waiter</h3>
              <p className="text-sm text-gray-600">Intelligent menu recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                📱
              </div>
              <h3 className="font-semibold">Dynamic UI</h3>
              <p className="text-sm text-gray-600">Personalized ordering experience</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                📊
              </div>
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-gray-600">Real-time insights and heatmaps</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                🎯
              </div>
              <h3 className="font-semibold">Malta Focus</h3>
              <p className="text-sm text-gray-600">Built for Maltese hospitality</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
