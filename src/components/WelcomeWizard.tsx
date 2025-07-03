import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, Store, Shield, Users } from 'lucide-react';

const WelcomeWizard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("WelcomeWizard loaded");
    
    // Check if user has already selected a role
    const savedRole = localStorage.getItem('icupa_user_role');
    const hasSeenWelcome = localStorage.getItem('icupa_welcome_seen');
    
    if (savedRole && hasSeenWelcome) {
      // Auto-redirect based on saved role
      switch (savedRole) {
        case 'client':
          navigate('/client');
          break;
        case 'vendor':
          navigate('/vendor');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    }
  }, [navigate]);

  const handleRoleSelection = (role: 'client' | 'vendor' | 'admin') => {
    console.log(`Role selected: ${role}`);
    
    // Save role selection
    localStorage.setItem('icupa_user_role', role);
    localStorage.setItem('icupa_welcome_seen', 'true');
    
    // Navigate based on role
    switch (role) {
      case 'client':
        navigate('/client');
        break;
      case 'vendor':
        navigate('/vendor');
        break;
      case 'admin':
        navigate('/admin');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to ICUPA
          </h1>
          <p className="text-lg text-gray-600">
            Choose how you want to use the app
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Client Option */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => handleRoleSelection('client')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">I'm a Customer</h3>
              <p className="text-gray-600 mb-4">
                Browse restaurants, view menus, and order food
              </p>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('client');
                }}
              >
                Continue as Customer
              </Button>
            </CardContent>
          </Card>

          {/* Vendor Option */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => handleRoleSelection('vendor')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">I'm a Restaurant</h3>
              <p className="text-gray-600 mb-4">
                Manage menu, orders, and grow your business
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('vendor');
                }}
              >
                Continue as Vendor
              </Button>
            </CardContent>
          </Card>

          {/* Admin Option */}
          <Card 
            className="hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => handleRoleSelection('admin')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">I'm an Admin</h3>
              <p className="text-gray-600 mb-4">
                Access system management and analytics
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelection('admin');
                }}
              >
                Continue as Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Skip Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              console.log("Skip clicked - going to client view");
              navigate('/client');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip and browse as guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeWizard; 