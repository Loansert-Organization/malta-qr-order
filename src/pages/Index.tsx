
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  QrCode, 
  Smartphone, 
  Bot, 
  TrendingUp, 
  Store, 
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Ordering',
      description: 'Scan and order instantly from any table'
    },
    {
      icon: Bot,
      title: 'AI Waiter Assistant',
      description: 'Get personalized recommendations with Kai'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience on any device'
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'AI-powered insights for vendors'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Hospitality Platform
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Malta's
              <span className="text-blue-600"> Bar & Restaurant</span> Experience
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              ICUPA Malta transforms how guests order and how venues operate with cutting-edge AI, 
              seamless QR ordering, and intelligent insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/order/demo'}>
                Try Demo Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/register'}>
                <Store className="mr-2 h-5 w-5" />
                Join as Vendor
              </Button>
            </div>

            {user && profile && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800">
                  Welcome back, {profile.full_name || user.email}! 
                  {profile.role === 'vendor' && (
                    <> <a href="/vendor" className="underline font-semibold">Go to your dashboard</a></>
                  )}
                  {profile.role === 'admin' && (
                    <> <a href="/admin" className="underline font-semibold">Go to admin panel</a></>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ICUPA Malta?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of hospitality with our AI-first platform designed specifically for Malta's vibrant food scene.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Venues</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Orders Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Malta's leading hospitality platform and start serving smarter today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => window.location.href = '/register'}>
              <Users className="mr-2 h-5 w-5" />
              Register Your Venue
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 text-white border-white hover:bg-white hover:text-blue-600" onClick={() => window.location.href = '/order/demo'}>
              See Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
