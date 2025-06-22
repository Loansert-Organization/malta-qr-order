
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Utensils, 
  Brain, 
  QrCode, 
  Smartphone, 
  Users, 
  TrendingUp,
  MapPin,
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Utensils className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ICUPA Malta</h1>
                <p className="text-sm text-gray-600">AI-Powered Hospitality Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/vendor/register">For Restaurants</Link>
              </Button>
              <Button asChild>
                <Link to="/restaurants">Order Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Malta's
              <span className="text-blue-600"> Hospitality Industry</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Experience the future of dining with AI-powered ordering, personalized recommendations, 
              and seamless service across Malta's finest restaurants and bars.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/restaurants" className="flex items-center">
                  Browse Restaurants
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/vendor/register">Join as Restaurant</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Three Powerful Platforms in One
            </h3>
            <p className="text-xl text-gray-600">
              Designed for guests, vendors, and administrators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Client App */}
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">For Guests</CardTitle>
                <CardDescription>Mobile-first ordering experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">QR Code ordering</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">AI waiter assistant</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Location-aware recommendations</span>
                </div>
                <div className="pt-4">
                  <Button className="w-full" asChild>
                    <Link to="/restaurants">Start Ordering</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vendor App */}
            <Card className="border-2 hover:border-green-200 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">For Restaurants</CardTitle>
                <CardDescription>Complete management suite</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Utensils className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Menu management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Real-time orders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Analytics & insights</span>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <Link to="/vendor/register">Join Platform</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            <Card className="border-2 hover:border-purple-200 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">For Admins</CardTitle>
                <CardDescription>Platform oversight & control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Vendor management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">AI system monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <span className="text-sm">Platform analytics</span>
                </div>
                <div className="pt-4">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link to="/admin">Admin Access</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h3>
            <p className="text-xl text-gray-600">
              GPT-4o, Claude-4, and Gemini 2.5 Pro working together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Dynamic UI</h4>
              <p className="text-sm text-gray-600">AI-generated layouts based on context</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Smart Recommendations</h4>
              <p className="text-sm text-gray-600">Personalized menu suggestions</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Location Aware</h4>
              <p className="text-sm text-gray-600">Context-sensitive experiences</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">Real-time</h4>
              <p className="text-sm text-gray-600">Instant updates and responses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Restaurants</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Orders Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-200">Customer Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience the Future of Dining?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers and restaurant partners
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/restaurants">Browse Restaurants</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/vendor/register">Register Your Restaurant</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="h-6 w-6" />
                <span className="text-xl font-bold">ICUPA Malta</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing Malta's hospitality industry with AI-powered solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Guests</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/restaurants" className="hover:text-white">Browse Restaurants</Link></li>
                <li><Link to="/ai-verification" className="hover:text-white">AI Assistant</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Restaurants</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/vendor/register" className="hover:text-white">Join Platform</Link></li>
                <li><Link to="/vendor/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/admin" className="hover:text-white">Admin Panel</Link></li>
                <li><Link to="/pwa" className="hover:text-white">PWA Features</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ICUPA Malta. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
