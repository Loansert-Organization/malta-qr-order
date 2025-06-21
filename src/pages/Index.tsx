
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, MessageCircle, BarChart3, Users, Smartphone, Zap, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const [activeDemo, setActiveDemo] = useState('client');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-amber-500 p-2 rounded-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
                ICUPA MALTA
              </span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link to="/order/demo" className="text-gray-600 hover:text-blue-600 transition-colors">
                Demo Order
              </Link>
              <Link to="/vendor" className="text-gray-600 hover:text-blue-600 transition-colors">
                For Vendors
              </Link>
              <Link to="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-amber-500 bg-clip-text text-transparent">
            The Future of Hospitality
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            AI-powered QR ordering platform transforming Malta's dining experience. 
            Scan, Chat, Order - It's that simple.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg">
              <Link to="/order/demo">Try Demo Order</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg">
              <Link to="/vendor">Vendor Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Three Powerful Platforms, One Ecosystem
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-blue-100">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Client App</h3>
                <p className="text-gray-600 mb-6">
                  Scan QR codes, chat with AI waiters, and place orders seamlessly. No app download required.
                </p>
                <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Link to="/order/demo">Try Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-amber-100">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Vendor Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Manage menus, track orders, generate QR posters, and get AI-powered insights.
                </p>
                <Button asChild variant="outline" className="border-amber-200 text-amber-600 hover:bg-amber-50">
                  <Link to="/vendor">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-green-100">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-full w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Admin Panel</h3>
                <p className="text-gray-600 mb-6">
                  Oversee the entire platform, manage vendors, monitor AI performance, and analytics.
                </p>
                <Button asChild variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                  <Link to="/admin">View Demo</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Powered by Advanced AI</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Multiple AI models work together to create the perfect dining experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">GPT-4o Waiter</h3>
              <p className="text-sm text-gray-600">Intelligent conversation and order reasoning</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Claude-4 Tone</h3>
              <p className="text-sm text-gray-600">Perfect personalization and local language</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Gemini Design</h3>
              <p className="text-sm text-gray-600">Dynamic layout optimization</p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Pinecone Memory</h3>
              <p className="text-sm text-gray-600">Semantic search and preferences</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="bg-gradient-to-r from-blue-600 to-amber-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the hospitality revolution in Malta. Start with our demo or get your venue onboarded today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6">
              <Link to="/order/demo">Experience Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6">
              <Link to="/vendor">List Your Venue</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <QrCode className="h-6 w-6 text-amber-500" />
                <span className="text-xl font-bold">ICUPA MALTA</span>
              </div>
              <p className="text-gray-400">
                Revolutionizing Malta's hospitality industry with AI-powered ordering.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/order/demo" className="hover:text-white transition-colors">Demo Order</Link></li>
                <li><Link to="/vendor" className="hover:text-white transition-colors">Vendor Portal</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>QR Code Ordering</li>
                <li>AI Waiter Chat</li>
                <li>Real-time Updates</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Malta Only</li>
                <li>Stripe Payments</li>
                <li>Revolut Integration</li>
                <li>24/7 AI Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ICUPA MALTA. Transforming hospitality across Malta.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
