import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { MapPin, Store, Shield, Users, Smartphone, Globe } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ICUPA
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            AI-Powered Hospitality Platform
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Revolutionizing bars and restaurants across Malta & Rwanda with smart ordering, AI assistance, and seamless payments
          </p>
        </div>

        {/* Main Portals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {/* Client Portal - Featured */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <MapPin className="h-8 w-8" />
                    Browse Bars & Restaurants
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-lg mt-2">
                    Discover nearby venues, browse menus, and order with ease
                  </CardDescription>
                </div>
                <Smartphone className="h-16 w-16 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1">
                  <ul className="space-y-2 text-blue-100 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="text-white">✓</span> Find bars & restaurants on interactive map
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-white">✓</span> Browse menus with photos & descriptions
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-white">✓</span> Order & pay seamlessly (MoMo/Revolut)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-white">✓</span> Track your order in real-time
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => navigate('/client')}
                  >
                    <Globe className="mr-2 h-5 w-5" />
                    Open Client App
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white/20"
                    onClick={() => navigate('/order/demo-restaurant')}
                  >
                    Try Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Portal */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Store className="h-6 w-6 text-purple-600" />
                Vendor Dashboard
              </CardTitle>
              <CardDescription>
                Manage your restaurant with AI-powered tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li>• AI menu builder & optimization</li>
                <li>• QR code generator</li>
                <li>• Live order management</li>
                <li>• Analytics & insights</li>
              </ul>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/vendor')}
              >
                Access Vendor Portal
              </Button>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Admin Panel
              </CardTitle>
              <CardDescription>
                System management and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li>• Live system heatmap</li>
                <li>• AI performance monitoring</li>
                <li>• Vendor approval system</li>
                <li>• Platform analytics</li>
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

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold">AI Waiter</h3>
              <p className="text-sm text-gray-600">Smart recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold">PWA Ready</h3>
              <p className="text-sm text-gray-600">Works offline</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-semibold">Easy Payments</h3>
              <p className="text-sm text-gray-600">MoMo & Revolut</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-semibold">Multi-Region</h3>
              <p className="text-sm text-gray-600">Malta & Rwanda</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>© 2024 ICUPA. Built with ❤️ for Malta & Rwanda hospitality industry</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
