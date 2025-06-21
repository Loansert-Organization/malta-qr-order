
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Store, Bot, Smartphone } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to ICUPA Malta
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The future of hospitality is here. Experience AI-powered dining with smart menus, 
            autonomous waiters, and seamless ordering across Malta's best restaurants and bars.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link to="/restaurants">
                <Store className="mr-2 h-5 w-5" />
                Explore Restaurants
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link to="/register">
                Join as Restaurant
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <QrCode className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>QR Code Ordering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simply scan a QR code at your table to instantly access the menu and place orders. 
                No app downloads or sign-ups required.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Bot className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>AI Waiter Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get personalized recommendations from our AI waiter that understands your preferences 
                and dietary requirements.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Smart Menu Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Dynamic menus that adapt to weather, time of day, and your preferences. 
                See what's popular and get real-time recommendations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience the Future of Dining?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of guests who are already enjoying AI-powered hospitality in Malta.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link to="/restaurants">
              Start Ordering Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
