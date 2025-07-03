import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { MapPin, Store, Shield, Users, Smartphone, Globe, ChefHat } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ICUPA
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Smart Dining Experience
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover bars and restaurants across Malta & Rwanda with AI-powered ordering and seamless payments
          </p>
        </div>

        {/* Main Client Portal - Featured */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl mb-2">
                Start Exploring
              </CardTitle>
              <CardDescription className="text-orange-100 text-lg">
                Browse nearby venues, view menus, and order instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-orange-100">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Find Places</p>
                    <p className="text-xs">Discover nearby bars & restaurants</p>
                  </div>
                  <div className="text-center">
                    <Smartphone className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Browse Menus</p>
                    <p className="text-xs">View photos, prices & details</p>
                  </div>
                  <div className="text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-medium">Order & Pay</p>
                    <p className="text-xs">Secure payment with MoMo/Revolut</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold"
                    onClick={() => navigate('/client')}
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Open Client App
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white/20 px-8 py-4 text-lg"
                    onClick={() => navigate('/order/demo-restaurant')}
                  >
                    Try Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {/* Vendor Portal */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-orange-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-600" />
                For Restaurants
              </CardTitle>
              <CardDescription>
                Manage your establishment with smart tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li>• AI-powered menu builder</li>
                <li>• QR code generation</li>
                <li>• Real-time order management</li>
                <li>• Analytics & insights</li>
              </ul>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600" 
                onClick={() => navigate('/vendor')}
              >
                Access Vendor Portal
              </Button>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                System management and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li>• Platform overview & analytics</li>
                <li>• Vendor approval system</li>
                <li>• AI performance monitoring</li>
                <li>• System health dashboard</li>
              </ul>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Features */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Why Choose ICUPA?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-600">Smart recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900">Mobile First</h3>
              <p className="text-sm text-gray-600">Works offline</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold text-gray-900">Easy Payments</h3>
              <p className="text-sm text-gray-600">MoMo & Revolut</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold text-gray-900">Multi-Region</h3>
              <p className="text-sm text-gray-600">Malta & Rwanda</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>© 2024 ICUPA. Bringing smart dining to Malta & Rwanda</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
