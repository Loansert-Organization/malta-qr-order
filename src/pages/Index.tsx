
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Users, BarChart, MapPin, QrCode, Utensils } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">ICUPA Malta</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionizing hospitality with AI-powered ordering, seamless guest experiences, 
            and intelligent vendor management across Malta's finest restaurants and bars.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link to="/restaurants">
                <Utensils className="mr-2 h-5 w-5" />
                Browse Restaurants
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <Link to="/vendor">
                <Users className="mr-2 h-5 w-5" />
                Vendor Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>AI-Powered Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Smart menu recommendations, voice search, and an autonomous AI waiter 
                that understands your preferences and dietary needs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <QrCode className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Seamless QR Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simply scan a QR code to access menus, place orders, and pay - 
                no app downloads or account creation required.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete suite of tools for restaurant owners including menu management, 
                order tracking, and AI-powered analytics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Malta-Focused</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Specially designed for Malta's hospitality scene with localized features, 
                multilingual support, and weather-aware recommendations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time insights into customer behavior, menu performance, 
                and revenue optimization powered by advanced AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
              <CardTitle>Anonymous-First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Start ordering immediately without creating accounts. 
                Privacy-focused design that puts user comfort first.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Whether you're a guest looking to order or a restaurant owner wanting to join our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/restaurants">Start Ordering</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/register">Join as Vendor</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
