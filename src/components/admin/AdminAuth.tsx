
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthModal from '@/components/auth/AuthModal';
import { LogIn, Shield } from 'lucide-react';

interface AdminAuthProps {
  user: any;
  profile: { role: string } | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loading: boolean;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ 
  user, 
  profile, 
  authModalOpen, 
  setAuthModalOpen, 
  loading 
}) => {
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Please sign in with your administrator credentials to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setAuthModalOpen(true)}
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In as Admin
            </Button>
          </CardContent>
        </Card>

        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultTab="signin"
        />
      </div>
    );
  }

  // Check if user has admin role
  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have administrator privileges. Please contact your system administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AdminAuth;
